import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BAKONG_MERCHANT_ID = Deno.env.get("BAKONG_MERCHANT_ID");
const BAKONG_API_KEY = Deno.env.get("BAKONG_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, orderId, invoiceId, description } = await req.json();

    console.log("Generating BakongKHQR for order:", orderId);

    if (!amount || !orderId) {
      throw new Error("Missing required fields: amount, orderId");
    }

    // Generate KHQR payload
    // BakongKHQR format: https://www.bakong.nbc.gov.kh/
    const khqrPayload = {
      merchantId: BAKONG_MERCHANT_ID,
      merchantName: "GameHost",
      merchantCity: "Phnom Penh",
      merchantCountry: "KH",
      currency: currency || "USD",
      amount: amount.toFixed(2),
      transactionId: orderId,
      additionalData: description || `Order ${orderId}`,
    };

    // Generate QR code string (EMVCo format for KHQR)
    const qrString = generateKHQRString(khqrPayload);
    
    // Generate QR code image as base64
    const qrCodeBase64 = await generateQRCodeImage(qrString);

    // Store payment record
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    await supabase.from("payments").insert({
      amount,
      currency: currency || "USD",
      status: "pending",
      invoice_id: invoiceId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      transaction_id: orderId,
      gateway_response: { khqr_payload: khqrPayload },
    });

    console.log("QR code generated successfully for order:", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        qrCode: qrCodeBase64,
        qrString: qrString,
        transactionId: orderId,
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
  // EMVCo QR Code format for KHQR
  // Reference: https://www.emvco.com/emv-technologies/qrcodes/
  
  let qrString = "";
  
  // Payload Format Indicator
  qrString += "000201";
  
  // Point of Initiation Method (12 = Dynamic QR)
  qrString += "010212";
  
  // Merchant Account Information (Tag 29 for KHQR)
  const merchantInfo = 
    "0016" + payload.merchantId + 
    "0115" + payload.merchantName.substring(0, 15);
  qrString += "29" + merchantInfo.length.toString().padStart(2, "0") + merchantInfo;
  
  // Merchant Category Code
  qrString += "52045411";
  
  // Transaction Currency (840 = USD, 116 = KHR)
  const currencyCode = payload.currency === "USD" ? "840" : "116";
  qrString += "5303" + currencyCode;
  
  // Transaction Amount
  const amountStr = payload.amount.toString();
  qrString += "54" + amountStr.length.toString().padStart(2, "0") + amountStr;
  
  // Country Code
  qrString += "5802KH";
  
  // Merchant Name
  const merchantName = payload.merchantName.substring(0, 25);
  qrString += "59" + merchantName.length.toString().padStart(2, "0") + merchantName;
  
  // Merchant City
  const merchantCity = payload.merchantCity.substring(0, 15);
  qrString += "60" + merchantCity.length.toString().padStart(2, "0") + merchantCity;
  
  // Additional Data (Reference/Bill Number)
  const refNumber = payload.transactionId.substring(0, 25);
  const additionalData = "05" + refNumber.length.toString().padStart(2, "0") + refNumber;
  qrString += "62" + additionalData.length.toString().padStart(2, "0") + additionalData;
  
  // CRC placeholder
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
