
import { useMemo } from "react";
import { CalendarEvent } from "@/types/calendar";
import { FilterState } from "@/components/calendar/AdvancedEventFilters";
import { isSameDay, isToday, isThisWeek, isThisMonth, isAfter, isBefore, isWithinInterval } from "date-fns";

export function useCalendarEventsFilters(
  events: CalendarEvent[],
  searchTerm: string,
  filters: FilterState,
  sortBy: string
) {
  return useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply advanced filters
    if (filters.category !== "all") {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(event => event.priority === filters.priority);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters.company) {
      filtered = filtered.filter(event => 
        event.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    // Apply period filter
    if (filters.period !== "all") {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (filters.period) {
          case "today":
            return isToday(eventDate);
          case "week":
            return isThisWeek(eventDate);
          case "month":
            return isThisMonth(eventDate);
          case "upcoming":
            return isAfter(eventDate, now);
          default:
            return true;
        }
      });
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        if (filters.dateRange.from && filters.dateRange.to) {
          return isWithinInterval(eventDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          });
        } else if (filters.dateRange.from) {
          return isAfter(eventDate, filters.dateRange.from) || isSameDay(eventDate, filters.dateRange.from);
        } else if (filters.dateRange.to) {
          return isBefore(eventDate, filters.dateRange.to) || isSameDay(eventDate, filters.dateRange.to);
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "company-asc":
          return a.company.localeCompare(b.company);
        case "priority-desc":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case "category-asc":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, filters, sortBy]);
}
