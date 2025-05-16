
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaxReport } from "@/types";
import { TaxSummaryProps, TaxReportFilterState, ScheduleConfigState } from "./types";
import { filterAndSortData } from "./utils";
import { TableView } from "./TableView";
import { CardView } from "./CardView";
import { Pagination } from "./Pagination";
import { SearchAndFilter } from "./SearchAndFilter";
import { ScheduleReportDialog } from "./ScheduleReportDialog";
import { TaxSummaryProvider } from "./TaxSummaryContext";

export const TaxSummaryTable: React.FC<TaxSummaryProps> = ({ data, isLoading }) => {
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [reportScheduleVisible, setReportScheduleVisible] = useState(false);
  
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
  const sortedData = filterAndSortData(
    data, 
    filterState.searchTerm, 
    filterState.sortField, 
    filterState.sortDirection
  );
  
  // Pagination
  const totalPages = Math.ceil(sortedData.length / filterState.pageSize);
  const paginatedData = sortedData.slice(
    (filterState.currentPage - 1) * filterState.pageSize,
    filterState.currentPage * filterState.pageSize
  );
  
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
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <div className="border rounded-md">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <TaxSummaryProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tax Reports</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
              >
                {viewMode === "table" ? "Card View" : "Table View"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchAndFilter 
            searchTerm={filterState.searchTerm} 
            setSearchTerm={setSearchTerm} 
            sortedData={sortedData}
            openScheduleDialog={() => setReportScheduleVisible(true)}
          />
          
          {sortedData.length > 0 ? (
            <>
              {viewMode === "table" ? (
                <TableView 
                  paginatedData={paginatedData}
                  sortField={filterState.sortField}
                  sortDirection={filterState.sortDirection}
                  handleSort={handleSort}
                  setSelectedReport={setSelectedReport}
                />
              ) : (
                <CardView 
                  paginatedData={paginatedData}
                  setSelectedReport={setSelectedReport}
                />
              )}
              
              <Pagination 
                currentPage={filterState.currentPage}
                totalPages={totalPages}
                pageSize={filterState.pageSize}
                dataLength={sortedData.length}
                paginatedDataLength={paginatedData.length}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
                viewMode={viewMode}
              />
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No tax reports found for the current filters.</p>
              {filterState.searchTerm && (
                <Button 
                  variant="ghost" 
                  className="mt-2" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>

        <ScheduleReportDialog
          isOpen={reportScheduleVisible}
          onOpenChange={setReportScheduleVisible}
          scheduleConfig={scheduleConfig}
          setScheduleConfig={setScheduleConfig}
        />
      </Card>
    </TaxSummaryProvider>
  );
};
