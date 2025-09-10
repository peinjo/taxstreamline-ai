
import React from "react";
import { ReportFilters } from "../ReportFilters";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface ReportFiltersData {
  year: number;
  taxType: string;
  status: string;
}

interface FilterToolbarProps {
  filters: ReportFiltersData;
  onFilterChange: (filters: ReportFiltersData) => void;
  onExport: (format: "pdf" | "excel") => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onExport
}) => {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <ReportFilters filters={filters} onFilterChange={onFilterChange} />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onExport("pdf")}
          className="gap-2"
          disabled={!filters}
        >
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => onExport("excel")}
          className="gap-2"
          disabled={!filters}
        >
          <FileDown className="h-4 w-4" />
          Export Excel
        </Button>
      </div>
    </div>
  );
};
