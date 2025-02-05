import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore } from "date-fns";

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
    await createNotification({
      userId,
      title: "Upcoming Deadline",
      message: `Deadline approaching: ${deadline.text}`,
      type: "deadline",
      dueDate: deadline.date,
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
