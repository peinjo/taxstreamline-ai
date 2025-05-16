
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TaxReport } from "@/types";
import { formatTaxType, formatDate } from "./utils";
import { TaxReportStatus } from "./TaxReportStatus";
import { TaxReportDetails } from "./TaxReportDetails";

interface CardViewProps {
  paginatedData: TaxReport[];
  setSelectedReport: (report: TaxReport) => void;
}

export const CardView: React.FC<CardViewProps> = ({
  paginatedData,
  setSelectedReport,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginatedData.map((report) => (
        <Card key={`card-${report.id}`} className="overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b bg-muted/50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-md">{formatTaxType(report.tax_type)}</h3>
              <TaxReportStatus status={report.status} />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year:</span>
                <span className="font-medium">{report.tax_year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₦{(report.amount || 0).toLocaleString()}</span>
              </div>
              {report.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(report.created_at)}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-2 flex justify-end border-t bg-muted/20">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>View Details</Button>
              </DialogTrigger>
              <TaxReportDetails />
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
