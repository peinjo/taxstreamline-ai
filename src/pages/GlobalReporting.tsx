
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useGlobalReportingData } from "@/hooks/useGlobalReportingData";
import { GlobalReportingFilters } from "@/components/global-reporting/GlobalReportingFilters";
import { GlobalMetricsCards } from "@/components/global-reporting/GlobalMetricsCards";
import { UpcomingDeadlinesTable } from "@/components/global-reporting/UpcomingDeadlinesTable";
import { RecentReportsTable } from "@/components/global-reporting/RecentReportsTable";
import { ComplianceTracker } from "@/components/global-reporting/ComplianceTracker";
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
        <Tabs defaultValue="deadlines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="deadlines" className="space-y-6">
            <UpcomingDeadlinesTable deadlines={deadlines} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <RecentReportsTable reports={reports} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceTracker compliance={compliance} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingDeadlinesTable deadlines={deadlines.slice(0, 5)} isLoading={isLoading} />
              <RecentReportsTable reports={reports.slice(0, 5)} isLoading={isLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GlobalReporting;
