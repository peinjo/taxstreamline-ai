
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaxReport } from "@/types/tax";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TaxSummaryParams {
  searchQuery?: string;
  yearFilter?: string;
  statusFilter?: string;
  page?: number;
  pageSize?: number;
}

export const useTaxSummary = ({
  searchQuery = "",
  yearFilter = "all",
  statusFilter = "all",
  page = 1,
  pageSize = 10,
}: TaxSummaryParams = {}) => {
  const { user } = useAuth();
  
  const fetchTaxReports = async (): Promise<TaxReport[]> => {
    let query = supabase
      .from("tax_reports")
      .select("*");
    
    // Filter by user if authenticated
    if (user?.id) {
      query = query.eq("user_id", user.id);
    }
    
    // Apply year filter
    if (yearFilter !== "all") {
      query = query.eq("tax_year", parseInt(yearFilter));
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    
    // Apply search query filter
    if (searchQuery) {
      query = query.ilike("tax_type", `%${searchQuery}%`);
    }
    
    // Order by creation date descending
    query = query.order("created_at", { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as TaxReport[];
  };

  return useQuery({
    queryKey: ["tax-reports", user?.id, searchQuery, yearFilter, statusFilter, page, pageSize],
    queryFn: fetchTaxReports,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching tax reports:", error);
        toast.error("Failed to fetch tax reports");
      }
    },
  });
};
