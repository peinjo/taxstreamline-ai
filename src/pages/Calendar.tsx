
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Trash2, Edit, Clock, MapPin, AlertCircle, Repeat } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EnhancedEventDialog } from "@/components/calendar/EnhancedEventDialog";
import { AdvancedEventFilters, FilterState } from "@/components/calendar/AdvancedEventFilters";
import { useState, useMemo } from "react";
import { format, isTomorrow, isSameDay, isToday, isThisWeek, isThisMonth, isAfter, isBefore, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarEvent, EVENT_CATEGORIES, EVENT_PRIORITIES } from "@/types/calendar";

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
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

  // Filter events for selected date
  const selectedDateEvents = events.filter(event => 
    date && isSameDay(new Date(event.date), date)
  );

  // Get dates that have events for calendar highlighting
  const eventDates = events.map(event => new Date(event.date));

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent>) => {
      // Ensure all required fields are present
      if (!eventData.title || !eventData.date || !eventData.company) {
        throw new Error("Missing required fields");
      }

      const insertData = {
        title: eventData.title,
        date: eventData.date,
        company: eventData.company,
        user_id: user.id,
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
      
      // Clean up the update data to only include defined values
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

  const handleAddEvent = (eventData: Partial<CalendarEvent>) => {
    addEventMutation.mutate(eventData);
  };

  const handleUpdateEvent = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      updateEventMutation.mutate({
        ...eventData,
        id: editingEvent.id,
      });
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const handleRemoveEvent = (id: number) => {
    removeEventMutation.mutate(id);
  };

  const getPriorityColor = (priority: string) => {
    const priorityData = EVENT_PRIORITIES.find(p => p.value === priority);
    return priorityData?.color || '#6B7280';
  };

  const getCategoryColor = (category: string) => {
    const categoryData = EVENT_CATEGORIES.find(c => c.value === category);
    return categoryData?.color || '#6B7280';
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

        <AdvancedEventFilters
          onSearchChange={setSearchTerm}
          onFilterChange={setFilters}
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
                    className="border rounded-lg p-4 space-y-3"
                    style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge 
                            style={{ backgroundColor: getCategoryColor(event.category) }}
                            className="text-white text-xs"
                          >
                            {EVENT_CATEGORIES.find(c => c.value === event.category)?.label}
                          </Badge>
                          <Badge 
                            style={{ backgroundColor: getPriorityColor(event.priority) }}
                            className="text-white text-xs"
                          >
                            {EVENT_PRIORITIES.find(p => p.value === event.priority)?.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(event.date), "MMM dd, yyyy")}
                          </div>
                          
                          {!event.is_all_day && event.start_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.start_time} - {event.end_time}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.company}
                          </div>
                          
                          {event.recurrence_pattern && (
                            <div className="flex items-center gap-1">
                              <Repeat className="h-4 w-4" />
                              {event.recurrence_pattern}
                            </div>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-700">{event.description}</p>
                        )}
                        
                        {event.reminder_minutes > 0 && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <AlertCircle className="h-4 w-4" />
                            Reminder: {event.reminder_minutes}min before
                          </div>
                        )}
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

        <EnhancedEventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleAddEvent}
          mode="add"
        />

        <EnhancedEventDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleUpdateEvent}
          event={editingEvent}
          mode="edit"
        />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
