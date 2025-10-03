import { EmptyState } from "@/components/common/EmptyState";
import { FileText } from "lucide-react";

interface EmptyDocumentsStateProps {
  onCreateDocument?: () => void;
  onUploadDocument?: () => void;
}

export const EmptyDocumentsState = ({ 
  onCreateDocument, 
  onUploadDocument 
}: EmptyDocumentsStateProps) => {
  return (
    <EmptyState
      icon={FileText}
      title="No transfer pricing documents yet"
      description="Start building your transfer pricing documentation by creating a new document or uploading an existing one. Ensure OECD compliance and manage all your intercompany transactions."
      actionLabel="Create New Document"
      onAction={onCreateDocument}
      secondaryActionLabel="Upload Document"
      onSecondaryAction={onUploadDocument}
    />
  );
};
