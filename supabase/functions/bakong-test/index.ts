import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BAKONG_MERCHANT_ID = Deno.env.get("BAKONG_MERCHANT_ID");
const BAKONG_API_KEY = Deno.env.get("BAKONG_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Testing Bakong credentials...");
    
    // Check if credentials are configured
    if (!BAKONG_MERCHANT_ID || !BAKONG_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bakong credentials not configured",
          merchantIdConfigured: !!BAKONG_MERCHANT_ID,
          apiKeyConfigured: !!BAKONG_API_KEY,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Test generating a sample KHQR
    const testPayload = {
      merchantId: BAKONG_MERCHANT_ID,
      merchantName: "Test Merchant",
      merchantCity: "Phnom Penh",
      currency: "USD",
      amount: "1.00",
      transactionId: "TEST-" + Date.now(),
    };

    // Generate test QR string
    const qrString = generateKHQRString(testPayload);
    
    console.log("Bakong test successful");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bakong credentials configured successfully",
        merchantId: BAKONG_MERCHANT_ID.substring(0, 4) + "****",
        testQRGenerated: true,
        qrStringLength: qrString.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Bakong test error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateKHQRString(payload: any): string {
  let qrString = "";
  qrString += "000201";
  qrString += "010212";
  
  const merchantInfo = 
    "0016" + payload.merchantId + 
    "0115" + payload.merchantName.substring(0, 15);
  qrString += "29" + merchantInfo.length.toString().padStart(2, "0") + merchantInfo;
  
  qrString += "52045411";
  const currencyCode = payload.currency === "USD" ? "840" : "116";
  qrString += "5303" + currencyCode;
  
  const amountStr = payload.amount.toString();
  qrString += "54" + amountStr.length.toString().padStart(2, "0") + amountStr;
  
  qrString += "5802KH";
  
  const merchantName = payload.merchantName.substring(0, 25);
  qrString += "59" + merchantName.length.toString().padStart(2, "0") + merchantName;
  
  const merchantCity = payload.merchantCity.substring(0, 15);
  qrString += "60" + merchantCity.length.toString().padStart(2, "0") + merchantCity;
  
  const refNumber = payload.transactionId.substring(0, 25);
  const additionalData = "05" + refNumber.length.toString().padStart(2, "0") + refNumber;
  qrString += "62" + additionalData.length.toString().padStart(2, "0") + additionalData;
  
  qrString += "6304";
  
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
