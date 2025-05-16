
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { TaxReport } from "@/types";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { formatTaxType } from "./utils";
import { TaxReportStatus } from "./TaxReportStatus";
import { TaxReportDetails } from "./TaxReportDetails";

interface TableViewProps {
  paginatedData: TaxReport[];
  sortField: keyof TaxReport;
  sortDirection: "asc" | "desc";
  handleSort: (field: keyof TaxReport) => void;
  setSelectedReport: (report: TaxReport) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  paginatedData,
  sortField,
  sortDirection,
  handleSort,
  setSelectedReport,
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort("tax_type")}>
              <div className="flex items-center">
                Tax Type
                {sortField === "tax_type" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("tax_year")}>
              <div className="flex items-center">
                Year
                {sortField === "tax_year" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
              <div className="flex items-center">
                Amount
                {sortField === "amount" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
              <div className="flex items-center">
                Status
                {sortField === "status" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium capitalize">
                {formatTaxType(report.tax_type)}
              </TableCell>
              <TableCell>{report.tax_year}</TableCell>
              <TableCell>
                ₦{(report.amount || 0).toLocaleString()}
              </TableCell>
              <TableCell>
                <TaxReportStatus status={report.status} />
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>View</Button>
                  </DialogTrigger>
                  <TaxReportDetails />
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
