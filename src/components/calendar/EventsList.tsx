
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Trash2, Edit, Clock, MapPin, AlertCircle, Repeat } from "lucide-react";
import { format } from "date-fns";
import { CalendarEvent, EVENT_CATEGORIES, EVENT_PRIORITIES } from "@/types/calendar";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date | undefined;
  searchTerm: string;
  onEditEvent: (event: CalendarEvent) => void;
  onRemoveEvent: (id: number) => void;
  updatePending: boolean;
  removePending: boolean;
}

export function EventsList({ 
  events, 
  date, 
  searchTerm, 
  onEditEvent, 
  onRemoveEvent, 
  updatePending, 
  removePending 
}: EventsListProps) {
  const getPriorityColor = (priority: string) => {
    const priorityData = EVENT_PRIORITIES.find(p => p.value === priority);
    return priorityData?.color || '#6B7280';
  };

  const getCategoryColor = (category: string) => {
    const categoryData = EVENT_CATEGORIES.find(c => c.value === category);
    return categoryData?.color || '#6B7280';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-semibold">
          {date ? `Events for ${format(date, "MMMM dd, yyyy")}` : "Events"}
          {searchTerm && ` (Search: "${searchTerm}")`}
        </h2>
        <div className="space-y-4">
          {events.map((event) => (
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
                    onClick={() => onEditEvent(event)}
                    disabled={updatePending}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveEvent(event.id)}
                    disabled={removePending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center text-gray-500">
              {date ? "No events for this date" : "No events found"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
