
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
}: DocumentSearchProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Search & Filter</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType || ""} onValueChange={onFilterTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYear || ""} onValueChange={onFilterYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Years</SelectItem>
            {uniqueYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(searchQuery || filterType || filterYear) && (
        <div className="flex items-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchQuery}
              </Badge>
            )}
            {filterType && (
              <Badge variant="outline" className="flex items-center gap-1">
                Type: {filterType}
              </Badge>
            )}
            {filterYear && (
              <Badge variant="outline" className="flex items-center gap-1">
                Year: {filterYear}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
