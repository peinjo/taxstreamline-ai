import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { addDays, isBefore, differenceInDays } from "date-fns";
import { sendTaxNotification } from "@/utils/notifications";

export const useDeadlineChecker = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkDeadlines = async () => {
      // Check calendar events
      const { data: events } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("date", new Date().toISOString())
        .lte("date", addDays(new Date(), 7).toISOString());

      if (events) {
        for (const event of events) {
          const { data: existingNotification } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", "deadline")
            .eq("title", `Upcoming Event: ${event.title}`)
            .single();

          if (!existingNotification) {
            await supabase.from("notifications").insert([
              {
                user_id: user.id,
                title: `Upcoming Event: ${event.title}`,
                message: `You have an upcoming event with ${event.company}`,
                type: "deadline",
                due_date: event.date,
              },
            ]);

            // Send email notification
            await sendTaxNotification({
              type: 'deadline_reminder',
              userEmail: user.email,
              userName: user.user_metadata?.full_name || 'Valued Customer',
              data: {
                deadlineDate: event.date,
                taskName: event.title,
                daysRemaining: differenceInDays(new Date(event.date), new Date())
              }
            });
          }
        }
      }

      // Check compliance rules
      const { data: rules } = await supabase
        .from("compliance_rules")
        .select("*")
        .eq("is_active", true);

      if (rules) {
        for (const rule of rules) {
          const { data: existingNotification } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", "compliance")
            .eq("title", `Compliance Reminder: ${rule.title}`)
            .single();

          if (!existingNotification) {
            await supabase.from("notifications").insert([
              {
                user_id: user.id,
                title: `Compliance Reminder: ${rule.title}`,
                message: rule.description,
                type: "compliance",
              },
            ]);
          }
        }
      }
    };

    // Check deadlines immediately and then every hour
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 3600000);

    return () => clearInterval(interval);
  }, [user]);
};