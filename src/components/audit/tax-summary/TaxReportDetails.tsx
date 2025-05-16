
import React, { useContext } from "react";
import { 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Calendar,
  Tag,
  DollarSign,
  Clock
} from "lucide-react";
import { TaxSummaryContext } from "./TaxSummaryContext";
import { formatTaxType, formatDate } from "./utils";
import { TaxReportStatus } from "./TaxReportStatus";

export const TaxReportDetails: React.FC = () => {
  const { selectedReport } = useContext(TaxSummaryContext);
  
  if (!selectedReport) return null;
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tax Report Details</DialogTitle>
        <DialogDescription>
          Detailed information about this tax report.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Tax Type</span>
            </div>
            <div className="font-medium mt-1">{formatTaxType(selectedReport.tax_type)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Tax Year</span>
            </div>
            <div className="font-medium mt-1">{selectedReport.tax_year}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Amount</span>
            </div>
            <div className="font-medium mt-1">₦{(selectedReport.amount || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Status</span>
            </div>
            <div className="mt-1"><TaxReportStatus status={selectedReport.status} /></div>
          </div>
        </div>
        {selectedReport.created_at && (
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created At</span>
            </div>
            <div className="font-medium mt-1">{formatDate(selectedReport.created_at)}</div>
          </div>
        )}
        {selectedReport.updated_at && (
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last Updated</span>
            </div>
            <div className="font-medium mt-1">{formatDate(selectedReport.updated_at)}</div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};
