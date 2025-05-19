
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaxReportStatus } from "./TaxReportStatus";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { TaxReport } from "@/types/tax";

interface TableViewProps {
  reports: TaxReport[];
  onViewDetails: (report: TaxReport) => void;
}

export const TableView: React.FC<TableViewProps> = ({ reports, onViewDetails }) => {
  if (!reports.length) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tax Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="hidden md:table-cell">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Updated</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.tax_type}</TableCell>
              <TableCell>{report.tax_year}</TableCell>
              <TableCell className="hidden md:table-cell">₦{report.amount.toLocaleString()}</TableCell>
              <TableCell>
                <TaxReportStatus status={report.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {format(new Date(report.updated_at), "dd MMM yyyy")}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(report)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
