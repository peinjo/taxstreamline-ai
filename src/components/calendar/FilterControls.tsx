
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_CATEGORIES, EVENT_PRIORITIES, EVENT_STATUSES } from "@/types/calendar";
import { FilterState } from "./AdvancedEventFilters";

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: unknown) => void;
  onSortChange: (sort: string) => void;
}

export function FilterControls({ filters, onFilterChange, onSortChange }: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Period Filter */}
      <Select value={filters.period} onValueChange={(value) => onFilterChange('period', value)}>
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
      <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
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
      <Select value={filters.priority} onValueChange={(value) => onFilterChange('priority', value)}>
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
      <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
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
        onChange={(e) => onFilterChange('company', e.target.value)}
        className="w-[140px]"
      />

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
    </div>
  );
}
