
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EventTimingFieldsProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isAllDay: boolean;
  setIsAllDay: (isAllDay: boolean) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

export function EventTimingFields({
  date,
  setDate,
  isAllDay,
  setIsAllDay,
  startTime,
  setStartTime,
  endTime,
  setEndTime
}: EventTimingFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label>Date *</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="all-day"
          checked={isAllDay}
          onCheckedChange={setIsAllDay}
        />
        <Label htmlFor="all-day">All day event</Label>
      </div>

      {!isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-time">End Time</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
}
