
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarEvent } from "@/types/calendar";
import { FilterState } from "@/components/calendar/AdvancedEventFilters";
import { toast } from "sonner";
import { isTomorrow, isSameDay, isToday, isThisWeek, isThisMonth, isAfter, isBefore, isWithinInterval } from "date-fns";

export function useCalendarEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    period: "all",
    category: "all",
    priority: "all",
    status: "all",
    company: "",
    dateRange: {}
  });
  const [sortBy, setSortBy] = useState("date-asc");
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
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

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent>) => {
      if (!eventData.title || !eventData.date || !eventData.company) {
        throw new Error("Missing required fields");
      }

      const insertData = {
        title: eventData.title,
        date: eventData.date,
        company: eventData.company,
        user_id: user!.id,
        category: eventData.category || 'meeting',
        priority: eventData.priority || 'medium',
        status: eventData.status || 'upcoming',
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        is_all_day: eventData.is_all_day ?? true,
        recurrence_pattern: eventData.recurrence_pattern,
        recurrence_end_date: eventData.recurrence_end_date,
        parent_event_id: eventData.parent_event_id,
        reminder_minutes: eventData.reminder_minutes || 15,
        color: eventData.color || '#3B82F6'
      };

      const { data, error } = await supabase
        .from("calendar_events")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event added successfully");
      
      if (isTomorrow(new Date(newEvent.date))) {
        toast.info(`Reminder: Event is tomorrow!`);
      }
    },
    onError: (error) => {
      console.error("Error adding event:", error);
      toast.error("Failed to add event. Please try again.");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent> & { id: number }) => {
      const { id, ...updateData } = eventData;
      
      const cleanUpdateData: any = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanUpdateData[key] = value;
        }
      });

      const { data, error } = await supabase
        .from("calendar_events")
        .update(cleanUpdateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event updated successfully");
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    },
  });

  const removeEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event removed successfully");
    },
    onError: (error) => {
      console.error("Error removing event:", error);
      toast.error("Failed to remove event. Please try again.");
    },
  });

  return {
    events: filteredAndSortedEvents,
    allEvents: events,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    addEvent: addEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    removeEvent: removeEventMutation.mutate,
    addEventPending: addEventMutation.isPending,
    updateEventPending: updateEventMutation.isPending,
    removeEventPending: removeEventMutation.isPending
  };
}
