
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleReportDialog: React.FC<ScheduleReportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [taxType, setTaxType] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 7));

  const handleSchedule = () => {
    if (!taxType) {
      toast.error("Please select a tax type");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    toast.success(`${taxType} report scheduled for ${format(date, "PPP")}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Tax Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="tax-type" className="text-sm font-medium">
              Tax Type
            </label>
            <Select value={taxType} onValueChange={setTaxType}>
              <SelectTrigger id="tax-type">
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VAT">VAT</SelectItem>
                <SelectItem value="Income Tax">Income Tax</SelectItem>
                <SelectItem value="Corporate Tax">Corporate Tax</SelectItem>
                <SelectItem value="Withholding Tax">Withholding Tax</SelectItem>
                <SelectItem value="PAYE">PAYE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSchedule}>
            Schedule Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
