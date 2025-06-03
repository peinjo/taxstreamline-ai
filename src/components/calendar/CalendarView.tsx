
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarEvent } from "@/types/calendar";
import { isSameDay } from "date-fns";

interface CalendarViewProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  events: CalendarEvent[];
}

export function CalendarView({ date, onDateSelect, events }: CalendarViewProps) {
  const eventDates = events.map(event => new Date(event.date));
  const selectedDateEvents = events.filter(event => 
    date && isSameDay(new Date(event.date), date)
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Calendar</h2>
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={onDateSelect}
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
              onClick={() => onDateSelect(undefined)}
            >
              View all events
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
