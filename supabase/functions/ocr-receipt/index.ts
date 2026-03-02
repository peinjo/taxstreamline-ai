import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { receiptId, fileUrl } = await req.json();

    if (!receiptId || !fileUrl) {
      return new Response(JSON.stringify({ error: "receiptId and fileUrl are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to processing
    await supabase
      .from("ocr_receipts")
      .update({ status: "processing" })
      .eq("id", receiptId)
      .eq("user_id", user.id);

    // Call OpenAI Vision API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a receipt data extraction assistant for Nigerian businesses. Extract the following from the receipt image:
- vendor_name: The business/store name
- amount: Total amount (numeric, no currency symbol)
- vat_amount: VAT amount if shown (numeric, no currency symbol), or calculate as 7.5% of amount if not shown
- currency: Currency code (default NGN)
- receipt_date: Date in YYYY-MM-DD format
- category: One of: food, transport, office_supplies, utilities, professional_services, equipment, marketing, travel, entertainment, other
- description: Brief description of the purchase

Return ONLY valid JSON with these fields. If a field cannot be determined, use null.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract data from this receipt:" },
              { type: "image_url", image_url: { url: fileUrl } },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", errText);
      await supabase
        .from("ocr_receipts")
        .update({ status: "failed" })
        .eq("id", receiptId);
      return new Response(JSON.stringify({ error: "OCR processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await openaiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let extracted;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      extracted = null;
    }

    if (!extracted) {
      await supabase
        .from("ocr_receipts")
        .update({ status: "failed", raw_ocr_data: { raw_response: content } })
        .eq("id", receiptId);
      return new Response(JSON.stringify({ error: "Could not parse receipt data" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the receipt record with extracted data
    const { data: updatedReceipt, error: updateError } = await supabase
      .from("ocr_receipts")
      .update({
        vendor_name: extracted.vendor_name,
        amount: extracted.amount ? parseFloat(extracted.amount) : null,
        vat_amount: extracted.vat_amount ? parseFloat(extracted.vat_amount) : null,
        currency: extracted.currency || "NGN",
        receipt_date: extracted.receipt_date,
        category: extracted.category,
        description: extracted.description,
        raw_ocr_data: extracted,
        status: "completed",
        confidence_score: 0.85,
      })
      .eq("id", receiptId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to save extracted data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ receipt: updatedReceipt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("OCR error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
