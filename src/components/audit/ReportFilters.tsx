
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface FiltersProps {
  filters: {
    year: number;
    taxType: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}

export const ReportFilters = ({ filters, onFilterChange }: FiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="year-filter">Year</Label>
        <Select
          value={filters.year.toString()}
          onValueChange={(value) =>
            onFilterChange({ ...filters, year: parseInt(value) })
          }
        >
          <SelectTrigger id="year-filter" className="w-[120px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="tax-type-filter">Tax Type</Label>
        <Select
          value={filters.taxType}
          onValueChange={(value) => onFilterChange({ ...filters, taxType: value })}
        >
          <SelectTrigger id="tax-type-filter" className="w-[160px]">
            <SelectValue placeholder="Tax Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="corporate">Corporate Tax</SelectItem>
            <SelectItem value="vat">VAT</SelectItem>
            <SelectItem value="paye">PAYE</SelectItem>
            <SelectItem value="capital_gains">Capital Gains</SelectItem>
            <SelectItem value="withholding">Withholding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="status-filter">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange({ ...filters, status: value })}
        >
          <SelectTrigger id="status-filter" className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
