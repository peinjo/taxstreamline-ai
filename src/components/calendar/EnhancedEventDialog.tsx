
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CalendarEvent, EVENT_CATEGORIES } from "@/types/calendar";
import { EventBasicFields } from "./EventBasicFields";
import { EventTimingFields } from "./EventTimingFields";
import { EventRecurrenceFields } from "./EventRecurrenceFields";

interface EnhancedEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  event?: CalendarEvent | null;
  mode: 'add' | 'edit';
}

export function EnhancedEventDialog({ open, onOpenChange, onSave, event, mode }: EnhancedEventDialogProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("meeting");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("upcoming");
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurrencePattern, setRecurrencePattern] = useState("");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();
  const [reminderMinutes, setReminderMinutes] = useState(15);

  // Get color for selected category
  const selectedCategory = EVENT_CATEGORIES.find(cat => cat.value === category);
  const color = selectedCategory?.color || '#3B82F6';

  // Populate form when event changes (edit mode)
  useEffect(() => {
    if (event && mode === 'edit') {
      setTitle(event.title);
      setCompany(event.company);
      setDescription(event.description || "");
      setDate(new Date(event.date));
      setCategory(event.category);
      setPriority(event.priority);
      setStatus(event.status);
      setIsAllDay(event.is_all_day);
      setStartTime(event.start_time || "09:00");
      setEndTime(event.end_time || "10:00");
      setRecurrencePattern(event.recurrence_pattern || "");
      setRecurrenceEndDate(event.recurrence_end_date ? new Date(event.recurrence_end_date) : undefined);
      setReminderMinutes(event.reminder_minutes);
    }
  }, [event, mode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setCompany("");
      setDescription("");
      setDate(undefined);
      setCategory("meeting");
      setPriority("medium");
      setStatus("upcoming");
      setIsAllDay(true);
      setStartTime("09:00");
      setEndTime("10:00");
      setRecurrencePattern("");
      setRecurrenceEndDate(undefined);
      setReminderMinutes(15);
    }
  }, [open]);

  const handleSave = () => {
    if (!title || !date || !company) {
      toast.error("Please fill in all required fields");
      return;
    }

    const eventData: Partial<CalendarEvent> = {
      title,
      company,
      description,
      date: date.toISOString(),
      category,
      priority,
      status,
      is_all_day: isAllDay,
      start_time: !isAllDay ? startTime : undefined,
      end_time: !isAllDay ? endTime : undefined,
      recurrence_pattern: recurrencePattern || undefined,
      recurrence_end_date: recurrenceEndDate?.toISOString(),
      reminder_minutes: reminderMinutes,
      color
    };

    onSave(eventData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Event' : 'Edit Event'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="grid gap-4 py-4">
            <EventBasicFields
              title={title}
              setTitle={setTitle}
              company={company}
              setCompany={setCompany}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              priority={priority}
              setPriority={setPriority}
              status={status}
              setStatus={setStatus}
              reminderMinutes={reminderMinutes}
              setReminderMinutes={setReminderMinutes}
            />

            <EventTimingFields
              date={date}
              setDate={setDate}
              isAllDay={isAllDay}
              setIsAllDay={setIsAllDay}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
            />

            <EventRecurrenceFields
              recurrencePattern={recurrencePattern}
              setRecurrencePattern={setRecurrencePattern}
              recurrenceEndDate={recurrenceEndDate}
              setRecurrenceEndDate={setRecurrenceEndDate}
            />
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'add' ? 'Save Event' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
