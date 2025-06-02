
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
  id: number;
  title: string;
  date: string;
  company: string;
  user_id: string;
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: { title: string; date: string; company: string }) => void;
  event: Event | null;
}

export function EditEventDialog({ open, onOpenChange, onSave, event }: EditEventDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [company, setCompany] = useState("");

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(new Date(event.date));
      setCompany(event.company);
    }
  }, [event]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDate(undefined);
      setCompany("");
    }
  }, [open]);

  const handleSave = () => {
    if (!title || !date || !company) {
      toast.error("Please fill in all fields");
      return;
    }

    onSave({
      title,
      date: date.toISOString(),
      company,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title">Event Title</label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <label>Date</label>
              <div className="flex flex-col">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-company">Company</label>
              <Input
                id="edit-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
