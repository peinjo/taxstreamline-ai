```typescript
import React, { useState } from "react";
import { TaxSummaryTable } from "./TaxSummaryTable";
import { TaxCharts } from "./TaxCharts";
import { ReportFilters } from "./ReportFilters";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    // Implementation for export functionality will be added later
    console.log(`Exporting as ${format}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ReportFilters filters={filters} onFilterChange={setFilters} />
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

      <div className="grid gap-6 md:grid-cols-2">
        <TaxCharts data={reports || []} />
      </div>

      <TaxSummaryTable data={reports || []} isLoading={isLoading} />
    </div>
  );
};
```
