
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarEvent } from "@/types/calendar";
import { toast } from "sonner";
import { isTomorrow } from "date-fns";
import { logger } from "@/lib/logging/logger";

export function useCalendarEventsMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      logger.error("Error adding event", error as Error, { component: "useCalendarEventsMutations", action: "addEvent" });
      toast.error("Failed to add event. Please try again.");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent> & { id: number }) => {
      const { id, ...updateData } = eventData;
      
      const cleanUpdateData: Record<string, unknown> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
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
      logger.error("Error updating event", error as Error, { component: "useCalendarEventsMutations", action: "updateEvent" });
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
      logger.error("Error removing event", error as Error, { component: "useCalendarEventsMutations", action: "removeEvent" });
      toast.error("Failed to remove event. Please try again.");
    },
  });

  return {
    addEvent: addEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    removeEvent: removeEventMutation.mutate,
    addEventPending: addEventMutation.isPending,
    updateEventPending: updateEventMutation.isPending,
    removeEventPending: removeEventMutation.isPending
  };
}
