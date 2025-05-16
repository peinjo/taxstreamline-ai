
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Header } from "./Header";
import { useSampleData } from "./useSampleData";
import { AuditLogsTab } from "./tabs/AuditLogsTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { ConfirmationsTab } from "./tabs/ConfirmationsTab";
import { ControlsTab } from "./tabs/ControlsTab";
import { DashboardTab } from "./tabs/DashboardTab";

export const AuditReportingPage = () => {
  const { 
    taxReports, 
    createSampleData 
  } = useSampleData();

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
        <Header 
          taxReportsCount={taxReports?.length} 
          createSampleData={createSampleData} 
        />

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
            <TabsTrigger value="controls">Internal Controls</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="confirmations" className="space-y-6">
            <ConfirmationsTab />
          </TabsContent>
          
          <TabsContent value="controls" className="space-y-6">
            <ControlsTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
