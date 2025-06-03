
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface CalendarHeaderProps {
  onAddEvent: () => void;
}

export function CalendarHeader({ onAddEvent }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Calendar</h1>
      <Button onClick={onAddEvent}>
        <span className="mr-2">Add Event</span>
        <CalendarIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
