import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: { title: string; date: string; company: string }) => void;
}

export function EventDialog({ open, onOpenChange, onSave }: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [company, setCompany] = useState("");

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
    
    setTitle("");
    setDate(undefined);
    setCompany("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Event Title</label>
              <Input
                id="title"
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
              <label htmlFor="company">Company</label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave}>Save Event</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}