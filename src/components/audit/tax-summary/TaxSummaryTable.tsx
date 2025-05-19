
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxReport } from "@/types";
import { TaxSummaryProps } from "./types";
import { TableView } from "./TableView";
import { CardView } from "./CardView";
import { Pagination } from "./Pagination";
import { SearchAndFilter } from "./SearchAndFilter";
import { ScheduleReportDialog } from "./ScheduleReportDialog";
import { TaxSummaryProvider } from "./TaxSummaryContext";
import { useTaxSummary } from "./hooks/useTaxSummary";
import { ViewModeToggle } from "./ViewModeToggle";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { NoReportsFound } from "./NoReportsFound";

export const TaxSummaryTable: React.FC<TaxSummaryProps> = ({ data, isLoading }) => {
  const [reportScheduleVisible, setReportScheduleVisible] = useState(false);
  const {
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
  } = useTaxSummary(data);
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <TaxSummaryProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tax Reports</CardTitle>
            <div className="flex gap-2">
              <ViewModeToggle 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
              />
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
            <NoReportsFound 
              searchTerm={filterState.searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
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
