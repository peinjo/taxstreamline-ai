
import React, { useState } from "react";
import { ViewModeToggle } from "./ViewModeToggle";
import { TaxReportStatus } from "./TaxReportStatus";
import { TaxReportDetails } from "./TaxReportDetails";
import { SearchAndFilter } from "./SearchAndFilter";
import { CardView } from "./CardView";
import { Pagination } from "./Pagination";
import { ScheduleReportDialog } from "./ScheduleReportDialog";
import { TableView } from "./TableView";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { NoReportsFound } from "./NoReportsFound";
import { useTaxSummary } from "./hooks/useTaxSummary";

export const TaxSummaryTable: React.FC = () => {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { reports, isLoading, error } = useTaxSummary({
    searchQuery,
    yearFilter,
    statusFilter,
    page: currentPage,
    pageSize,
  });

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  const handleScheduleReport = () => {
    setScheduleDialogOpen(true);
  };

  const totalPages = reports?.length ? Math.ceil(reports.length / pageSize) : 0;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !reports) {
    return (
      <div className="py-4">
        <p className="text-red-500">Error loading tax reports: {error?.message}</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return <NoReportsFound onScheduleReport={handleScheduleReport} />;
  }

  const paginatedReports = reports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tax Summary Reports</h2>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <SearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        year={yearFilter}
        setYear={setYearFilter}
        status={statusFilter}
        setStatus={setStatusFilter}
        onScheduleReport={handleScheduleReport}
      />

      {viewMode === "table" ? (
        <TableView reports={paginatedReports} onViewDetails={handleViewDetails} />
      ) : (
        <CardView reports={paginatedReports} onViewDetails={handleViewDetails} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <ScheduleReportDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />

      <TaxReportDetails
        report={selectedReport}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};
