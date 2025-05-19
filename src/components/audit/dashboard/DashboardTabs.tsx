
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxSummaryTable } from "../tax-summary";
import { TaxCharts } from "../TaxCharts";
import { Card } from "@/components/ui/card";
import { ChartsSkeleton } from "./ChartsSkeleton";
import { NoDataDisplay } from "./NoDataDisplay";
import { TaxReport } from "@/types/audit";

interface DashboardTabsProps {
  reports: TaxReport[] | null;
  isLoading: boolean;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ reports, isLoading }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
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

      <TabsContent value="detailed">
        <TaxSummaryTable />
      </TabsContent>
    </Tabs>
  );
};
