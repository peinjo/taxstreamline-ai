
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { EVENT_CATEGORIES, EVENT_PRIORITIES, EVENT_STATUSES } from "@/types/calendar";

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

  // Convert our dateRange to proper DateRange format for the calendar
  const calendarDateRange: DateRange | undefined = filters.dateRange.from || filters.dateRange.to 
    ? {
        from: filters.dateRange.from,
        to: filters.dateRange.to
      }
    : undefined;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search events by title, company, or description..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Period Filter */}
        <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EVENT_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {EVENT_PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: priority.color }}
                  />
                  {priority.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {EVENT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company Filter */}
        <Input
          placeholder="Company..."
          value={filters.company}
          onChange={(e) => handleFilterChange('company', e.target.value)}
          className="w-[140px]"
        />

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd")} -{" "}
                    {format(filters.dateRange.to, "LLL dd")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={calendarDateRange}
              onSelect={(dateRange: DateRange | undefined) => {
                handleFilterChange('dateRange', {
                  from: dateRange?.from,
                  to: dateRange?.to
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Sort Control */}
        <Select onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-asc">Date (Earliest)</SelectItem>
            <SelectItem value="date-desc">Date (Latest)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="company-asc">Company (A-Z)</SelectItem>
            <SelectItem value="priority-desc">Priority (High to Low)</SelectItem>
            <SelectItem value="category-asc">Category (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.category !== 'all' && (
            <Badge variant="secondary">
              Category: {EVENT_CATEGORIES.find(c => c.value === filters.category)?.label}
            </Badge>
          )}
          {filters.priority !== 'all' && (
            <Badge variant="secondary">
              Priority: {EVENT_PRIORITIES.find(p => p.value === filters.priority)?.label}
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary">
              Status: {EVENT_STATUSES.find(s => s.value === filters.status)?.label}
            </Badge>
          )}
          {filters.company && (
            <Badge variant="secondary">
              Company: {filters.company}
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary">
              Date Range
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
