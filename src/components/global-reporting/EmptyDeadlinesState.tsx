import { EmptyState } from "@/components/common/EmptyState";
import { Calendar } from "lucide-react";

export const EmptyDeadlinesState = () => {
  return (
    <EmptyState
      icon={Calendar}
      title="No upcoming deadlines"
      description="You're all caught up! No pending filing deadlines for your selected filters."
    />
  );
};
