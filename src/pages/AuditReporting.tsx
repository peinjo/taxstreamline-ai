
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { AuditTable } from "@/components/audit/AuditTable";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { TaxSummaryTable } from "@/components/audit/tax-summary"; // Updated import path
import { MaterialityCalculator } from "@/components/audit";  // Updated import path
import { ConfirmationManager } from "@/components/audit/ConfirmationManager";
import { InternalControlsMonitor } from "@/components/audit/InternalControlsMonitor";
import { AccountsReceivableAnalysis } from "@/components/audit/AccountsReceivableAnalysis";
import { AuditDashboard } from "@/components/audit/AuditDashboard";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw, Database } from "lucide-react";
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
  
  const { data: taxReports } = useQuery({
    queryKey: ["tax-reports-check"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_reports")
        .select("*")
        .limit(1);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Create sample data if the tax_reports table is empty
  const createSampleData = useMutation({
    mutationFn: async () => {
      // Sample tax reports data
      const currentYear = new Date().getFullYear();
      
      const sampleTaxReports = [
        // Corporate Income Tax reports
        { tax_type: "corporate", tax_year: currentYear, amount: 4500000, status: "paid" },
        { tax_type: "corporate", tax_year: currentYear - 1, amount: 4200000, status: "paid" },
        { tax_type: "corporate", tax_year: currentYear - 2, amount: 3800000, status: "paid" },
        
        // VAT reports - current year
        { tax_type: "vat", tax_year: currentYear, amount: 850000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear, amount: 780000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear, amount: 830000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear, amount: 795000, status: "pending" },
        
        // VAT reports - previous years
        { tax_type: "vat", tax_year: currentYear - 1, amount: 770000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear - 1, amount: 750000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear - 1, amount: 780000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear - 2, amount: 720000, status: "paid" },
        { tax_type: "vat", tax_year: currentYear - 2, amount: 690000, status: "paid" },
        
        // PAYE reports
        { tax_type: "paye", tax_year: currentYear, amount: 1250000, status: "paid" },
        { tax_type: "paye", tax_year: currentYear - 1, amount: 1150000, status: "paid" },
        { tax_type: "paye", tax_year: currentYear - 2, amount: 980000, status: "paid" },
        
        // Withholding Tax reports
        { tax_type: "withholding", tax_year: currentYear, amount: 320000, status: "pending" },
        { tax_type: "withholding", tax_year: currentYear - 1, amount: 300000, status: "paid" },
        { tax_type: "withholding", tax_year: currentYear - 2, amount: 270000, status: "paid" },
        
        // Capital Gains Tax
        { tax_type: "capital_gains", tax_year: currentYear, amount: 180000, status: "pending" },
        { tax_type: "capital_gains", tax_year: currentYear - 1, amount: 150000, status: "paid" },
        
        // Education Tax
        { tax_type: "education", tax_year: currentYear, amount: 225000, status: "paid" },
        { tax_type: "education", tax_year: currentYear - 1, amount: 210000, status: "paid" },
        
        // Stamp Duty
        { tax_type: "stamp_duty", tax_year: currentYear, amount: 75000, status: "pending" },
        { tax_type: "stamp_duty", tax_year: currentYear - 1, amount: 68000, status: "paid" },
      ];
      
      const { error } = await supabase
        .from("tax_reports")
        .insert(sampleTaxReports);

      if (error) throw error;
      
      // Create a sample dashboard metric if needed
      const { data: existingMetrics } = await supabase
        .from("dashboard_metrics")
        .select("*")
        .limit(1);
        
      if (!existingMetrics?.length) {
        await supabase
          .from("dashboard_metrics")
          .insert([{
            upcoming_deadlines: 4,
            active_clients: 28,
            documents_pending: 12,
            compliance_alerts: 3
          }]);
      }
      
      return true;
    },
    onSuccess: () => {
      toast.success("Sample data created successfully.");
      window.location.reload(); // Reload to show the new data
    },
    onError: (error) => {
      toast.error(`Failed to create sample data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

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
  
  // Check if we need to create sample data
  useEffect(() => {
    if (taxReports !== undefined && taxReports.length === 0) {
      toast("No tax reports found. Do you want to create sample data?", {
        action: {
          label: "Create Sample Data",
          onClick: () => createSampleData.mutate()
        },
        duration: 10000,
      });
    }
  }, [taxReports]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Audit & Reporting</h1>
            <p className="text-muted-foreground">
              View and analyze tax reports, confirmations, and internal controls
            </p>
          </div>
          
          {taxReports?.length === 0 && (
            <Button 
              onClick={() => createSampleData.mutate()} 
              disabled={createSampleData.isPending}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              {createSampleData.isPending ? "Creating Sample Data..." : "Create Sample Data"}
            </Button>
          )}
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
            <SummaryMetrics metrics={{
              totalLiability: 8500000,
              filingCount: 24,
              pendingPayments: 3,
              complianceRate: 92,
            }} />
            
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
