
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Download, FileText, Filter } from "lucide-react";
import { toast } from "sonner";

interface GlobalDocumentManagerProps {
  selectedCountry: string;
  countries: string[];
}

export function GlobalDocumentManager({ selectedCountry, countries }: GlobalDocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState(selectedCountry);
  const [filterTaxType, setFilterTaxType] = useState("all");

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ["global-documents", filterCountry, filterTaxType],
    queryFn: async () => {
      let query = supabase
        .from("document_metadata")
        .select("*")
        .order("created_at", { ascending: false });

      // For global documents, we would filter by tags containing country info
      // This is a simplified version - in production you'd have proper country tagging
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    },
  });

  const taxTypes = ["Corporate Income Tax", "VAT", "Transfer Pricing", "Withholding Tax", "Other"];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `global-reports/${filterCountry}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tax_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('document_metadata')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: 'report',
          file_size: file.size,
          tax_year: new Date().getFullYear(),
          description: `${filterCountry} - ${filterTaxType} document`,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Global Document Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTaxType} onValueChange={setFilterTaxType}>
            <SelectTrigger>
              <SelectValue placeholder="Tax type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {taxTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
              id="document-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            <Button asChild variant="outline" className="flex-1">
              <label htmlFor="document-upload" className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </label>
            </Button>
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents found</p>
              <p className="text-sm">Upload documents or adjust your filters</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{doc.file_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {doc.file_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {doc.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Year: {doc.tax_year}</span>
                    <span>Size: {(doc.file_size / 1024).toFixed(1)} KB</span>
                    <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
