import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { AuditTable } from "@/components/audit/AuditTable";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { TaxSummaryTable } from "@/components/audit/TaxSummaryTable";
import { TaxCharts } from "@/components/audit/TaxCharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaxReport {
  tax_type: string;
  amount: number;
  status: string;
}

const AuditReporting = () => {
  const [filters, setFilters] = useState({
    dateRange: "all",
    taxType: "all",
    status: "all",
  });

  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
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

  const mockMetrics = {
    totalLiability: 15000000,
    filingCount: 24,
    pendingPayments: 3,
    complianceRate: 92,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Audit & Reporting</h1>
          <p className="text-muted-foreground">
            View and analyze tax reports and activities
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="export">Export Tax Report</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <SummaryMetrics metrics={mockMetrics} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsCharts data={taxReports || []} />
              <AnalyticsCharts data={taxReports || []} />
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-4">
              <ReportFilters filters={filters} onFilterChange={setFilters} />
              {activities && <AuditTable activities={activities} />}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Tax Report Summary</h3>
                <div className="space-y-4">
                  <ReportFilters filters={filters} onFilterChange={setFilters} />
                  <TaxSummaryTable 
                    data={taxReports || []} 
                    isLoading={isLoadingReports} 
                  />
                  {taxReports && <TaxCharts data={taxReports} />}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditReporting;