
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { FilterControls } from "./FilterControls";
import { DateRangeFilter } from "./DateRangeFilter";
import { ActiveFiltersDisplay } from "./ActiveFiltersDisplay";

interface AdvancedEventFiltersProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
}

export interface FilterState {
  period: string;
  category: string;
  priority: string;
  status: string;
  company: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export function AdvancedEventFilters({ onSearchChange, onFilterChange, onSortChange }: AdvancedEventFiltersProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    period: "all",
    category: "all",
    priority: "all",
    status: "all",
    company: "",
    dateRange: {}
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      period: "all",
      category: "all",
      priority: "all",
      status: "all",
      company: "",
      dateRange: {}
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value.from || value.to;
    return value && value !== 'all' && value !== '';
  }).length;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Search Bar */}
      <SearchBar value={search} onChange={handleSearchChange} />

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <FilterControls 
          filters={filters}
          onFilterChange={handleFilterChange}
          onSortChange={onSortChange}
        />

        {/* Date Range Filter */}
        <DateRangeFilter 
          dateRange={filters.dateRange}
          onDateRangeChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
        />

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <ActiveFiltersDisplay 
        filters={filters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
