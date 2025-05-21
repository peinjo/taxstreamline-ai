
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DashboardFilters {
  year: number;
  taxType: string;
  status: string;
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    year: new Date().getFullYear(),
    taxType: "all",
    status: "all",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch tax reports with filters and enhanced caching
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
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache persists for 30 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false, // Prevent refetching when window regains focus
    refetchOnMount: true, // Fetch when component mounts
  });

  // Fetch summary metrics with enhanced caching
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
    staleTime: 10 * 60 * 1000, // Metrics considered fresh for 10 minutes
    gcTime: 60 * 60 * 1000, // Cache persists for 1 hour (renamed from cacheTime)
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
    
    toast.success(`Exporting ${format.toUpperCase()} report`);
  };

  return {
    filters,
    setFilters,
    reports,
    isLoading,
    metrics,
    isLoadingMetrics,
    isRefreshing,
    handleRefresh,
    handleExport
  };
};
