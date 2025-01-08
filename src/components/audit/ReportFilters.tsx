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
    dateRange: string;
    taxType: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
}

export const ReportFilters = ({ filters, onFilterChange }: FiltersProps) => {
  return (
    <div className="flex gap-4">
      <Select
        value={filters.dateRange}
        onValueChange={(value) =>
          onFilterChange({ ...filters, dateRange: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
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