import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Exchange rate (approximate - in production, fetch from API)
const USD_TO_KHR_RATE = 4100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, orderId, invoiceId, description, userId } = await req.json();

    console.log("Generating BakongKHQR for order:", orderId);

    if (!amount || !orderId) {
      throw new Error("Missing required fields: amount, orderId");
    }

    // Get gateway config for merchant details
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: gatewayConfig } = await supabase
      .from("payment_gateways")
      .select("config")
      .eq("slug", "bakong")
      .maybeSingle();

    const config = (gatewayConfig?.config as Record<string, any>) || {};
    const merchantId = config.merchantId || "merchant@bakong";
    const merchantName = config.merchantName || "GameHost";
    const merchantCity = config.merchantCity || "Phnom Penh";
    const accountNumber = config.accountNumber || "";

    // Determine currency and amount
    const finalCurrency = currency || config.currency || "USD";
    let finalAmount = amount;
    
    // Convert to KHR if configured
    if (config.currency === "KHR" && currency === "USD") {
      finalAmount = Math.round(amount * USD_TO_KHR_RATE);
    }

    // Generate KHQR payload using proper EMVCo format
    const khqrPayload = {
      merchantId: merchantId,
      merchantName: merchantName,
      merchantCity: merchantCity,
      merchantCountry: "KH",
      currency: config.currency || finalCurrency,
      amount: finalAmount.toFixed(config.currency === "KHR" ? 0 : 2),
      transactionId: orderId.substring(0, 25),
      additionalData: description || `Order ${orderId.substring(0, 20)}`,
      accountNumber: accountNumber,
    };

    // Generate QR code string (EMVCo format for KHQR)
    const qrString = generateKHQRString(khqrPayload);
    
    // Generate QR code image as base64
    const qrCodeBase64 = await generateQRCodeImage(qrString);

    // Store payment record
    if (userId) {
      await supabase.from("payments").insert({
        amount: finalAmount,
        currency: config.currency || finalCurrency,
        status: "pending",
        invoice_id: invoiceId || null,
        user_id: userId,
        transaction_id: orderId,
        gateway_response: { khqr_payload: khqrPayload },
      });
    }

    console.log("QR code generated successfully for order:", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        qrCode: qrCodeBase64,
        qrString: qrString,
        transactionId: orderId,
        currency: config.currency || finalCurrency,
        amount: finalAmount,
        exchangeRate: config.currency === "KHR" && currency === "USD" ? USD_TO_KHR_RATE : null,
        originalAmount: amount,
        originalCurrency: currency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error generating BakongKHQR:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateKHQRString(payload: any): string {
  // EMVCo QR Code format for KHQR (Bakong standard)
  let qrString = "";
  
  // Payload Format Indicator (ID: 00)
  qrString += "000201";
  
  // Point of Initiation Method (ID: 01) - 12 = Dynamic QR
  qrString += "010212";
  
  // Merchant Account Information (ID: 29 for KHQR)
  // Contains merchant ID and acquiring bank
  const bakongId = "0006bakong"; // Acquiring institution ID
  const merchantAcct = payload.merchantId.length.toString().padStart(2, "0") + payload.merchantId;
  const merchantInfo = bakongId + "01" + merchantAcct;
  qrString += "29" + merchantInfo.length.toString().padStart(2, "0") + merchantInfo;
  
  // Merchant Category Code (ID: 52) - 5411 = Grocery/Retail
  qrString += "52045411";
  
  // Transaction Currency (ID: 53) - 840 = USD, 116 = KHR
  const currencyCode = payload.currency === "USD" ? "840" : "116";
  qrString += "5303" + currencyCode;
  
  // Transaction Amount (ID: 54)
  const amountStr = payload.amount.toString();
  qrString += "54" + amountStr.length.toString().padStart(2, "0") + amountStr;
  
  // Country Code (ID: 58)
  qrString += "5802KH";
  
  // Merchant Name (ID: 59)
  const merchantName = payload.merchantName.substring(0, 25);
  qrString += "59" + merchantName.length.toString().padStart(2, "0") + merchantName;
  
  // Merchant City (ID: 60)
  const merchantCity = payload.merchantCity.substring(0, 15);
  qrString += "60" + merchantCity.length.toString().padStart(2, "0") + merchantCity;
  
  // Additional Data Field (ID: 62)
  // Bill Number (sub-ID: 01)
  const billNumber = payload.transactionId.substring(0, 25);
  const additionalData = "01" + billNumber.length.toString().padStart(2, "0") + billNumber;
  qrString += "62" + additionalData.length.toString().padStart(2, "0") + additionalData;
  
  // CRC placeholder (ID: 63)
  qrString += "6304";
  
  // Calculate CRC16-CCITT
  const crc = calculateCRC16(qrString);
  qrString += crc;
  
  return qrString;
}

function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

async function generateQRCodeImage(data: string): Promise<string> {
  // Use a QR code generation API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  
  const response = await fetch(qrApiUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  return base64;
}
