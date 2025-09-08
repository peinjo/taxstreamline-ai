import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { DashboardFilters } from "./useDashboardData";

interface AccessibleFilterToolbarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  onExport: (format: "pdf" | "excel") => void;
}

export const AccessibleFilterToolbar: React.FC<AccessibleFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onExport
}) => {
  const { announce, getAriaProps, getFocusProps } = useAccessibility({ announceChanges: true });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleFilterChange = (key: keyof DashboardFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
    announce(`Filter ${key} changed to ${value}`);
  };

  const handleExport = (format: "pdf" | "excel") => {
    announce(`Exporting filtered data as ${format.toUpperCase()}`);
    onExport(format);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div 
          className="flex flex-wrap gap-4 items-center justify-between"
          role="region"
          {...getAriaProps("Data filters and export options", "filter-help")}
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="space-y-1">
              <label htmlFor="year-filter" className="text-sm font-medium">
                Tax Year
              </label>
              <Select
                value={filters.year.toString()}
                onValueChange={(value) => handleFilterChange('year', parseInt(value))}
              >
                <SelectTrigger 
                  id="year-filter"
                  className="w-32"
                  aria-label="Select tax year for filtering"
                >
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year, index) => (
                    <SelectItem 
                      key={year} 
                      value={year.toString()}
                      {...getFocusProps(index, years.length)}
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label htmlFor="tax-type-filter" className="text-sm font-medium">
                Tax Type
              </label>
              <Select
                value={filters.taxType}
                onValueChange={(value) => handleFilterChange('taxType', value)}
              >
                <SelectTrigger 
                  id="tax-type-filter"
                  className="w-40"
                  aria-label="Select tax type for filtering"
                >
                  <SelectValue placeholder="Tax Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vat">VAT</SelectItem>
                  <SelectItem value="income">Income Tax</SelectItem>
                  <SelectItem value="corporate">Corporate Tax</SelectItem>
                  <SelectItem value="withholding">Withholding Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger 
                  id="status-filter"
                  className="w-36"
                  aria-label="Select status for filtering"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2" role="group" aria-label="Export options">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              aria-label="Export filtered data as PDF"
            >
              <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("excel")}
              aria-label="Export filtered data as Excel spreadsheet"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" aria-hidden="true" />
              Excel
            </Button>
          </div>
        </div>
        
        <div id="filter-help" className="sr-only">
          Use the filters above to narrow down the data view. Export options are available to download the filtered results.
        </div>
      </CardContent>
    </Card>
  );
};