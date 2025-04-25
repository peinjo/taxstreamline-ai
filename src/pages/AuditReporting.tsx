
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { AuditTable } from "@/components/audit/AuditTable";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { TaxSummaryTable } from "@/components/audit/TaxSummaryTable";
import { TaxCharts } from "@/components/audit/TaxCharts";
import { MaterialityCalculator } from "@/components/audit/MaterialityCalculator";
import { ConfirmationManager } from "@/components/audit/ConfirmationManager";
import { InternalControlsMonitor } from "@/components/audit/InternalControlsMonitor";
import { AccountsReceivableAnalysis } from "@/components/audit/AccountsReceivableAnalysis";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

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

  const { data: taxReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["tax-reports", filters],
    queryFn: async () => {
      let query = supabase
        .from("tax_reports")
        .select("*")
        .eq("tax_year", filters.year);

      if (filters.taxType !== "all") {
        query = query.eq("tax_type", filters.taxType);
      }
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
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

  const handleGenerateAuditSummary = () => {
    // In a real implementation, this would generate a PDF or downloadable report
    console.log("Generating audit summary");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Audit & Reporting</h1>
          <p className="text-muted-foreground">
            View and analyze tax reports, confirmations, and internal controls
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
            <TabsTrigger value="controls">Internal Controls</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="export">Tax Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <SummaryMetrics metrics={mockMetrics} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <MaterialityCalculator />
              <AccountsReceivableAnalysis />
            </div>
            
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
            
            <div className="flex justify-end">
              <Button onClick={handleGenerateAuditSummary} className="gap-2">
                <FileDown className="h-4 w-4" />
                Generate Audit Summary
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="confirmations" className="space-y-6">
            <ConfirmationManager />
          </TabsContent>
          
          <TabsContent value="controls" className="space-y-6">
            <InternalControlsMonitor />
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
                  {taxReports && taxReports.length > 0 && <TaxCharts data={taxReports} />}
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
