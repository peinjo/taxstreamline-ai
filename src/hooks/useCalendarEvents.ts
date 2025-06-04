
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarEvent } from "@/types/calendar";
import { FilterState } from "@/components/calendar/AdvancedEventFilters";
import { useCalendarEventsMutations } from "./useCalendarEventsMutations";
import { useCalendarEventsFilters } from "./useCalendarEventsFilters";

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
  const filteredAndSortedEvents = useCalendarEventsFilters(events, searchTerm, filters, sortBy);

  // Get mutations
  const mutations = useCalendarEventsMutations();

  return {
    events: filteredAndSortedEvents,
    allEvents: events,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    ...mutations
  };
}
