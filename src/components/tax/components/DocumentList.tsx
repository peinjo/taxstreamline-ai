import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "../types/document-types";
import { formatFileSize } from "../utils/document-utils";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number, filePath: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  return (
    <div className="grid gap-4">
      {documents?.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">{doc.file_name}</p>
              <p className="text-sm text-muted-foreground">
                {doc.file_type} • {formatFileSize(doc.file_size)} • Tax Year: {doc.tax_year}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(doc.id, doc.file_path)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}