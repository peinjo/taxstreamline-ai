
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useGlobalReportingData } from "@/hooks/useGlobalReportingData";
import { GlobalReportingFilters } from "@/components/global-reporting/GlobalReportingFilters";
import { GlobalMetricsCards } from "@/components/global-reporting/GlobalMetricsCards";
import { UpcomingDeadlinesTable } from "@/components/global-reporting/UpcomingDeadlinesTable";
import { RecentReportsTable } from "@/components/global-reporting/RecentReportsTable";
import { ComplianceTracker } from "@/components/global-reporting/ComplianceTracker";
import { GlobalDocumentManager } from "@/components/global-reporting/GlobalDocumentManager";
import { GlobalWorldMap } from "@/components/global-reporting/GlobalWorldMap";
import { GlobalFormWorkflows } from "@/components/global-reporting/GlobalFormWorkflows";
import { GlobalAnalytics } from "@/components/global-reporting/GlobalAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GlobalReporting = () => {
  const {
    filters,
    setFilters,
    deadlines,
    reports,
    compliance,
    countries,
    metrics,
    isLoading,
    handleRefresh,
  } = useGlobalReportingData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Global Statutory Reporting</h1>
            <p className="text-muted-foreground">
              Manage international tax compliance and reporting requirements
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Report
          </Button>
        </div>

        {/* Filters */}
        <GlobalReportingFilters
          filters={filters}
          onFiltersChange={setFilters}
          countries={countries}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Metrics Cards */}
        <GlobalMetricsCards metrics={metrics} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <GlobalWorldMap 
              deadlines={deadlines} 
              compliance={compliance} 
              countries={countries}
            />
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-6">
            <UpcomingDeadlinesTable deadlines={deadlines} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <RecentReportsTable reports={reports} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <GlobalDocumentManager 
              selectedCountry={filters.country}
              countries={countries}
            />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceTracker />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <GlobalFormWorkflows 
              countries={countries}
              deadlines={deadlines}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <GlobalAnalytics 
              deadlines={deadlines}
              reports={reports}
              compliance={compliance}
              countries={countries}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GlobalReporting;
