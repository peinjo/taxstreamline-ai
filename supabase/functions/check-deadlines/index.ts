import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for upcoming deadlines...");

    // Calculate date ranges
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Check compliance deadlines
    const { data: complianceItems, error: complianceError } = await supabase
      .from('compliance_items')
      .select('*, user_profiles:user_id(email, display_name)')
      .lte('next_due_date', sevenDaysFromNow.toISOString())
      .gte('next_due_date', now.toISOString())
      .in('status', ['pending', 'in-progress']);

    if (complianceError) throw complianceError;

    // Check global deadlines
    const { data: globalDeadlines, error: globalError } = await supabase
      .from('global_deadlines')
      .select('*')
      .lte('due_date', sevenDaysFromNow.toISOString())
      .gte('due_date', now.toISOString())
      .eq('status', 'upcoming');

    if (globalError) throw globalError;

    // Send notifications for compliance items
    const emailPromises: Promise<any>[] = [];

    for (const item of complianceItems || []) {
      const dueDate = new Date(item.next_due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminder if 7 days, 3 days, or 1 day away
      if ([7, 3, 1].includes(daysUntilDue)) {
        const userEmail = item.user_profiles?.email;
        const userName = item.user_profiles?.display_name || 'User';

        if (userEmail) {
          console.log(`Sending deadline reminder for: ${item.title} to ${userEmail}`);
          
          emailPromises.push(
            supabase.functions.invoke('send-email', {
              body: {
                type: 'deadline',
                to: userEmail,
                data: {
                  userName,
                  deadlineTitle: item.title,
                  deadlineDate: dueDate.toLocaleDateString(),
                  daysUntilDue,
                  deadlineType: item.requirement_type,
                  actionUrl: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/compliance`,
                },
              },
            })
          );
        }
      }
    }

    // Get all users with email preferences for global deadlines
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('email, display_name, user_id');

    if (usersError) throw usersError;

    // Send global deadline notifications
    for (const deadline of globalDeadlines || []) {
      const dueDate = new Date(deadline.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if ([7, 3, 1].includes(daysUntilDue)) {
        for (const user of users || []) {
          console.log(`Sending global deadline reminder: ${deadline.title} to ${user.email}`);
          
          emailPromises.push(
            supabase.functions.invoke('send-email', {
              body: {
                type: 'deadline',
                to: user.email,
                data: {
                  userName: user.display_name || 'User',
                  deadlineTitle: deadline.title,
                  deadlineDate: dueDate.toLocaleDateString(),
                  daysUntilDue,
                  deadlineType: deadline.tax_type,
                  actionUrl: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/global-reporting`,
                },
              },
            })
          );
        }
      }
    }

    await Promise.all(emailPromises);

    console.log(`Sent ${emailPromises.length} deadline reminders`);

    return new Response(
      JSON.stringify({
        success: true,
        complianceReminders: complianceItems?.length || 0,
        globalReminders: globalDeadlines?.length || 0,
        totalEmails: emailPromises.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error checking deadlines:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
