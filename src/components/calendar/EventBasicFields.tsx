
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EVENT_CATEGORIES, EVENT_PRIORITIES, EVENT_STATUSES } from "@/types/calendar";

interface EventBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  company: string;
  setCompany: (company: string) => void;
  description: string;
  setDescription: (description: string) => void;
  category: string;
  setCategory: (category: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  status: string;
  setStatus: (status: string) => void;
  reminderMinutes: number;
  setReminderMinutes: (minutes: number) => void;
}

export function EventBasicFields({
  title,
  setTitle,
  company,
  setCompany,
  description,
  setDescription,
  category,
  setCategory,
  priority,
  setPriority,
  status,
  setStatus,
  reminderMinutes,
  setReminderMinutes
}: EventBasicFieldsProps) {
  return (
    <>
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
    </>
  );
}
