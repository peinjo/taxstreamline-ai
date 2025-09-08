
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { LoadingStateManager } from "@/components/common/LoadingStateManager";
import { ResponsiveContainer } from "@/components/common/ResponsiveContainer";
import { AuditSEO } from "@/components/seo/SEOHead";
import { useAccessibility } from "@/hooks/useAccessibility";
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
  const { announce } = useAccessibility({ announceChanges: true });

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

  const handleTabChange = (value: string) => {
    const tabNames: Record<string, string> = {
      dashboard: "Dashboard",
      analytics: "Analytics", 
      confirmations: "Confirmations",
      controls: "Internal Controls",
      audit: "Audit Logs"
    };
    announce(`Switched to ${tabNames[value]} tab`);
  };

  return (
    <DashboardLayout>
      <AuditSEO />
      <ResponsiveContainer className="container mx-auto p-6 space-y-8">
        <Header 
          taxReportsCount={taxReports?.length} 
          createSampleData={createSampleData} 
        />

        <LoadingStateManager
          isLoading={false}
          isError={false}
          isEmpty={false}
        >
          <Tabs 
            defaultValue="dashboard" 
            className="space-y-6"
            onValueChange={handleTabChange}
          >
            <TabsList 
              role="tablist" 
              aria-label="Audit reporting sections"
              className="grid w-full grid-cols-5"
            >
              <TabsTrigger 
                value="dashboard"
                role="tab"
                aria-label="Dashboard - Overview and metrics"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                role="tab" 
                aria-label="Analytics - Data analysis and trends"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="confirmations"
                role="tab"
                aria-label="Confirmations - External confirmations management"
              >
                Confirmations
              </TabsTrigger>
              <TabsTrigger 
                value="controls"
                role="tab"
                aria-label="Internal Controls - Control monitoring"
              >
                Internal Controls
              </TabsTrigger>
              <TabsTrigger 
                value="audit"
                role="tab"
                aria-label="Audit Logs - Activity tracking"
              >
                Audit Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="analytics" role="tabpanel" aria-labelledby="analytics-tab">
              <AnalyticsTab />
            </TabsContent>

            <TabsContent value="confirmations" role="tabpanel" aria-labelledby="confirmations-tab">
              <ConfirmationsTab />
            </TabsContent>
            
            <TabsContent value="controls" role="tabpanel" aria-labelledby="controls-tab">
              <ControlsTab />
            </TabsContent>

            <TabsContent value="audit" role="tabpanel" aria-labelledby="audit-tab">
              <AuditLogsTab />
            </TabsContent>
          </Tabs>
        </LoadingStateManager>
      </ResponsiveContainer>
    </DashboardLayout>
  );
};
