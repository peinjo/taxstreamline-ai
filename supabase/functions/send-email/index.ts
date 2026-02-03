import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { DeadlineReminderEmail } from './_templates/deadline-reminder.tsx';
import { ComplianceAlertEmail } from './_templates/compliance-alert.tsx';
import { ReportStatusEmail } from './_templates/report-status.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'deadline' | 'compliance' | 'report_status';
  to: string;
  data: any;
}

// Validate authentication - accepts either user JWT or service role key
async function validateAuth(req: Request): Promise<{ valid: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  const apiKey = req.headers.get('apikey');
  
  // Check for service role key (internal calls from other edge functions or database triggers)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (apiKey === serviceRoleKey) {
    return { valid: true };
  }
  
  // Check for valid user JWT
  if (!authHeader) {
    return { valid: false, error: 'Missing authorization header' };
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { valid: false, error: 'Invalid or expired token' };
  }
  
  return { valid: true };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication before processing
    const authResult = await validateAuth(req);
    if (!authResult.valid) {
      console.error("Authentication failed:", authResult.error);
      return new Response(
        JSON.stringify({ error: authResult.error }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { type, to, data }: EmailRequest = await req.json();
    
    console.log(`Sending ${type} email to ${to}`);

    let html: string;
    let subject: string;

    switch (type) {
      case 'deadline':
        html = await renderAsync(
          React.createElement(DeadlineReminderEmail, data)
        );
        subject = `Reminder: ${data.deadlineTitle} - ${data.daysUntilDue} days remaining`;
        break;

      case 'compliance':
        html = await renderAsync(
          React.createElement(ComplianceAlertEmail, data)
        );
        subject = `Compliance Alert: ${data.itemTitle}`;
        break;

      case 'report_status':
        html = await renderAsync(
          React.createElement(ReportStatusEmail, data)
        );
        subject = `Report Status Update: ${data.reportType} ${data.reportYear}`;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Tax Compliance Platform <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
