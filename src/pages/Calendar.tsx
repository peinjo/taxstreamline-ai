import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { EventDialog } from "@/components/calendar/EventDialog";
import { useState } from "react";
import { format, isTomorrow } from "date-fns";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: Date;
  company: string;
}

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddEvent = (eventData: Omit<Event, "id">) => {
    const newEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents((prev) => [...prev, newEvent]);

    // Set notification for the day before
    const notificationDate = new Date(eventData.date);
    notificationDate.setDate(notificationDate.getDate() - 1);
    
    // Check if the event is tomorrow to show an immediate notification
    if (isTomorrow(eventData.date)) {
      toast.info(`Reminder: "${eventData.title}" is tomorrow!`);
    }
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    toast.success("Event removed successfully");
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
                            {format(event.date, "MMMM dd, yyyy")}
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