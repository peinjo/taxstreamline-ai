
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DocumentMetadata } from "@/types/documents";
import { DocumentUploadForm } from "./components/DocumentUploadForm";
import { DocumentList } from "./components/DocumentList";
import { DocumentPreview } from "./components/DocumentPreview";
import { Search, Tag, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function DocumentManager() {
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedType, setSelectedType] = useState<"receipt" | "filing" | "statement" | "report" | "other">("receipt");
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTags, setDocumentTags] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);

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

  // Filter documents based on search query, type and year
  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      const matchesSearch = searchQuery 
        ? doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false)
        : true;
        
      const matchesType = filterType ? doc.file_type === filterType : true;
      const matchesYear = filterYear ? doc.tax_year.toString() === filterYear : true;
      
      return matchesSearch && matchesType && matchesYear;
    });
  }, [documents, searchQuery, filterType, filterYear]);

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
    setSelectedType(value as "receipt" | "filing" | "statement" | "report" | "other");
  };

  const handleUpdateTags = async (id: number, tags: string[]) => {
    try {
      const { error } = await supabase
        .from("document_metadata")
        .update({ tags })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Tags updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating tags:", error);
      toast.error("Failed to update tags");
    }
  };

  const handleViewDocument = (document: DocumentMetadata) => {
    setSelectedDocument(document);
  };

  const uniqueYears = React.useMemo(() => {
    if (!documents) return [];
    const years = new Set(documents.map(doc => doc.tax_year.toString()));
    return Array.from(years);
  }, [documents]);

  const documentTypes = ["receipt", "filing", "statement", "report", "other"];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload section with tag input */}
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

        {/* Search and Filter section */}
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">Search & Filter</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType || ""} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear || ""} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || filterType || filterYear) && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">
                Filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Search: {searchQuery}
                  </Badge>
                )}
                {filterType && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Type: {filterType}
                  </Badge>
                )}
                {filterYear && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Year: {filterYear}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Document list */}
        <div className="border-t pt-4">
          <h3 className="mb-4 text-sm font-medium">Documents ({filteredDocuments.length})</h3>
          <DocumentList 
            documents={filteredDocuments}
            onDelete={handleDelete}
            onUpdateTags={handleUpdateTags}
            onViewDocument={handleViewDocument}
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
