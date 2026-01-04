import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore } from "date-fns";
import { sendMultiChannelNotification } from "./multiChannelNotification";

export const checkDeadlines = async (userId: string) => {
  const { data: deadlines, error } = await supabase
    .from("deadlines")
    .select("*");

  if (error) throw error;

  const upcomingDeadlines = deadlines.filter((deadline) => {
    const deadlineDate = new Date(deadline.date);
    const warningDate = addDays(new Date(), 7); // 7 days warning
    return isBefore(deadlineDate, warningDate);
  });

  for (const deadline of upcomingDeadlines) {
    // Create in-app notification
    await createNotification({
      userId,
      title: "Upcoming Deadline",
      message: `Deadline approaching: ${deadline.text}`,
      type: "deadline",
      dueDate: deadline.date,
    });

    // Send multi-channel notification
    await sendMultiChannelNotification({
      userId,
      title: "Upcoming Deadline",
      message: `Deadline approaching: ${deadline.text}`,
      type: "deadline",
      data: {
        deadlineTitle: deadline.text,
        daysUntilDue: Math.ceil((new Date(deadline.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        deadlineDate: deadline.date,
        actionUrl: `${window.location.origin}/calendar`,
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
