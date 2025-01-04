import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="flex gap-4">
      <Select
        value={filters.year.toString()}
        onValueChange={(value) =>
          onFilterChange({ ...filters, year: parseInt(value) })
        }
      >
        <SelectTrigger className="w-[180px]">
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

      <Select
        value={filters.taxType}
        onValueChange={(value) => onFilterChange({ ...filters, taxType: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tax Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="corporate">Corporate Tax</SelectItem>
          <SelectItem value="vat">VAT</SelectItem>
          <SelectItem value="paye">PAYE</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};