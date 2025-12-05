import React from "react";
import { FileText, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyDocumentsProps {
  onUpload?: () => void;
  onCreateNew?: () => void;
  title?: string;
  description?: string;
}

export function EmptyDocuments({
  onUpload,
  onCreateNew,
  title = "No documents yet",
  description = "Upload your tax documents, receipts, and statements to keep them organized and easily accessible.",
}: EmptyDocumentsProps) {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-primary/10 p-6">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          {onUpload && (
            <Button onClick={onUpload} size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
          {onCreateNew && (
            <Button onClick={onCreateNew} variant="outline" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
