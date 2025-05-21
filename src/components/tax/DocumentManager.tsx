
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentMetadata } from "@/types/documents";
import { DocumentList } from "./components/DocumentList";
import { DocumentPreview } from "./components/DocumentPreview";
import { DocumentUploadSection } from "./components/DocumentUploadSection";
import { DocumentSearch } from "./components/DocumentSearch";
import { useDocumentFiltering } from "./hooks/useDocumentFiltering";
import { toast } from "sonner";

export function DocumentManager() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);

  const { data: documents, refetch } = useQuery({
    queryKey: ["tax-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_metadata")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DocumentMetadata[];
    },
  });

  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterYear,
    setFilterYear,
    filteredDocuments,
    uniqueYears
  } = useDocumentFiltering(documents);

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

  const handleUpdateTags = async (id: number, tags: string[]) => {
    try {
      // We need to cast the update object to any to avoid TypeScript error
      // since the database schema includes tags but the TypeScript type might not be updated
      const updateObject: any = { tags };
      
      const { error } = await supabase
        .from("document_metadata")
        .update(updateObject)
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Tags updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating tags:", error);
      toast.error("Failed to update tags");
    }
  };

  const documentTypes = ["receipt", "filing", "statement", "report", "other"];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload section */}
        <DocumentUploadSection onUploadComplete={refetch} />

        {/* Search and Filter section */}
        <div className="border-t pt-4">
          <DocumentSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            filterYear={filterYear}
            onFilterYearChange={setFilterYear}
            uniqueYears={uniqueYears}
            documentTypes={documentTypes}
          />
        </div>

        {/* Document list */}
        <div className="border-t pt-4">
          <h3 className="mb-4 text-sm font-medium">Documents ({filteredDocuments.length})</h3>
          <DocumentList 
            documents={filteredDocuments}
            onDelete={handleDelete}
            onUpdateTags={handleUpdateTags}
            onViewDocument={setSelectedDocument}
          />
        </div>

        {/* Document preview */}
        {selectedDocument && (
          <DocumentPreview 
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}
