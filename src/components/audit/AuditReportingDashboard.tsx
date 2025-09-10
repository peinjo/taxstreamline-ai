
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

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "excel") => {
    if (!reports || reports.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    try {
      const { exportData } = await import("@/services/exportService");
      
      const totalAmount = reports.reduce((sum, report) => sum + Number(report.amount || 0), 0);
      const paidAmount = reports.filter(r => r.status === 'paid').reduce((sum, report) => sum + Number(report.amount || 0), 0);
      
      await exportData(
        reports,
        format,
        {
          title: "Audit Reporting Dashboard",
          filename: `audit-reports-${format}-${new Date().toISOString().split('T')[0]}`,
          summaryData: {
            "Total Tax Amount": totalAmount,
            "Paid Amount": paidAmount,
            "Pending Amount": totalAmount - paidAmount,
            "Total Reports": reports.length,
            "Filter Year": filters.year,
            "Tax Type Filter": filters.taxType === 'all' ? 'All Types' : filters.taxType,
            "Status Filter": filters.status === 'all' ? 'All Statuses' : filters.status
          }
        },
        setIsExporting
      );
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
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
              disabled={isExporting || isLoading}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isExporting || isLoading}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Excel"}
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
