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
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface TaxReport {
  id: number;
  tax_type: string;
  amount: number | null;
  status: string;
  tax_year: number;
}

interface Props {
  data: TaxReport[];
  isLoading: boolean;
}

export const TaxSummaryTable = ({ data, isLoading }: Props) => {
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Tax Report Summary", 14, 15);
    
    // Create table data with null checks
    const tableData = data.map((report) => [
      report.tax_type || '',
      report.tax_year?.toString() || '',
      report.amount ? `₦${report.amount.toLocaleString()}` : '₦0',
      report.status || '',
    ]);

    // Add table
    autoTable(doc, {
      head: [["Tax Type", "Year", "Amount", "Status"]],
      body: tableData,
      startY: 25,
    });

    // Save PDF
    doc.save("tax-report-summary.pdf");
  };

  const exportToExcel = () => {
    // Prepare data for Excel with null checks
    const excelData = data.map((report) => ({
      "Tax Type": report.tax_type || '',
      "Year": report.tax_year || '',
      "Amount": report.amount || 0,
      "Status": report.status || '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tax Report");

    // Save Excel file
    XLSX.writeFile(wb, "tax-report-summary.xlsx");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={exportToPDF}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export Excel
        </Button>
      </div>
      
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
              <TableCell>
                ₦{(report.amount || 0).toLocaleString()}
              </TableCell>
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
    </div>
  );
};