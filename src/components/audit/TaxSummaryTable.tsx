
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Search, Filter, ArrowUp, ArrowDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof TaxReport>("tax_year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Filter data based on search term
  const filteredData = data.filter((report) => {
    return (
      report.tax_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tax_year.toString().includes(searchTerm)
    );
  });
  
  // Sort data based on sort field and direction
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "amount") {
      const aVal = Number(a[sortField] || 0);
      const bVal = Number(b[sortField] || 0);
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    } else {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    }
  });
  
  const handleSort = (field: keyof TaxReport) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("Tax Report Summary", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      
      // Create table data with null checks
      const tableData = sortedData.map((report) => [
        report.tax_type || '',
        report.tax_year?.toString() || '',
        report.amount ? `₦${report.amount.toLocaleString()}` : '₦0',
        report.status || '',
      ]);

      // Add table
      autoTable(doc, {
        head: [["Tax Type", "Year", "Amount", "Status"]],
        body: tableData,
        startY: 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [30, 64, 175] }
      });

      // Add summary section
      const totalAmount = sortedData.reduce(
        (sum, item) => sum + Number(item.amount || 0), 0
      );
      
      const finalY = (doc as any).lastAutoTable.finalY || 30;
      doc.text(`Total Tax Amount: ₦${totalAmount.toLocaleString()}`, 14, finalY + 10);
      doc.text(`Number of Records: ${sortedData.length}`, 14, finalY + 18);

      // Save PDF
      doc.save("tax-report-summary.pdf");
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel with null checks
      const excelData = sortedData.map((report) => ({
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
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <div className="border rounded-md">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by type, status, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              className="flex items-center gap-2"
              disabled={sortedData.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center gap-2"
              disabled={sortedData.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>
        
        {sortedData.length > 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium capitalize">
                      {report.tax_type}
                    </TableCell>
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
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No tax reports found for the current filters.</p>
            {searchTerm && (
              <Button 
                variant="ghost" 
                className="mt-2" 
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
        
        {sortedData.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {sortedData.length} of {data.length} records
          </div>
        )}
      </CardContent>
    </Card>
  );
};
