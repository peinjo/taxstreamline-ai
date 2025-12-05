import React from "react";
import { Calendar, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyCalendarProps {
  onCreateEvent?: () => void;
  title?: string;
  description?: string;
}

export function EmptyCalendar({
  onCreateEvent,
  title = "No events scheduled",
  description = "Stay on top of your tax deadlines, meetings, and important dates by adding events to your calendar.",
}: EmptyCalendarProps) {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-blue-500/10 p-6">
          <Calendar className="h-12 w-12 text-blue-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          {onCreateEvent && (
            <Button onClick={onCreateEvent} size="lg" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <Bell className="h-4 w-4" />
          <span>Get reminders for upcoming deadlines</span>
        </div>
      </div>
    </Card>
  );
}
