
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";
import { DocumentUploadForm } from "./DocumentUploadForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logging/logger";

interface DocumentUploadSectionProps {
  onUploadComplete: () => void;
}

export function DocumentUploadSection({ onUploadComplete }: DocumentUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedType, setSelectedType] = useState<"receipt" | "filing" | "statement" | "report" | "other">("receipt");
  const [documentTags, setDocumentTags] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const filePath = `${user.id}/${selectedYear}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("tax_documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Parse tags from the comma-separated string
      const parsedTags = documentTags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error: metadataError } = await supabase
        .from("document_metadata")
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: selectedType,
          file_size: file.size,
          tax_year: parseInt(selectedYear),
          user_id: user.id,
          tags: parsedTags.length > 0 ? parsedTags : undefined
        });

      if (metadataError) throw metadataError;

      toast.success("Document uploaded successfully");
      setDocumentTags(""); // Reset tags field after upload
      onUploadComplete();
    } catch (error) {
      logger.error("Upload error", error as Error, { component: 'DocumentUploadSection', selectedType, selectedYear });
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as "receipt" | "filing" | "statement" | "report" | "other");
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Upload Documents</h3>
      <div className="space-y-3">
        <DocumentUploadForm
          selectedYear={selectedYear}
          selectedType={selectedType}
          uploading={uploading}
          onYearChange={setSelectedYear}
          onTypeChange={handleTypeChange}
          onFileUpload={handleFileUpload}
        />
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add tags separated by commas"
            value={documentTags}
            onChange={(e) => setDocumentTags(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
