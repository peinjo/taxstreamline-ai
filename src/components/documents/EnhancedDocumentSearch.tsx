import React, { useState, useCallback, useMemo } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  type: "recent" | "tag" | "document";
  value: string;
  label: string;
}

interface EnhancedDocumentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  filterYear: string;
  onFilterYearChange: (year: string) => void;
  uniqueYears: number[];
  documentTypes: string[];
  tags?: string[];
  recentSearches?: string[];
  onClearFilters?: () => void;
  className?: string;
}

export function EnhancedDocumentSearch({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterYear,
  onFilterYearChange,
  uniqueYears,
  documentTypes,
  tags = [],
  recentSearches = [],
  onClearFilters,
  className,
}: EnhancedDocumentSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters = filterType !== "all" || filterYear !== "all" || searchQuery.length > 0;

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const items: SearchSuggestion[] = [];
    
    // Add recent searches
    recentSearches.slice(0, 3).forEach((search) => {
      items.push({ type: "recent", value: search, label: search });
    });
    
    // Add matching tags
    tags
      .filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .forEach((tag) => {
        items.push({ type: "tag", value: tag, label: `Tag: ${tag}` });
      });
    
    return items;
  }, [searchQuery, tags, recentSearches]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === "tag") {
      onSearchChange(`tag:${suggestion.value}`);
    } else {
      onSearchChange(suggestion.value);
    }
    setShowSuggestions(false);
  }, [onSearchChange]);

  const activeFilterCount = [
    filterType !== "all",
    filterYear !== "all",
  ].filter(Boolean).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents by name, tag, or type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-1 shadow-md">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.type === "recent" && (
                    <Search className="h-3 w-3 text-muted-foreground" />
                  )}
                  {suggestion.type === "tag" && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      Tag
                    </Badge>
                  )}
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Documents</h4>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Document Type</label>
                <Select value={filterType} onValueChange={onFilterTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tax Year</label>
                <Select value={filterYear} onValueChange={onFilterYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && onClearFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => {
                    onClearFilters();
                    setShowAdvancedFilters(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => onSearchChange("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterType !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filterType}
              <button onClick={() => onFilterTypeChange("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterYear !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Year: {filterYear}
              <button onClick={() => onFilterYearChange("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
