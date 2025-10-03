import { EmptyState } from "@/components/common/EmptyState";
import { FileText } from "lucide-react";

interface EmptyReportsStateProps {
  onUpload?: () => void;
}

export const EmptyReportsState = ({ onUpload }: EmptyReportsStateProps) => {
  return (
    <EmptyState
      icon={FileText}
      title="No reports found"
      description="Upload your first statutory report to start tracking compliance across multiple jurisdictions."
      actionLabel="Upload Report"
      onAction={onUpload}
    />
  );
};
