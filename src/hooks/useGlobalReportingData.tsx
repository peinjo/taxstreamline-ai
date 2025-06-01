
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GlobalFilters {
  country: string;
  dateRange: "week" | "month" | "quarter" | "year";
  reportType: string;
  priority: string;
}

export const useGlobalReportingData = () => {
  const [filters, setFilters] = useState<GlobalFilters>({
    country: "all",
    dateRange: "month",
    reportType: "all",
    priority: "all",
  });

  // Fetch global deadlines
  const { 
    data: deadlines = [], 
    isLoading: isLoadingDeadlines,
    refetch: refetchDeadlines 
  } = useQuery({
    queryKey: ["global-deadlines", filters],
    queryFn: async () => {
      let query = supabase
        .from("global_deadlines")
        .select("*")
        .order("due_date", { ascending: true });

      if (filters.country !== "all") {
        query = query.eq("country", filters.country);
      }
      if (filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      const { data, error } = await query;
      if (error) {
        toast.error(`Error loading deadlines: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch recent reports
  const { 
    data: reports = [], 
    isLoading: isLoadingReports,
    refetch: refetchReports 
  } = useQuery({
    queryKey: ["global-reports", filters],
    queryFn: async () => {
      let query = supabase
        .from("tax_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (filters.country !== "all") {
        query = query.eq("country", filters.country);
      }
      if (filters.reportType !== "all") {
        query = query.eq("tax_type", filters.reportType);
      }

      const { data, error } = await query;
      if (error) {
        toast.error(`Error loading reports: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch compliance requirements
  const { 
    data: compliance = [], 
    isLoading: isLoadingCompliance,
    refetch: refetchCompliance 
  } = useQuery({
    queryKey: ["global-compliance", filters],
    queryFn: async () => {
      let query = supabase
        .from("global_compliance")
        .select("*")
        .order("next_due_date", { ascending: true });

      if (filters.country !== "all") {
        query = query.eq("country", filters.country);
      }

      const { data, error } = await query;
      if (error) {
        toast.error(`Error loading compliance: ${error.message}`);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Get unique countries including West African countries
  const { data: countries = [] } = useQuery({
    queryKey: ["global-countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_deadlines")
        .select("country")
        .order("country");

      if (error) throw error;
      
      const dbCountries = [...new Set(data?.map(item => item.country) || [])];
      
      // Add West African countries to ensure they're always available
      const westAfricanCountries = [
        "Nigeria",
        "Ghana",
        "Senegal",
        "Mali",
        "Burkina Faso",
        "Ivory Coast",
        "Guinea",
        "Benin",
        "Togo",
        "Sierra Leone",
        "Liberia",
        "Mauritania",
        "Niger",
        "Guinea-Bissau",
        "Gambia",
        "Cape Verde"
      ];
      
      // Combine database countries with West African countries and remove duplicates
      const allCountries = [...new Set([...dbCountries, ...westAfricanCountries])].sort();
      
      return allCountries;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  const isLoading = isLoadingDeadlines || isLoadingReports || isLoadingCompliance;

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchDeadlines(),
        refetchReports(),
        refetchCompliance()
      ]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Calculate summary metrics
  const metrics = {
    totalDeadlines: deadlines.length,
    urgentDeadlines: deadlines.filter(d => d.priority === "high").length,
    countriesActive: new Set(deadlines.map(d => d.country)).size,
    complianceItems: compliance.length,
  };

  return {
    filters,
    setFilters,
    deadlines,
    reports,
    compliance,
    countries,
    metrics,
    isLoading,
    handleRefresh,
  };
};
