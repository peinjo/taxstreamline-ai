
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearFilterProps {
  selectedYear: string;
  availableYears: string[];
  onYearChange: (year: string) => void;
}

export const YearFilter: React.FC<YearFilterProps> = ({
  selectedYear,
  availableYears,
  onYearChange,
}) => {
  return (
    <div className="flex items-center">
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue placeholder="Filter by year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year === "all" ? "All Years" : year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
