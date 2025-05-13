
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { AuditTable } from "@/components/audit/AuditTable";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { TaxSummaryTable } from "@/components/audit/TaxSummaryTable";
import { MaterialityCalculator } from "@/components/audit/MaterialityCalculator";
import { ConfirmationManager } from "@/components/audit/ConfirmationManager";
import { InternalControlsMonitor } from "@/components/audit/InternalControlsMonitor";
import { AccountsReceivableAnalysis } from "@/components/audit/AccountsReceivableAnalysis";
import { AuditDashboard } from "@/components/audit/AuditDashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const AuditReporting = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    taxType: "all",
    status: "all",
  });

  const { data: activities, isLoading: isLoadingActivities, refetch: refetchActivities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(`Error loading audit activities: ${error.message}`);
        throw error;
      }
      return data || [];
    },
  });

  // Mock data for demonstration - would ideally connect to real data
  const mockMetrics = {
    totalLiability: 15000000,
    filingCount: 24,
    pendingPayments: 3,
    complianceRate: 92,
  };

  const handleRefreshActivities = async () => {
    try {
      await refetchActivities();
      toast.success("Audit logs refreshed");
    } catch (error) {
      console.error("Error refreshing audit logs:", error);
    }
  };

  const handleGenerateAuditSummary = () => {
    toast.success("Generating comprehensive audit summary...", {
      duration: 3000,
    });
    // In a real implementation, this would generate a PDF or downloadable report
    setTimeout(() => {
      toast.success("Audit summary generated successfully");
    }, 3000);
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

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
            <TabsTrigger value="controls">Internal Controls</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AuditDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SummaryMetrics metrics={mockMetrics} />
            
            <div className="grid gap-6 md:grid-cols-2">
              <MaterialityCalculator />
              <AccountsReceivableAnalysis />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsCharts
                taxData={[
                  { name: "Jan", value: 4000 },
                  { name: "Feb", value: 3000 },
                  { name: "Mar", value: 2000 },
                  { name: "Apr", value: 2780 },
                  { name: "May", value: 1890 },
                  { name: "Jun", value: 2390 },
                ]}
                title="Monthly Tax Payments"
                description="Overview of tax payments over time"
              />
              <AnalyticsCharts
                taxData={[
                  { name: "Corporate", value: 4000 },
                  { name: "VAT", value: 3000 },
                  { name: "PAYE", value: 2000 },
                  { name: "Capital Gains", value: 1500 },
                  { name: "Withholding", value: 1200 },
                ]}
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
              <div className="flex justify-between items-center">
                <ReportFilters filters={filters} onFilterChange={setFilters} />
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleRefreshActivities}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Logs
                </Button>
              </div>
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Recent Activity Logs</h3>
                {activities && <AuditTable activities={activities} />}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditReporting;
