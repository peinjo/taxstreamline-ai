
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RECURRENCE_PATTERNS } from "@/types/calendar";

interface EventRecurrenceFieldsProps {
  recurrencePattern: string;
  setRecurrencePattern: (pattern: string) => void;
  recurrenceEndDate: Date | undefined;
  setRecurrenceEndDate: (date: Date | undefined) => void;
}

export function EventRecurrenceFields({
  recurrencePattern,
  setRecurrencePattern,
  recurrenceEndDate,
  setRecurrenceEndDate
}: EventRecurrenceFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label>Repeat</Label>
        <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECURRENCE_PATTERNS.map((pattern) => (
              <SelectItem key={pattern.value} value={pattern.value}>
                {pattern.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {recurrencePattern && (
        <div className="grid gap-2">
          <Label>Repeat Until</Label>
          <Calendar
            mode="single"
            selected={recurrenceEndDate}
            onSelect={setRecurrenceEndDate}
            className="rounded-md border"
          />
        </div>
      )}
    </>
  );
}
