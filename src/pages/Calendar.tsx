
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EventDialog } from "@/components/calendar/EventDialog";
import { useState } from "react";
import { format, isTomorrow } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Event {
  id: number;
  title: string;
  date: string;
  company: string;
  user_id: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view your calendar events.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, "id" | "user_id">) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{ ...eventData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event added successfully");
      
      // Check if the event is tomorrow to show notification
      if (isTomorrow(new Date(newEvent.date))) {
        toast.info(`Reminder: Event is tomorrow!`);
      }
    },
    onError: (error) => {
      console.error("Error adding event:", error);
      toast.error("Failed to add event. Please try again.");
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

  const handleAddEvent = (eventData: { title: string; date: string; company: string }) => {
    addEventMutation.mutate(eventData);
  };

  const handleRemoveEvent = (id: number) => {
    removeEventMutation.mutate(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <span className="mr-2">Add Event</span>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex space-x-4">
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.date), "MMMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.company}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveEvent(event.id)}
                        disabled={removeEventMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-center text-gray-500">No upcoming events</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Calendar</h2>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleAddEvent}
        />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
