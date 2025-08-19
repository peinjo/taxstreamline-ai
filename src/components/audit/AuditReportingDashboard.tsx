
import React, { useState } from "react";
import { ReportFilters } from "./ReportFilters";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const AuditReportingDashboard = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    taxType: "all",
    status: "all",
  });

  const { data: reports, isLoading } = useQuery({
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
      if (error) throw error;
      return data;
    },
  });

  const handleExport = (format: "pdf" | "excel") => {
    // Export functionality implementation
    toast(`Starting export as ${format}...`, {
      description: "Your export will be ready shortly.",
    });
    // Export processing would happen here
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle>Tax Reporting Dashboard</CardTitle>
          <div className="space-x-2">
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
      </CardHeader>
      
      <CardContent className="px-0 space-y-6">
        <ReportFilters filters={filters} onFilterChange={setFilters} />
        
        <DashboardTabs reports={reports} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};
