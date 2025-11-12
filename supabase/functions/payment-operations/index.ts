import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (per user) for initialize/verify actions
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max operations per window

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic rate limiting by user id
    const rlKey = `user:${user.id}`;
    if (!checkRateLimit(rlKey)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again shortly." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload = await req.json().catch(() => ({}));
    const action = payload.action as string | undefined;

    if (!action || (action !== "initialize" && action !== "verify")) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) {
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "initialize") {
      const { amount, currency, email, metadata } = payload as {
        amount: number; currency: string; email: string; metadata?: Record<string, unknown>;
      };

      // Minimal validation
      if (
        typeof amount !== "number" || !isFinite(amount) || amount < 0.01 || amount > 10_000_000 ||
        typeof currency !== "string" || currency.length !== 3 ||
        typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid payment parameters" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          email,
          currency: currency.toUpperCase(),
          metadata,
        }),
      });

      if (!initRes.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to initialize payment" }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const initData = await initRes.json();
      if (!initData?.status || !initData?.data?.reference || !initData?.data?.authorization_url) {
        return new Response(
          JSON.stringify({ error: "Invalid response from payment provider" }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Record transaction as the authenticated user (respecting RLS)
      const { data: transaction, error } = await supabase
        .from("payment_transactions")
        .insert({
          amount,
          currency: currency.toUpperCase(),
          payment_reference: initData.data.reference,
          provider: "paystack",
          status: "pending",
          metadata,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Could not record transaction" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ transaction, authorizationUrl: initData.data.authorization_url }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // action === 'verify'
    const { reference } = payload as { reference?: string };
    if (!reference || typeof reference !== "string" || reference.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid payment reference" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });

    if (!verifyRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to verify payment" }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const verifyData = await verifyRes.json();
    const status = verifyData?.data?.status ?? "unknown";

    const { data: transaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status,
        metadata: { ...verifyData?.data },
      })
      .eq("payment_reference", reference)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Could not update transaction status" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ transaction }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("payment-operations error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
