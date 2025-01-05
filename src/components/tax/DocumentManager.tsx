import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

type DocumentType = "receipt" | "filing" | "statement" | "report" | "other";

interface Document {
  id: number;
  file_name: string;
  file_path: string;
  file_type: DocumentType;
  file_size: number;
  tax_year: number;
  description?: string;
  created_at: string;
}

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

      // Create a folder structure: tax_documents/user_id/year/filename
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

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tax Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="filing">Filing</SelectItem>
              <SelectItem value="statement">Statement</SelectItem>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <Input
              type="file"
              id="document-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
            />
            <Button
              onClick={() => document.getElementById("document-upload")?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

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
                  onClick={() => handleDelete(doc.id, doc.file_path)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
