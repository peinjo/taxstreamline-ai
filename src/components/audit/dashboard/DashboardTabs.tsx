
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxSummaryTable } from "../tax-summary";
import { TaxCharts } from "../TaxCharts";
import { Card } from "@/components/ui/card";
import { ChartsSkeleton } from "./ChartsSkeleton";
import { NoDataDisplay } from "./NoDataDisplay";
import { TaxReport } from "@/types/audit";
import { AnalyticsCharts } from "../AnalyticsCharts";

interface DashboardTabsProps {
  reports: TaxReport[] | null;
  isLoading: boolean;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ reports, isLoading }) => {
  // Process data for analytics charts
  const taxTypeData = React.useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    const typeMap = new Map<string, number>();
    reports.forEach(report => {
      const current = typeMap.get(report.tax_type) || 0;
      typeMap.set(report.tax_type, current + report.amount);
    });
    
    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
      value
    }));
  }, [reports]);

  const statusData = React.useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    const statusMap = new Map<string, number>();
    reports.forEach(report => {
      const current = statusMap.get(report.status) || 0;
      statusMap.set(report.status, current + 1);
    });
    
    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [reports]);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {isLoading ? (
          <ChartsSkeleton />
        ) : reports && reports.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <TaxCharts data={reports} />
          </div>
        ) : (
          <NoDataDisplay />
        )}
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-6">
        {isLoading ? (
          <ChartsSkeleton />
        ) : reports && reports.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <AnalyticsCharts 
              taxData={taxTypeData} 
              title="Tax Distribution by Type"
              description="Breakdown of taxes by category"
            />
            <AnalyticsCharts 
              taxData={statusData} 
              title="Filing Status Distribution"
              description="Number of filings by status"
            />
          </div>
        ) : (
          <NoDataDisplay />
        )}
      </TabsContent>

      <TabsContent value="detailed">
        <TaxSummaryTable />
      </TabsContent>
    </Tabs>
  );
};
