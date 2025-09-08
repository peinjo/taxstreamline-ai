
import React from "react";
import { useDashboardData } from "./useDashboardData";
import { AccessibleDashboardHeader } from "./AccessibleDashboardHeader";
import { AccessibleFilterToolbar } from "./AccessibleFilterToolbar";
import { SummaryMetrics } from "../SummaryMetrics";
import { LoadingStateManager } from "@/components/common/LoadingStateManager";
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
      <AccessibleDashboardHeader 
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <AccessibleFilterToolbar 
        filters={filters}
        onFilterChange={setFilters}
        onExport={handleExport}
      />

      <LoadingStateManager
        isLoading={isLoadingMetrics}
        isError={false}
        isEmpty={false}
        skeletonRows={4}
      >
        <SummaryMetrics metrics={metrics || {
          totalLiability: 0,
          filingCount: 0,
          pendingPayments: 0,
          complianceRate: 0
        }} />
      </LoadingStateManager>

      <DashboardTabs 
        reports={reports}
        isLoading={isLoading}
      />
    </div>
  );
};
