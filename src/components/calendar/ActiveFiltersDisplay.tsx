
import { Badge } from "@/components/ui/badge";
import { EVENT_CATEGORIES, EVENT_PRIORITIES, EVENT_STATUSES } from "@/types/calendar";
import { FilterState } from "./AdvancedEventFilters";

interface ActiveFiltersDisplayProps {
  filters: FilterState;
  activeFiltersCount: number;
}

export function ActiveFiltersDisplay({ filters, activeFiltersCount }: ActiveFiltersDisplayProps) {
  if (activeFiltersCount === 0) return null;

  return (
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
  );
}
