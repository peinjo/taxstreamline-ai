import DashboardLayout from "@/components/DashboardLayout";
import { EnhancedEventDialog } from "@/components/calendar/EnhancedEventDialog";
import { AdvancedEventFilters } from "@/components/calendar/AdvancedEventFilters";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { EventsList } from "@/components/calendar/EventsList";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EmptyCalendar } from "@/components/empty-states";
import { useState } from "react";
import { isSameDay } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarEvent } from "@/types/calendar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { user } = useAuth();

  const {
    events,
    allEvents,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    addEvent,
    updateEvent,
    removeEvent,
    updateEventPending,
    removeEventPending
  } = useCalendarEvents();

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

  // Filter events for selected date
  const selectedDateEvents = allEvents.filter(event => 
    date && isSameDay(new Date(event.date), date)
  );

  const handleAddEvent = (eventData: Partial<CalendarEvent>) => {
    addEvent(eventData);
  };

  const handleUpdateEvent = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      updateEvent({
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
    removeEvent(id);
  };

  // Show empty state if no events at all
  const hasNoEvents = allEvents.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CalendarHeader onAddEvent={() => setDialogOpen(true)} />

        {hasNoEvents ? (
          <EmptyCalendar 
            onCreateEvent={() => setDialogOpen(true)}
            title="No events scheduled"
            description="Stay on top of your tax deadlines, meetings, and important dates by adding events to your calendar."
          />
        ) : (
          <>
            <AdvancedEventFilters
              onSearchChange={setSearchTerm}
              onFilterChange={setFilters}
              onSortChange={setSortBy}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <EventsList
                events={date ? selectedDateEvents : events}
                date={date}
                searchTerm={searchTerm}
                onEditEvent={handleEditEvent}
                onRemoveEvent={handleRemoveEvent}
                updatePending={updateEventPending}
                removePending={removeEventPending}
              />

              <CalendarView
                date={date}
                onDateSelect={setDate}
                events={allEvents}
              />
            </div>
          </>
        )}

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
