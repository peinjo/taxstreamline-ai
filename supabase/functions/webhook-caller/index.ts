import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: max 10 requests per minute per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60000; // 1 minute

// Allowlist of permitted domains (can be extended via database config)
const ALLOWED_DOMAINS = [
  'hooks.slack.com',
  'discord.com',
  'api.zapier.com',
  'hooks.zapier.com',
  'maker.ifttt.com',
  'api.webhook.site',
  'webhook.site',
];

// Blocked IP patterns (RFC1918, link-local, localhost, cloud metadata)
const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fe80:/i,
  /^fc00:/i,
  /^fd00:/i,
  /metadata\.google\.internal/i,
  /169\.254\.169\.254/,
  /metadata\.aws\.internal/i,
];

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }
  
  userLimit.count++;
  return false;
}

function validateUrl(urlString: string): { valid: boolean; error?: string; url?: URL } {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTPS
    if (url.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTPS URLs are allowed' };
    }
    
    // Check against blocked patterns
    const hostname = url.hostname.toLowerCase();
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'URL targets a blocked address space' };
      }
    }
    
    // Check if domain is in allowlist
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isAllowed) {
      return { 
        valid: false, 
        error: `Domain '${hostname}' is not in the allowed webhook domains list. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}` 
      };
    }
    
    return { valid: true, url };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    if (isRateLimited(user.id)) {
      console.warn(`Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { webhook_url, payload, timeout_ms = 10000 } = body;

    if (!webhook_url) {
      return new Response(
        JSON.stringify({ success: false, error: 'webhook_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload) {
      return new Response(
        JSON.stringify({ success: false, error: 'payload is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    const urlValidation = validateUrl(webhook_url);
    if (!urlValidation.valid) {
      console.warn(`URL validation failed for user ${user.id}: ${urlValidation.error}`);
      return new Response(
        JSON.stringify({ success: false, error: urlValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the webhook call attempt
    console.log(`Webhook call by user ${user.id} to ${urlValidation.url!.hostname}`);

    // Make the webhook call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Math.min(timeout_ms, 30000));

    try {
      const webhookResponse = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TaxManagement-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseStatus = webhookResponse.status;
      const responseOk = webhookResponse.ok;

      // Log successful webhook call
      console.log(`Webhook call completed: status=${responseStatus}, ok=${responseOk}`);

      return new Response(
        JSON.stringify({
          success: responseOk,
          status: responseStatus,
          message: responseOk ? 'Webhook delivered successfully' : 'Webhook returned an error',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`Webhook timeout for user ${user.id}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Webhook request timed out' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error(`Webhook fetch error for user ${user.id}:`, fetchError.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to deliver webhook' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Webhook caller error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
