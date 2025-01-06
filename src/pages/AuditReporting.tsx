import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { AuditTable } from "@/components/audit/AuditTable";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AuditReporting = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
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

  // Mock data for demonstration
  const mockChartData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 2000 },
    { name: "Apr", value: 2780 },
    { name: "May", value: 1890 },
    { name: "Jun", value: 2390 },
  ];

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
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <SummaryMetrics metrics={mockMetrics} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsCharts
                taxData={mockChartData}
                title="Monthly Tax Payments"
                description="Overview of tax payments over time"
              />
              <AnalyticsCharts
                taxData={mockChartData}
                title="Filing Distribution"
                description="Distribution of tax filings by type"
              />
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-4">
              <ReportFilters filters={filters} onFilterChange={setFilters} />
              {activities && <AuditTable activities={activities} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditReporting;