import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore } from "date-fns";
import { sendMultiChannelNotification } from "./multiChannelNotification";

export const checkDeadlines = async (userId: string) => {
  // Use calendar_events and compliance_items as single source of truth
  const [calendarRes, complianceRes] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("compliance_items")
      .select("*")
      .eq("user_id", userId)
      .not("next_due_date", "is", null),
  ]);

  if (calendarRes.error) throw calendarRes.error;
  if (complianceRes.error) throw complianceRes.error;

  const warningDate = addDays(new Date(), 7);

  // Check calendar events
  const upcomingEvents = (calendarRes.data || []).filter((event) => {
    const eventDate = new Date(event.date);
    return isBefore(eventDate, warningDate) && eventDate >= new Date();
  });

  for (const event of upcomingEvents) {
    const daysUntilDue = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    await createNotification({
      userId,
      title: "Upcoming Calendar Event",
      message: `Event approaching: ${event.title} (${event.company})`,
      type: "deadline",
      dueDate: event.date,
    });

    await sendMultiChannelNotification({
      userId,
      title: "Upcoming Calendar Event",
      message: `Event approaching: ${event.title}`,
      type: "deadline",
      data: {
        deadlineTitle: event.title,
        daysUntilDue,
        deadlineDate: event.date,
        actionUrl: "/calendar",
      },
    });
  }

  // Check compliance items
  const upcomingCompliance = (complianceRes.data || []).filter((item) => {
    const dueDate = new Date(item.next_due_date!);
    return isBefore(dueDate, warningDate) && dueDate >= new Date();
  });

  for (const item of upcomingCompliance) {
    const daysUntilDue = Math.ceil((new Date(item.next_due_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    await createNotification({
      userId,
      title: "Compliance Deadline",
      message: `Compliance due: ${item.title} (${item.country})`,
      type: "compliance",
      dueDate: item.next_due_date,
    });

    await sendMultiChannelNotification({
      userId,
      title: "Compliance Deadline",
      message: `Compliance due: ${item.title}`,
      type: "compliance",
      data: {
        deadlineTitle: item.title,
        daysUntilDue,
        deadlineDate: item.next_due_date,
        actionUrl: "/compliance",
      },
    });
  }
};

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  dueDate = null,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  dueDate?: string | null;
}) => {
  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      title,
      message,
      type,
      status: "unread",
      due_date: dueDate,
    },
  ]);

  if (error) throw error;
};

export const sendNotificationToUser = async ({
  userId,
  title,
  message,
  type,
  dueDate = null,
  data = {},
}: {
  userId: string;
  title: string;
  message: string;
  type: "deadline" | "compliance" | "report_status";
  dueDate?: string | null;
  data?: Record<string, any>;
}) => {
  // Create in-app notification
  await createNotification({
    userId,
    title,
    message,
    type,
    dueDate,
  });

  // Send via all enabled channels
  return sendMultiChannelNotification({
    userId,
    title,
    message,
    type,
    data,
  });
};
