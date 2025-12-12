import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BAKONG_TOKEN = Deno.env.get("BAKONG_TOKEN");

// Bakong API endpoints
const BAKONG_API_URL = "https://api-bakong.nbc.gov.kh";

// Exchange rate (approximate - in production, fetch from API)
const USD_TO_KHR_RATE = 4100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, orderId, invoiceId, description, userId, action } = await req.json();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Handle payment status check
    if (action === "check-payment") {
      console.log("Checking payment status for order:", orderId);
      
      if (!BAKONG_TOKEN) {
        throw new Error("BAKONG_TOKEN not configured");
      }

      // Get the payment record to find the md5 hash
      const { data: payment } = await supabase
        .from("payments")
        .select("gateway_response")
        .eq("transaction_id", orderId)
        .maybeSingle();

      const md5Hash = (payment?.gateway_response as any)?.md5_hash;
      if (!md5Hash) {
        throw new Error("No MD5 hash found for this transaction");
      }

      // Check transaction status via Bakong API
      const checkResponse = await fetch(`${BAKONG_API_URL}/v1/check_transaction_by_md5`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BAKONG_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ md5: md5Hash }),
      });

      const checkResult = await checkResponse.json();
      console.log("Bakong check result:", checkResult);

      return new Response(
        JSON.stringify({
          success: true,
          status: checkResult.responseCode === 0 ? "paid" : "pending",
          data: checkResult,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating BakongKHQR for order:", orderId);

    if (!amount || !orderId) {
      throw new Error("Missing required fields: amount, orderId");
    }

    // Get gateway config for merchant details
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
    const configCurrency = config.currency || "USD";

    // Determine currency and amount
    const finalCurrency = configCurrency;
    let finalAmount = amount;
    
    // Convert to KHR if configured
    if (configCurrency === "KHR" && currency === "USD") {
      finalAmount = Math.round(amount * USD_TO_KHR_RATE);
    }

    // Generate KHQR payload using proper EMVCo format
    const khqrPayload = {
      merchantId: merchantId,
      merchantName: merchantName,
      merchantCity: merchantCity,
      merchantCountry: "KH",
      currency: finalCurrency,
      amount: finalAmount.toFixed(finalCurrency === "KHR" ? 0 : 2),
      transactionId: orderId.substring(0, 25),
      additionalData: description || `Order ${orderId.substring(0, 20)}`,
      accountNumber: accountNumber,
    };

    // Generate QR code string (EMVCo format for KHQR)
    const qrString = generateKHQRString(khqrPayload);
    
    // Generate MD5 hash for payment verification
    const encoder = new TextEncoder();
    const data = encoder.encode(qrString);
    const hashBuffer = await crypto.subtle.digest("MD5", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const md5Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Generate QR code image as base64
    const qrCodeBase64 = await generateQRCodeImage(qrString);

    // Store payment record with MD5 hash
    if (userId) {
      await supabase.from("payments").insert({
        amount: finalAmount,
        currency: finalCurrency,
        status: "pending",
        invoice_id: invoiceId || null,
        user_id: userId,
        transaction_id: orderId,
        gateway_response: { 
          khqr_payload: khqrPayload,
          md5_hash: md5Hash,
          qr_string: qrString,
        },
      });
    }

    console.log("QR code generated successfully for order:", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        qrCode: qrCodeBase64,
        qrString: qrString,
        md5Hash: md5Hash,
        transactionId: orderId,
        currency: finalCurrency,
        amount: finalAmount,
        exchangeRate: finalCurrency === "KHR" && currency === "USD" ? USD_TO_KHR_RATE : null,
        originalAmount: amount,
        originalCurrency: currency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in bakong-qr:", error);
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
  const bakongId = "0006bakong";
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
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  
  const response = await fetch(qrApiUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  return base64;
}
