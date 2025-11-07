
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
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { secureStorage } from "@/lib/security/secureStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logging/logger";

export function DocumentManager() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const { isMobile } = useResponsiveLayout();

  const { 
    data: documents, 
    refetch,
    isLoading,
    isError 
  } = useQuery({
    queryKey: ["tax-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_metadata")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Save encrypted copy locally for offline access
      const docsForStorage = data as DocumentMetadata[];
      secureStorage.setItem('cached_tax_documents', docsForStorage)
        .catch(err => logger.error('Failed to cache documents locally', err as Error, { component: 'DocumentManager' }));
        
      return docsForStorage;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
  });

  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterYear,
    setFilterYear,
    filteredDocuments,
    uniqueYears,
    clearFilters
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
      logger.error("Delete error", error as Error, { component: 'DocumentManager', documentId: id });
      toast.error("Failed to delete document");
    }
  };

  const handleUpdateTags = async (id: number, tags: string[]) => {
    try {
      // Use any type for the update object since the database schema may include tags
      const updateObject = { tags } as unknown;
      
      const { error } = await supabase
        .from("document_metadata")
        .update(updateObject)
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Tags updated successfully");
      refetch();
    } catch (error) {
      logger.error("Error updating tags", error as Error, { component: 'DocumentManager', documentId: id });
      toast.error("Failed to update tags");
    }
  };

  const documentTypes = ["receipt", "filing", "statement", "report", "other"];

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tax Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading documents...</span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tax Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Failed to load documents</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload section - responsive design */}
        <div className={isMobile ? "pb-4" : ""}>
          <DocumentUploadSection onUploadComplete={refetch} />
        </div>

        {/* Search and Filter section - responsive design */}
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
            onClearFilters={clearFilters}
            isMobile={isMobile}
          />
        </div>

        {/* Document list - responsive design */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Documents ({filteredDocuments.length})</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-2" /> Refresh
            </Button>
          </div>
          <DocumentList 
            documents={filteredDocuments}
            onDelete={handleDelete}
            onUpdateTags={handleUpdateTags}
            onViewDocument={setSelectedDocument}
          />
        </div>

        {/* Document preview - responsive design */}
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
