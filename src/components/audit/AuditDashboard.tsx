
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxSummaryTable } from "./TaxSummaryTable";
import { TaxCharts } from "./TaxCharts";
import { ReportFilters } from "./ReportFilters";
import { SummaryMetrics } from "./SummaryMetrics";
import { Button } from "@/components/ui/button";
import { FileDown, ZoomIn, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export const AuditDashboard = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    taxType: "all",
    status: "all",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch tax reports with filters
  const { 
    data: reports, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ["tax-reports", filters],
    queryFn: async () => {
      let query = supabase
        .from("tax_reports")
        .select("*");

      if (filters.taxType !== "all") {
        query = query.eq("tax_type", filters.taxType);
      }
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      query = query.eq("tax_year", filters.year);

      const { data, error } = await query;
      if (error) {
        toast.error(`Error loading tax reports: ${error.message}`);
        throw error;
      }
      return data || [];
    },
  });

  // Fetch summary metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["audit-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        toast.error(`Error loading metrics: ${error.message}`);
        throw error;
      }

      if (!data) {
        // Return default metrics if no data exists
        return {
          totalLiability: 0,
          filingCount: 0,
          pendingPayments: 0,
          complianceRate: 0
        };
      }

      // Calculate metrics from actual data
      const totalLiability = reports ? reports.reduce((sum, report) => sum + Number(report.amount || 0), 0) : 0;
      
      return {
        totalLiability,
        filingCount: data.documents_pending || 0,
        pendingPayments: data.upcoming_deadlines || 0,
        complianceRate: data.active_clients || 0,
      };
    },
    enabled: !isLoading, // Only run after reports are loaded
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = (format: "pdf" | "excel") => {
    if (!reports || reports.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // The export implementation is in TaxSummaryTable component
    toast.success(`Exporting ${format.toUpperCase()} report`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Audit Dashboard</h2>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <ReportFilters filters={filters} onFilterChange={setFilters} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("excel")}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {isLoadingMetrics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <SummaryMetrics metrics={metrics || {
          totalLiability: 0,
          filingCount: 0,
          pendingPayments: 0,
          complianceRate: 0
        }} />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="min-h-[350px] flex items-center justify-center">
                  <Skeleton className="h-[300px] w-[400px]" />
                </Card>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <TaxCharts data={reports} />
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No data available for the selected filters.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try changing your filters or adding new tax reports.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detailed">
          <TaxSummaryTable data={reports || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
