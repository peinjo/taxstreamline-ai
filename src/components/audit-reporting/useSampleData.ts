
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSampleData = () => {
  const { user } = useAuth();
  // Check if tax reports exist
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
        
      if (!existingMetrics?.length && user?.id) {
        await supabase
          .from("dashboard_metrics")
          .insert([{
            upcoming_deadlines: 4,
            active_clients: 28,
            documents_pending: 12,
            compliance_alerts: 3,
            user_id: user.id
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

  return { taxReports, createSampleData };
};
