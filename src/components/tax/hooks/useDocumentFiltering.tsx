
import { useState, useMemo } from "react";
import { DocumentMetadata } from "@/types/documents";

export function useDocumentFiltering(documents: DocumentMetadata[] | undefined) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);

  // Get unique years from documents for filtering
  const uniqueYears = useMemo(() => {
    if (!documents) return [];
    const years = new Set(documents.map(doc => doc.tax_year.toString()));
    return Array.from(years);
  }, [documents]);

  // Filter documents based on search query, type and year
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      const matchesSearch = searchQuery 
        ? doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          // Safely access tags property with optional chaining and type checking
          (Array.isArray((doc as any).tags) && (doc as any).tags.some((tag: string) => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) || false)
        : true;
        
      const matchesType = filterType ? doc.file_type === filterType : true;
      const matchesYear = filterYear ? doc.tax_year.toString() === filterYear : true;
      
      return matchesSearch && matchesType && matchesYear;
    });
  }, [documents, searchQuery, filterType, filterYear]);

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterYear,
    setFilterYear,
    filteredDocuments,
    uniqueYears
  };
}
