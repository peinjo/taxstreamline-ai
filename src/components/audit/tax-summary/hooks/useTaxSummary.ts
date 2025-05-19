
import { useState, useMemo } from "react";
import { TaxReport } from "@/types";
import { TaxReportFilterState, ScheduleConfigState } from "../types";
import { filterAndSortData } from "../utils";

export const useTaxSummary = (data: TaxReport[]) => {
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  
  // Filter and pagination state
  const [filterState, setFilterState] = useState<TaxReportFilterState>({
    searchTerm: "",
    sortField: "tax_year",
    sortDirection: "desc",
    currentPage: 1,
    pageSize: 10
  });
  
  // Schedule configuration state
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfigState>({
    frequency: "weekly",
    recipients: "",
    format: "pdf"
  });
  
  // Handle sorting
  const handleSort = (field: keyof TaxReport) => {
    setFilterState(prev => {
      if (prev.sortField === field) {
        return { ...prev, sortDirection: prev.sortDirection === "asc" ? "desc" : "asc" };
      } else {
        return { ...prev, sortField: field, sortDirection: "asc" };
      }
    });
  };

  // Apply filters and sorting
  const sortedData = useMemo(() => 
    filterAndSortData(
      data, 
      filterState.searchTerm, 
      filterState.sortField, 
      filterState.sortDirection
    ),
  [data, filterState.searchTerm, filterState.sortField, filterState.sortDirection]);
  
  // Pagination
  const totalPages = Math.ceil(sortedData.length / filterState.pageSize);
  const paginatedData = useMemo(() => 
    sortedData.slice(
      (filterState.currentPage - 1) * filterState.pageSize,
      filterState.currentPage * filterState.pageSize
    ),
  [sortedData, filterState.currentPage, filterState.pageSize]);
  
  // Handle page size change
  const setPageSize = (size: number) => {
    setFilterState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  };
  
  // Handle page change
  const setCurrentPage = (page: number) => {
    setFilterState(prev => ({ ...prev, currentPage: page }));
  };
  
  // Handle search term change
  const setSearchTerm = (term: string) => {
    setFilterState(prev => ({ ...prev, searchTerm: term, currentPage: 1 }));
  };

  return {
    selectedReport,
    setSelectedReport,
    filterState,
    setFilterState,
    scheduleConfig,
    setScheduleConfig,
    viewMode,
    setViewMode,
    sortedData,
    paginatedData,
    totalPages,
    handleSort,
    setSearchTerm,
    setCurrentPage,
    setPageSize
  };
};
