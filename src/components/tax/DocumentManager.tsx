import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Document, DocumentType } from "./types/document-types";
import { DocumentUploadForm } from "./components/DocumentUploadForm";
import { DocumentList } from "./components/DocumentList";

export function DocumentManager() {
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedType, setSelectedType] = useState<DocumentType>("receipt");

  const { data: documents, refetch } = useQuery({
    queryKey: ["tax-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_metadata")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

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

      const { error: metadataError } = await supabase
        .from("document_metadata")
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: selectedType,
          file_size: file.size,
          tax_year: parseInt(selectedYear),
          user_id: user.id,
        });

      if (metadataError) throw metadataError;

      toast.success("Document uploaded successfully");
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("tax_documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("document_metadata")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast.success("Document deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as DocumentType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DocumentUploadForm
          selectedYear={selectedYear}
          selectedType={selectedType}
          uploading={uploading}
          onYearChange={setSelectedYear}
          onTypeChange={handleTypeChange}
          onFileUpload={handleFileUpload}
        />
        <DocumentList 
          documents={documents || []}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
}