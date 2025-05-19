
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaxReport } from "@/types/tax";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TaxReportDetailsProps {
  report: TaxReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaxReportDetails: React.FC<TaxReportDetailsProps> = ({
  report,
  open,
  onOpenChange,
}) => {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Tax Report Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{report.tax_type}</h3>
            <Badge
              variant="outline"
              className={`${
                report.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : report.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Year:</span>
              <span className="font-medium">{report.tax_year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">₦{report.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date Created:</span>
              <span className="font-medium">{format(new Date(report.created_at), "PPP")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <span className="font-medium">{format(new Date(report.updated_at), "PPP")}</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Status Information</h4>
            <p className="text-sm text-muted-foreground">
              {report.status === "approved"
                ? "This tax report has been approved and filed with the tax authority."
                : report.status === "pending"
                ? "This tax report is awaiting review and approval."
                : "This tax report has been rejected. Please contact support for more information."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
