
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScheduleConfigState } from "./types";
import { toast } from "sonner";

interface ScheduleReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleConfig: ScheduleConfigState;
  setScheduleConfig: (config: ScheduleConfigState) => void;
}

export const ScheduleReportDialog: React.FC<ScheduleReportDialogProps> = ({
  isOpen,
  onOpenChange,
  scheduleConfig,
  setScheduleConfig,
}) => {
  const handleScheduleReport = () => {
    // This would typically connect to a backend service
    toast.success(`Report scheduled for ${scheduleConfig.frequency} delivery`, {
      description: `Will be sent in ${scheduleConfig.format.toUpperCase()} format to ${scheduleConfig.recipients || "configured recipients"}.`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogDescription>
            Configure automatic delivery of this report.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium">Frequency</label>
            <Select 
              value={scheduleConfig.frequency}
              onValueChange={(value) => setScheduleConfig({...scheduleConfig, frequency: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="recipients" className="text-sm font-medium">Recipients (comma separated)</label>
            <Input 
              id="recipients"
              placeholder="email@example.com, another@example.com"
              value={scheduleConfig.recipients} 
              onChange={(e) => setScheduleConfig({...scheduleConfig, recipients: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="format" className="text-sm font-medium">Format</label>
            <Select 
              value={scheduleConfig.format}
              onValueChange={(value) => setScheduleConfig({...scheduleConfig, format: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="both">Both PDF & Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full" onClick={handleScheduleReport}>Schedule Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
