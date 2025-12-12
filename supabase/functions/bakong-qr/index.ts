import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BAKONG_TOKEN = Deno.env.get("BAKONG_TOKEN");

const BAKONG_API_URL = "https://api-bakong.nbc.gov.kh";
const USD_TO_KHR_RATE = 4100;

/* ---------------------------------------------------------
   PURE JAVASCRIPT MD5 (WORKS IN SUPABASE EDGE FUNCTIONS)
--------------------------------------------------------- */
function md5(str: string) {
  function L(k: number, d: number) {
    return (k << d) | (k >>> (32 - d));
  }
  function K(G: number, k: number) {
    return (G + k) & 0xffffffff;
  }
  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = K(a, K(K(F(b, c, d), x), ac));
    return K(L(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = K(a, K(K(G(b, c, d), x), ac));
    return K(L(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = K(a, K(K(H(b, c, d), x), ac));
    return K(L(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = K(a, K(K(I(b, c, d), x), ac));
    return K(L(a, s), b);
  }

  function toWordArray(str: string) {
    const l = str.length;
    const n = (((l + 8) >> 6) + 1) * 16;
    const wordArray = new Array(n - 1).fill(0);

    let byteCount = 0;
    while (byteCount < l) {
      const idx = (byteCount >> 2);
      const shift = (byteCount % 4) * 8;
      wordArray[idx] |= str.charCodeAt(byteCount) << shift;
      byteCount++;
    }

    const idx = (byteCount >> 2);
    const shift = (byteCount % 4) * 8;
    wordArray[idx] |= 0x80 << shift;

    wordArray[n - 2] = l << 3;
    return wordArray;
  }

  function toHex(num: number) {
    let hex = "";
    for (let j = 0; j <= 3; j++) {
      const b = (num >> (j * 8)) & 255;
      hex += ("0" + b.toString(16)).slice(-2);
    }
    return hex;
  }

  const x = toWordArray(str);
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    let [aa, bb, cc, dd] = [a, b, c, d];

    a = FF(a, b, c, d, x[i + 0], 7, -680876936);
    d = FF(d, a, b, c, x[i + 1], 12, -389564586);
    c = FF(c, d, a, b, x[i + 2], 17, 606105819);
    b = FF(b, c, d, a, x[i + 3], 22, -1044525330);

    a = FF(a, b, c, d, x[i + 4], 7, -176418897);
    d = FF(d, a, b, c, x[i + 5], 12, 1200080426);
    c = FF(c, d, a, b, x[i + 6], 17, -1473231341);
    b = FF(b, c, d, a, x[i + 7], 22, -45705983);

    a = GG(a, b, c, d, x[i + 1], 5, -165796510);
    d = GG(d, a, b, c, x[i + 6], 9, -1069501632);
    c = GG(c, d, a, b, x[i + 11], 14, 643717713);
    b = GG(b, c, d, a, x[i + 0], 20, -373897302);

    a = HH(a, b, c, d, x[i + 5], 4, -701558691);
    d = HH(d, a, b, c, x[i + 8], 11, 38016083);
    c = HH(c, d, a, b, x[i + 11], 16, -660478335);
    b = HH(b, c, d, a, b, x[i + 14], 23, -405537848);

    a = II(a, b, c, d, x[i + 0], 6, 76029189);
    d = II(d, a, b, c, x[i + 7], 10, -640364487);
    c = II(c, d, a, b, x[i + 14], 15, -421815835);
    b = II(b, c, d, a, b, x[i + 5], 21, 530742520);

    a = K(a, aa);
    b = K(b, bb);
    c = K(c, cc);
    d = K(d, dd);
  }

  return (toHex(a) + toHex(b) + toHex(c) + toHex(d)).toLowerCase();
}

/* ---------------------------------------------------------
   KHQR GENERATOR (UNTOUCHED)
--------------------------------------------------------- */
function generateKHQRString(payload: any): string {
  let qrString = "";

  qrString += "000201";
  qrString += "010212";

  const bakongId = "0006bakong";
  const merchantAcct = payload.merchantId.length.toString().padStart(2, "0") + payload.merchantId;
  const merchantInfo = bakongId + "01" + merchantAcct;

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

  const billNumber = payload.transactionId.substring(0, 25);
  const additionalData = "01" + billNumber.length.toString().padStart(2, "0") + billNumber;
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

/* ---------------------------------------------------------
   QR IMAGE GENERATOR
--------------------------------------------------------- */
async function generateQRCodeImage(data: string): Promise<string> {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;

  const response = await fetch(qrApiUrl);
  const arrayBuffer = await response.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

/* ---------------------------------------------------------
   MAIN EDGE FUNCTION
--------------------------------------------------------- */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, orderId, invoiceId, description, userId, action } = await req.json();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    /* -------------------------------
       CHECK PAYMENT STATUS
    ------------------------------- */
    if (action === "check-payment") {
      if (!BAKONG_TOKEN) throw new Error("BAKONG_TOKEN not configured");

      const { data: payment } = await supabase
        .from("payments")
        .select("gateway_response")
        .eq("transaction_id", orderId)
        .maybeSingle();

      const md5Hash = payment?.gateway_response?.md5_hash;
      if (!md5Hash) throw new Error("No MD5 hash found for this transaction");

      const checkResponse = await fetch(`${BAKONG_API_URL}/v1/check_transaction_by_md5`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BAKONG_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ md5: md5Hash }),
      });

      const checkResult = await checkResponse.json();

      return new Response(
        JSON.stringify({
          success: true,
          status: checkResult.responseCode === 0 ? "paid" : "pending",
          data: checkResult,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    /* -------------------------------
       GENERATE QR CODE
    ------------------------------- */
    if (!amount || !orderId) {
      throw new Error("Missing required fields: amount, orderId");
    }

    const { data: gatewayConfig } = await supabase
      .from("payment_gateways")
      .select("config")
      .eq("slug", "bakong")
      .maybeSingle();

    const config = gatewayConfig?.config || {};
    const merchantId = config.merchantId || "merchant@bakong";
    const merchantName = config.merchantName || "GameHost";
    const merchantCity = config.merchantCity || "Phnom Penh";
    const accountNumber = config.accountNumber || "";
    const configCurrency = config.currency || "USD";

    let finalCurrency = configCurrency;
    let finalAmount = amount;

    if (configCurrency === "KHR" && currency === "USD") {
      finalAmount = Math.round(amount * USD_TO_KHR_RATE);
    }

    const khqrPayload = {
      merchantId,
      merchantName,
      merchantCity,
      merchantCountry: "KH",
      currency: finalCurrency,
      amount: finalAmount.toFixed(finalCurrency === "KHR" ? 0 : 2),
      transactionId: orderId.substring(0, 25),
      additionalData: description || `Order ${orderId.substring(0, 20)}`,
      accountNumber,
    };

    const qrString = generateKHQRString(khqrPayload);

    // MD5 FIXED
    const md5Hash = md5(qrString);

    const qrCodeBase64 = await generateQRCodeImage(qrString);

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

    return new Response(
      JSON.stringify({
        success: true,
        qrCode: qrCodeBase64,
        qrString,
        md5Hash,
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
