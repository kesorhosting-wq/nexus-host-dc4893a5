import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const { action, orderId, userId, items, dueDate, notes } = await req.json();

    console.log(`Invoice generator action: ${action}`);

    switch (action) {
      case "create": {
        // Create invoice from order
        const result = await createInvoice(supabase, { orderId, userId, items, dueDate, notes });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "generate-renewal": {
        // Generate renewal invoices for orders due soon
        const result = await generateRenewalInvoices(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "check-overdue": {
        // Check for overdue invoices and suspend services
        const result = await checkOverdueInvoices(supabase);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("Invoice generator error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function createInvoice(
  supabase: any,
  params: {
    orderId?: string;
    userId: string;
    items?: Array<{ description: string; quantity: number; unitPrice: number }>;
    dueDate?: string;
    notes?: string;
  }
) {
  const { orderId, userId, items, dueDate, notes } = params;

  let invoiceItems = items || [];
  let subtotal = 0;

  // If orderId provided, get order details
  if (orderId) {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    invoiceItems = [
      {
        description: order.products?.name || "Game Server Hosting",
        quantity: 1,
        unitPrice: order.price,
      },
    ];
    subtotal = order.price;
  } else if (items && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  // Calculate due date (default 7 days from now)
  const calculatedDueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      user_id: userId,
      order_id: orderId || null,
      subtotal,
      total: subtotal,
      due_date: calculatedDueDate,
      notes,
      status: "unpaid",
    })
    .select()
    .single();

  if (invoiceError) {
    console.error("Failed to create invoice:", invoiceError);
    throw new Error("Failed to create invoice");
  }

  // Create invoice items
  for (const item of invoiceItems) {
    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
    });
  }

  console.log("Invoice created:", invoiceNumber);

  return {
    success: true,
    invoice: {
      id: invoice.id,
      invoiceNumber,
      total: subtotal,
      dueDate: calculatedDueDate,
    },
  };
}

async function generateRenewalInvoices(supabase: any) {
  console.log("Generating renewal invoices...");

  // Find orders due within the next 7 days that don't have pending invoices
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, products(*)")
    .eq("status", "active")
    .gte("next_due_date", today)
    .lte("next_due_date", sevenDaysFromNow);

  if (ordersError) {
    throw new Error("Failed to fetch orders");
  }

  const generatedInvoices = [];

  for (const order of orders || []) {
    // Check if renewal invoice already exists for this period
    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("order_id", order.id)
      .eq("status", "unpaid")
      .single();

    if (existingInvoice) {
      console.log(`Renewal invoice already exists for order ${order.id}`);
      continue;
    }

    // Create renewal invoice
    const result = await createInvoice(supabase, {
      orderId: order.id,
      userId: order.user_id,
      dueDate: order.next_due_date,
      notes: `Renewal for billing period starting ${order.next_due_date}`,
    });

    generatedInvoices.push(result.invoice);
    console.log(`Generated renewal invoice for order ${order.id}`);
  }

  return {
    success: true,
    generatedCount: generatedInvoices.length,
    invoices: generatedInvoices,
  };
}

async function checkOverdueInvoices(supabase: any) {
  console.log("Checking for overdue invoices...");

  const today = new Date().toISOString();

  // Find overdue unpaid invoices
  const { data: overdueInvoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("*, orders(*)")
    .eq("status", "unpaid")
    .lt("due_date", today);

  if (invoicesError) {
    throw new Error("Failed to fetch overdue invoices");
  }

  const suspendedOrders = [];
  const remindersSent = [];

  for (const invoice of overdueInvoices || []) {
    const dueDate = new Date(invoice.due_date);
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (24 * 60 * 60 * 1000));

    console.log(`Invoice ${invoice.invoice_number} is ${daysOverdue} days overdue`);

    // If more than 3 days overdue and has an active order, mark for suspension
    if (daysOverdue > 3 && invoice.order_id && invoice.orders?.status === "active") {
      // Update order status to suspended
      await supabase
        .from("orders")
        .update({ status: "suspended" })
        .eq("id", invoice.order_id);

      suspendedOrders.push({
        orderId: invoice.order_id,
        invoiceNumber: invoice.invoice_number,
        daysOverdue,
      });

      // Try to suspend server in Pterodactyl (if configured)
      try {
        const { data: config } = await supabase
          .from("server_integrations")
          .select("*")
          .eq("type", "pterodactyl")
          .eq("enabled", true)
          .single();

        if (config && invoice.orders?.server_id) {
          // Call pterodactyl function to suspend
          console.log(`Would suspend server ${invoice.orders.server_id} via Pterodactyl`);
        }
      } catch (e) {
        console.log("Pterodactyl not configured for auto-suspension");
      }
    }

    // Update invoice status to overdue
    await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .eq("id", invoice.id);
  }

  return {
    success: true,
    overdueCount: overdueInvoices?.length || 0,
    suspendedCount: suspendedOrders.length,
    suspendedOrders,
  };
}
