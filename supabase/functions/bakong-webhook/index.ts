import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BAKONG_API_KEY = Deno.env.get("BAKONG_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const payload = await req.json();
    console.log("Received Bakong webhook:", JSON.stringify(payload));

    // Verify webhook signature if provided
    const signature = req.headers.get("x-bakong-signature");
    if (signature && BAKONG_API_KEY) {
      // Verify signature matches expected format
      // Implementation depends on Bakong's specific signature method
      console.log("Webhook signature received:", signature);
    }

    const { transactionId, status, amount, currency, reference } = payload;

    if (!transactionId) {
      throw new Error("Missing transactionId in webhook payload");
    }

    // Find the order by transaction ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", transactionId);
      throw new Error("Order not found");
    }

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: status === "SUCCESS" ? "completed" : "failed",
        transaction_id: reference || transactionId,
        gateway_response: payload,
      })
      .eq("transaction_id", transactionId);

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
    }

    if (status === "SUCCESS") {
      // Update order status
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", transactionId);

      if (orderUpdateError) {
        console.error("Error updating order:", orderUpdateError);
      }

      // Update invoice status
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({ 
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: "bakong",
          transaction_id: reference || transactionId,
        })
        .eq("order_id", transactionId);

      if (invoiceError) {
        console.error("Error updating invoice:", invoiceError);
      }

      console.log("Payment successful, order updated:", transactionId);

      // Trigger server provisioning
      try {
        const pterodactylResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/pterodactyl`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              action: "create",
              orderId: transactionId,
              serverDetails: order.server_details,
            }),
          }
        );

        const pterodactylResult = await pterodactylResponse.json();
        console.log("Pterodactyl provisioning result:", pterodactylResult);
      } catch (provisionError) {
        console.error("Error triggering server provisioning:", provisionError);
        // Don't fail the webhook - manual provisioning can be done later
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
