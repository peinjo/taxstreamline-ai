
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarEvent, EVENT_CATEGORIES, EVENT_PRIORITIES, EVENT_STATUSES, RECURRENCE_PATTERNS } from "@/types/calendar";

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
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_PRIORITIES.map((pri) => (
                      <SelectItem key={pri.value} value={pri.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: pri.color }}
                          />
                          {pri.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUSES.map((stat) => (
                    <SelectItem key={stat.value} value={stat.value}>
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="grid gap-2">
              <Label htmlFor="reminder">Reminder (minutes before)</Label>
              <Select value={reminderMinutes.toString()} onValueChange={(value) => setReminderMinutes(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
