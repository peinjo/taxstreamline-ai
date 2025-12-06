
import { useState, useMemo, useCallback } from "react";
import { DocumentMetadata } from "@/types/documents";

export function useDocumentFiltering(documents: DocumentMetadata[] | undefined) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);

  // Get unique years from documents for filtering - memoized for performance
  const uniqueYears = useMemo(() => {
    if (!documents) return [];
    const years = new Set(documents.map(doc => doc.tax_year));
    return Array.from(years).sort((a, b) => b - a); // Sort in descending order
  }, [documents]);

  // Memoized filter function for better performance
  const filterDocuments = useCallback((docs: DocumentMetadata[], query: string, type: string | null, year: string | null) => {
    return docs.filter(doc => {
      // Search query matching
      const matchesSearch = query 
        ? doc.file_name.toLowerCase().includes(query.toLowerCase()) || 
          (doc.description?.toLowerCase().includes(query.toLowerCase()) || false) ||
          (doc.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) || false)
        : true;
      
      // Type filtering
      const matchesType = !type || type === "all" || doc.file_type === type;
      
      // Year filtering
      const matchesYear = !year || year === "all" || doc.tax_year.toString() === year;
      
      return matchesSearch && matchesType && matchesYear;
    });
  }, []);

  // Filter documents based on search query, type and year - with optimized memoization
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return filterDocuments(documents, searchQuery, filterType, filterYear);
  }, [documents, searchQuery, filterType, filterYear, filterDocuments]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterType(null);
    setFilterYear(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterYear,
    setFilterYear,
    filteredDocuments,
    uniqueYears,
    clearFilters
  };
}
