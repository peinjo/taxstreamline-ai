import React, { useState } from "react";
import { TaxSummaryTable } from "./TaxSummaryTable";
import { TaxCharts } from "./TaxCharts";
import { ReportFilters } from "./ReportFilters";
import { ActivityLog } from "./ActivityLog";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const AuditReportingDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    taxType: "all",
    status: "all",
  });

  const { data: organization } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organizations(*)")
        .eq("user_id", user?.id)
        .single();
      return memberData?.organizations;
    },
    enabled: !!user,
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ["tax-reports", filters, organization?.id],
    queryFn: async () => {
      let query = supabase
        .from("tax_reports")
        .select("*")
        .eq("organization_id", organization?.id);

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
    enabled: !!organization,
  });

  const handleExport = (format: "pdf" | "excel") => {
    // Implementation for export functionality will be added later
    console.log(`Exporting as ${format}...`);
  };

  if (!organization) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-2">No Organization Found</h2>
        <p className="text-muted-foreground">
          Please join or create an organization to view tax reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">Tax Reports & Activity</p>
        </div>
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

      <ReportFilters filters={filters} onFilterChange={setFilters} />

      <div className="grid gap-6 md:grid-cols-2">
        <TaxCharts data={reports || []} />
      </div>

      <TaxSummaryTable data={reports || []} isLoading={isLoading} />
      
      <ActivityLog organizationId={organization.id} />
    </div>
  );
};