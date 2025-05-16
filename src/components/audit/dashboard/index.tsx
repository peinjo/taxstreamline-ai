
import React from "react";
import { useDashboardData } from "./useDashboardData";
import { DashboardHeader } from "./DashboardHeader";
import { FilterToolbar } from "./FilterToolbar";
import { SummaryMetrics } from "../SummaryMetrics";
import { MetricsLoader } from "./MetricsLoader";
import { DashboardTabs } from "./DashboardTabs";

export const AuditDashboard = () => {
  const {
    filters,
    setFilters,
    reports,
    isLoading,
    metrics,
    isLoadingMetrics,
    isRefreshing,
    handleRefresh,
    handleExport
  } = useDashboardData();

  return (
    <div className="space-y-6">
      <DashboardHeader 
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <FilterToolbar 
        filters={filters}
        onFilterChange={setFilters}
        onExport={handleExport}
      />

      {isLoadingMetrics ? (
        <MetricsLoader />
      ) : (
        <SummaryMetrics metrics={metrics || {
          totalLiability: 0,
          filingCount: 0,
          pendingPayments: 0,
          complianceRate: 0
        }} />
      )}

      <DashboardTabs 
        reports={reports}
        isLoading={isLoading}
      />
    </div>
  );
};
