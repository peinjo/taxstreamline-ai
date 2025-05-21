
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DocumentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string | null;
  onFilterTypeChange: (type: string) => void;
  filterYear: string | null;
  onFilterYearChange: (year: string) => void;
  uniqueYears: string[];
  documentTypes: string[];
  onClearFilters?: () => void;
  isMobile?: boolean;
}

export function DocumentSearch({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterYear,
  onFilterYearChange,
  uniqueYears,
  documentTypes,
  onClearFilters,
  isMobile = false,
}: DocumentSearchProps) {
  const hasActiveFilters = searchQuery || (filterType && filterType !== "all") || (filterYear && filterYear !== "all");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Search & Filter</h3>
        {hasActiveFilters && onClearFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
      
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType || "all"} onValueChange={onFilterTypeChange}>
          <SelectTrigger className={isMobile ? "mt-2 md:mt-0" : ""}>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterYear || "all"} onValueChange={onFilterYearChange}>
          <SelectTrigger className={isMobile ? "mt-2 md:mt-0" : ""}>
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {uniqueYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchQuery}
                <button onClick={() => onSearchChange("")} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterType && filterType !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Type: {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                <button onClick={() => onFilterTypeChange("all")} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterYear && filterYear !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Year: {filterYear}
                <button onClick={() => onFilterYearChange("all")} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
