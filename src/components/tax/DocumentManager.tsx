
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentMetadata } from "@/types/documents";
import { DocumentList } from "./components/DocumentList";
import { DocumentPreview } from "./components/DocumentPreview";
import { DocumentUploadSection } from "./components/DocumentUploadSection";
import { EnhancedDocumentSearch } from "@/components/documents/EnhancedDocumentSearch";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { DocumentAuditLog, logDocumentAction } from "@/components/documents/DocumentAuditLog";
import { BulkTaggingToolbar } from "@/components/documents/BulkTaggingToolbar";
import { EmptyDocuments } from "@/components/empty-states";
import { useDocumentFiltering } from "./hooks/useDocumentFiltering";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { secureStorage } from "@/lib/security/secureStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logging/logger";

export function DocumentManager() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [versionHistoryDoc, setVersionHistoryDoc] = useState<DocumentMetadata | null>(null);
  const [auditLogDoc, setAuditLogDoc] = useState<DocumentMetadata | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<number>>(new Set());
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

  // Get all unique tags from documents
  const allTags = useMemo(() => {
    if (!documents) return [];
    const tagSet = new Set<string>();
    documents.forEach(doc => {
      doc.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [documents]);

  // Bulk selection helpers
  const handleToggleSelect = (id: number) => {
    setSelectedDocIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (filteredDocuments.length > 0) {
      setSelectedDocIds(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedDocIds(new Set());
  };

  const handleBulkAddTag = async (tag: string) => {
    try {
      const promises = Array.from(selectedDocIds).map(async (id) => {
        const doc = documents?.find(d => d.id === id);
        if (doc) {
          const existingTags = doc.tags || [];
          if (!existingTags.includes(tag)) {
            const updatedTags = [...existingTags, tag];
            await supabase
              .from("document_metadata")
              .update({ tags: updatedTags } as unknown)
              .eq("id", id);
            await logDocumentAction(id, "tag_added", { tag });
          }
        }
      });
      await Promise.all(promises);
      toast.success(`Tag "${tag}" added to ${selectedDocIds.size} documents`);
      refetch();
      handleClearSelection();
    } catch (error) {
      toast.error("Failed to add tags");
    }
  };

  const handleBulkRemoveTag = async (tag: string) => {
    try {
      const promises = Array.from(selectedDocIds).map(async (id) => {
        const doc = documents?.find(d => d.id === id);
        if (doc) {
          const existingTags = doc.tags || [];
          const updatedTags = existingTags.filter(t => t !== tag);
          await supabase
            .from("document_metadata")
            .update({ tags: updatedTags } as unknown)
            .eq("id", id);
          await logDocumentAction(id, "tag_removed", { tag });
        }
      });
      await Promise.all(promises);
      toast.success(`Tag "${tag}" removed from ${selectedDocIds.size} documents`);
      refetch();
      handleClearSelection();
    } catch (error) {
      toast.error("Failed to remove tags");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedDocIds.size} documents?`)) {
      return;
    }
    
    try {
      const promises = Array.from(selectedDocIds).map(async (id) => {
        const doc = documents?.find(d => d.id === id);
        if (doc) {
          await supabase.storage.from("tax_documents").remove([doc.file_path]);
          await supabase.from("document_metadata").delete().eq("id", id);
        }
      });
      await Promise.all(promises);
      toast.success(`${selectedDocIds.size} documents deleted`);
      refetch();
      handleClearSelection();
    } catch (error) {
      toast.error("Failed to delete documents");
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

      await logDocumentAction(id, "delete", { file_path: filePath });
      toast.success("Document deleted successfully");
      refetch();
    } catch (error) {
      logger.error("Delete error", error as Error, { component: 'DocumentManager', documentId: id });
      toast.error("Failed to delete document");
    }
  };

  const handleUpdateTags = async (id: number, tags: string[]) => {
    try {
      const updateObject = { tags } as unknown;
      
      const { error } = await supabase
        .from("document_metadata")
        .update(updateObject)
        .eq("id", id);
      
      if (error) throw error;
      
      await logDocumentAction(id, "tag_added", { tags });
      toast.success("Tags updated successfully");
      refetch();
    } catch (error) {
      logger.error("Error updating tags", error as Error, { component: 'DocumentManager', documentId: id });
      toast.error("Failed to update tags");
    }
  };

  const handleViewDocument = (doc: DocumentMetadata) => {
    setSelectedDocument(doc);
    logDocumentAction(doc.id, "view", { file_name: doc.file_name });
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

  // Get selected tags for bulk operations
  const selectedDocsTags = useMemo(() => {
    const tagSet = new Set<string>();
    selectedDocIds.forEach(id => {
      const doc = documents?.find(d => d.id === id);
      doc?.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [selectedDocIds, documents]);

  // Check if there are no documents
  const hasNoDocuments = !documents || documents.length === 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload section */}
        <div className={isMobile ? "pb-4" : ""}>
          <DocumentUploadSection onUploadComplete={refetch} />
        </div>

        {hasNoDocuments ? (
          <EmptyDocuments 
            onUpload={() => {}} 
            title="No documents uploaded"
            description="Upload your tax documents, receipts, and statements to keep them organized and easily accessible."
          />
        ) : (
          <>
            {/* Search and Filter section */}
            <div className="border-t pt-4">
              <EnhancedDocumentSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                filterYear={filterYear}
                onFilterYearChange={setFilterYear}
                uniqueYears={uniqueYears}
                documentTypes={documentTypes}
                onClearFilters={clearFilters}
                tags={allTags}
              />
            </div>

            {/* Bulk Tagging Toolbar */}
            <BulkTaggingToolbar
              selectedCount={selectedDocIds.size}
              onAddTag={handleBulkAddTag}
              onRemoveTag={handleBulkRemoveTag}
              onDelete={handleBulkDelete}
              onClearSelection={handleClearSelection}
              onSelectAll={handleSelectAll}
              totalCount={filteredDocuments.length}
              existingTags={selectedDocsTags}
            />

            {/* Document list */}
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
                onViewDocument={handleViewDocument}
                onViewHistory={setVersionHistoryDoc}
                onViewAuditLog={setAuditLogDoc}
                selectedIds={selectedDocIds}
                onToggleSelect={handleToggleSelect}
              />
            </div>
          </>
        )}

        {/* Document preview */}
        {selectedDocument && (
          <DocumentPreview 
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}

        {/* Version History Sheet */}
        {versionHistoryDoc && (
          <DocumentVersionHistory
            documentId={versionHistoryDoc.id.toString()}
            documentTitle={versionHistoryDoc.file_name}
            isOpen={!!versionHistoryDoc}
            onClose={() => setVersionHistoryDoc(null)}
          />
        )}

        {/* Audit Log Sheet */}
        {auditLogDoc && (
          <DocumentAuditLog
            documentId={auditLogDoc.id}
            documentName={auditLogDoc.file_name}
            isOpen={!!auditLogDoc}
            onClose={() => setAuditLogDoc(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}
