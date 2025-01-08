import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditTable } from "@/components/audit/AuditTable";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { TaxSummaryTable } from "@/components/audit/TaxSummaryTable";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TaxReport } from "@/types";

const AuditReporting = () => {
  const [filters, setFilters] = useState({
    dateRange: "all",
    taxType: "all",
    status: "all",
  });

  const { data: taxReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["tax-reports", filters],
    queryFn: async () => {
      let query = supabase.from("tax_reports").select("*");

      if (filters.dateRange === "year") {
        const currentYear = new Date().getFullYear();
        query = query.eq("tax_year", currentYear);
      } else if (filters.dateRange === "quarter") {
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        query = query.gte("created_at", threeMonthsAgo.toISOString());
      } else if (filters.dateRange === "month") {
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        query = query.gte("created_at", oneMonthAgo.toISOString());
      }

      if (filters.taxType !== "all") {
        query = query.eq("tax_type", filters.taxType);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TaxReport[];
    },
  });

  // Query for activities
  const { data: activities = [] } = useQuery({
    queryKey: ["audit-activities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("*");
      if (error) throw error;
      return data;
    },
  });

  const mockMetrics = {
    totalLiability: 15000000,
    filingCount: 120, // Added filingCount
    pendingPayments: 3000000,
    complianceRate: 80,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Audit & Reporting</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your tax compliance and reporting
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ReportFilters filters={filters} onFilterChange={setFilters} />
            
            <SummaryMetrics metrics={mockMetrics} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsCharts data={taxReports || []} />
              <AnalyticsCharts data={taxReports || []} />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <TaxSummaryTable data={taxReports || []} isLoading={isLoadingReports} />
          </TabsContent>

          <TabsContent value="audit-log">
            <AuditTable activities={activities} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditReporting;