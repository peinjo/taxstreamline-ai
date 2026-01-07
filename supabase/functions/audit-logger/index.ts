import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditEvent {
  event_type: 'auth_login' | 'auth_logout' | 'auth_failed' | 'data_access' | 'data_export' | 'permission_denied' | 'suspicious_activity';
  user_id?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header for user context
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { event } = await req.json() as { event: AuditEvent };

    if (!event || !event.event_type) {
      return new Response(
        JSON.stringify({ error: 'Invalid event data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get client IP from headers (forwarded by edge)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Insert the audit log
    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id || userId,
        email: event.email,
        ip_address: clientIp,
        user_agent: event.user_agent || req.headers.get('user-agent'),
        resource: event.resource,
        action: event.action,
        details: event.details,
        severity: event.severity || 'low',
      });

    if (insertError) {
      console.error('Failed to insert audit log:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log critical events for monitoring
    if (event.severity === 'critical' || event.severity === 'high') {
      console.log(`[SECURITY] ${event.severity.toUpperCase()}: ${event.event_type}`, {
        user_id: event.user_id || userId,
        email: event.email,
        details: event.details,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Audit logger error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
