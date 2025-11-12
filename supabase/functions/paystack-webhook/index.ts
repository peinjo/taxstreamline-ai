import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    paid_at?: string;
    channel?: string;
    customer?: {
      email: string;
      customer_code?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

async function verifyPaystackSignature(
  payload: string, 
  signature: string, 
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  
  // Import the secret key for HMAC
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === signature;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.error("Missing Paystack signature header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const rawBody = await req.text();
    
    // Verify webhook signature
    const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecret);
    if (!isValid) {
      console.error("Invalid Paystack signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const event: PaystackWebhookEvent = JSON.parse(rawBody);
    console.log("Received Paystack webhook event:", event.event, "for reference:", event.data.reference);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role key for webhook processing (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only process charge.success and charge.failed events
    if (event.event !== "charge.success" && event.event !== "charge.failed") {
      console.log("Ignoring event type:", event.event);
      return new Response(
        JSON.stringify({ message: "Event ignored" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const reference = event.data.reference;
    if (!reference) {
      console.error("Missing reference in webhook data");
      return new Response(
        JSON.stringify({ error: "Missing reference" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch existing transaction
    const { data: existingTx, error: fetchError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("payment_reference", reference)
      .single();

    if (fetchError) {
      console.error("Transaction not found for reference:", reference, fetchError);
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const newStatus = event.data.status;
    const currentStatus = existingTx.status;

    // Idempotency: if already in a final state, don't update
    const finalStates = ["success", "successful", "failed", "abandoned"];
    if (finalStates.includes(currentStatus) && currentStatus !== "pending") {
      console.log(`Transaction ${reference} already in final state: ${currentStatus}. Skipping update.`);
      return new Response(
        JSON.stringify({ message: "Already processed", current_status: currentStatus }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update transaction with webhook data
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      metadata: {
        ...(existingTx.metadata || {}),
        webhook_event: event.event,
        webhook_received_at: new Date().toISOString(),
        paid_at: event.data.paid_at,
        channel: event.data.channel,
        customer: event.data.customer,
        amount_confirmed: event.data.amount / 100, // Convert from kobo
        currency_confirmed: event.data.currency,
      },
    };

    const { data: updatedTx, error: updateError } = await supabase
      .from("payment_transactions")
      .update(updatePayload)
      .eq("payment_reference", reference)
      .eq("status", currentStatus) // Ensure we only update if status hasn't changed (race condition protection)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return new Response(
        JSON.stringify({ error: "Update failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!updatedTx) {
      console.log(`Transaction ${reference} was updated by another process. Idempotency check passed.`);
      return new Response(
        JSON.stringify({ message: "Already processed by another request" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully processed ${event.event} for ${reference}. Status: ${currentStatus} → ${newStatus}`);

    return new Response(
      JSON.stringify({ 
        message: "Webhook processed successfully",
        reference,
        old_status: currentStatus,
        new_status: newStatus,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
