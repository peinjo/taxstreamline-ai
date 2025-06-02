
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Trash2, Edit } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EventDialog } from "@/components/calendar/EventDialog";
import { EditEventDialog } from "@/components/calendar/EditEventDialog";
import { EventFilters } from "@/components/calendar/EventFilters";
import { useState, useMemo } from "react";
import { format, isTomorrow, isSameDay, isToday, isThisWeek, isThisMonth, isAfter } from "date-fns";
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
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
    enabled: !!user,
  });

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply period filter
    if (filterPeriod !== "all") {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (filterPeriod) {
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, filterPeriod, sortBy]);

  // Filter events for selected date
  const selectedDateEvents = events.filter(event => 
    date && isSameDay(new Date(event.date), date)
  );

  // Get dates that have events for calendar highlighting
  const eventDates = events.map(event => new Date(event.date));

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
    mutationFn: async ({ id, ...eventData }: Event) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(eventData)
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

  const handleAddEvent = (eventData: { title: string; date: string; company: string }) => {
    addEventMutation.mutate(eventData);
  };

  const handleUpdateEvent = (eventData: { title: string; date: string; company: string }) => {
    if (editingEvent) {
      updateEventMutation.mutate({
        ...editingEvent,
        ...eventData,
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
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

        <EventFilters
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterPeriod}
          onSortChange={setSortBy}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">
                {date ? `Events for ${format(date, "MMMM dd, yyyy")}` : "Events"}
                {searchTerm && ` (Search: "${searchTerm}")`}
              </h2>
              <div className="space-y-4">
                {(date ? selectedDateEvents : filteredAndSortedEvents).map((event) => (
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                        disabled={updateEventMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                {(date ? selectedDateEvents : filteredAndSortedEvents).length === 0 && (
                  <p className="text-center text-gray-500">
                    {date ? "No events for this date" : "No events found"}
                  </p>
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
                modifiers={{
                  hasEvents: eventDates,
                }}
                modifiersStyles={{
                  hasEvents: {
                    fontWeight: 'bold',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                  },
                }}
              />
              {date && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    {selectedDateEvents.length} event(s) on this date
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-blue-600"
                    onClick={() => setDate(undefined)}
                  >
                    View all events
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleAddEvent}
        />

        <EditEventDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleUpdateEvent}
          event={editingEvent}
        />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
