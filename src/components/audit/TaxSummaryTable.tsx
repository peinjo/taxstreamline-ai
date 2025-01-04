import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TaxReport {
  id: number;
  tax_type: string;
  amount: number;
  status: string;
  tax_year: number;
}

interface Props {
  data: TaxReport[];
  isLoading: boolean;
}

export const TaxSummaryTable = ({ data, isLoading }: Props) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tax Type</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.tax_type}</TableCell>
            <TableCell>{report.tax_year}</TableCell>
            <TableCell>₦{report.amount.toLocaleString()}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  report.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {report.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};