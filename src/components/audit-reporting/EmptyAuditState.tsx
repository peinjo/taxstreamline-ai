import { EmptyState } from "@/components/common/EmptyState";
import { BarChart3 } from "lucide-react";

interface EmptyAuditStateProps {
  onCreateSampleData?: () => void;
}

export const EmptyAuditState = ({ onCreateSampleData }: EmptyAuditStateProps) => {
  return (
    <EmptyState
      icon={BarChart3}
      title="No audit data available"
      description="Get started by creating sample data to explore audit reporting features including analytics, confirmations, internal controls, and audit logs."
      actionLabel="Create Sample Data"
      onAction={onCreateSampleData}
    />
  );
};
