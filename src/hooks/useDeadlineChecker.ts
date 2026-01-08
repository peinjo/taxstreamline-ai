import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore } from "date-fns";

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
            .maybeSingle();

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
            .maybeSingle();

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
