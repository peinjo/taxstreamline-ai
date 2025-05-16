
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
import { 
  FileDown, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  DollarSign,
  Tag,
  Clock
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaxReport } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Props {
  data: TaxReport[];
  isLoading: boolean;
}

export const TaxSummaryTable = ({ data, isLoading }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof TaxReport>("tax_year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);
  const [reportScheduleVisible, setReportScheduleVisible] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: "weekly",
    recipients: "",
    format: "pdf"
  });
  
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
  
  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
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
      
      // Add title and header
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text("Tax Report Summary", 14, 15);
      
      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      doc.text(`Total Reports: ${sortedData.length}`, 14, 27);
      
      // Summary statistics
      const totalAmount = sortedData.reduce(
        (sum, item) => sum + Number(item.amount || 0), 0
      );
      const paidReports = sortedData.filter(item => item.status === 'paid');
      const paidAmount = paidReports.reduce(
        (sum, item) => sum + Number(item.amount || 0), 0
      );
      
      // Add summary table
      autoTable(doc, {
        startY: 35,
        head: [['Summary', 'Value']],
        body: [
          ['Total Tax Amount', `₦${totalAmount.toLocaleString()}`],
          ['Paid Amount', `₦${paidAmount.toLocaleString()}`],
          ['Pending Amount', `₦${(totalAmount - paidAmount).toLocaleString()}`],
          ['Number of Reports', sortedData.length.toString()],
          ['Period', `${Math.min(...sortedData.map(r => r.tax_year))} - ${Math.max(...sortedData.map(r => r.tax_year))}`]
        ],
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [30, 64, 175] }
      });
      
      // Create table data with null checks
      const tableData = sortedData.map((report) => [
        report.tax_type || '',
        report.tax_year?.toString() || '',
        report.amount ? `₦${report.amount.toLocaleString()}` : '₦0',
        report.status || '',
        report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'
      ]);

      // Add main data table
      autoTable(doc, {
        head: [["Tax Type", "Year", "Amount", "Status", "Date Created"]],
        body: tableData,
        startY: (doc as any).lastAutoTable.finalY + 15,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [30, 64, 175] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });

      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount} - Tax Report Summary - Generated on ${new Date().toLocaleDateString()}`,
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }

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
        "Date Created": report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A',
      }));

      // Add summary data
      const totalAmount = sortedData.reduce(
        (sum, item) => sum + Number(item.amount || 0), 0
      );
      const paidAmount = sortedData.filter(item => item.status === 'paid')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
      
      const summaryData = [
        { "Summary": "Total Tax Amount", "Value": totalAmount },
        { "Summary": "Paid Amount", "Value": paidAmount },
        { "Summary": "Pending Amount", "Value": totalAmount - paidAmount },
        { "Summary": "Number of Reports", "Value": sortedData.length },
      ];

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Add main data sheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Tax Reports");
      
      // Add summary sheet
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Save Excel file
      XLSX.writeFile(wb, "tax-report-summary.xlsx");
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel");
    }
  };

  const handleScheduleReport = () => {
    // This would typically connect to a backend service
    toast.success(`Report scheduled for ${scheduleConfig.frequency} delivery`, {
      description: `Will be sent in ${scheduleConfig.format.toUpperCase()} format to ${scheduleConfig.recipients || "configured recipients"}.`
    });
    setReportScheduleVisible(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTaxType = (taxType: string) => {
    return taxType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
        <div className="flex justify-between items-center">
          <CardTitle>Tax Reports</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            >
              {viewMode === "table" ? "Card View" : "Table View"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by type, status, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={sortedData.length === 0}
                >
                  <FileDown className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPDF}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setReportScheduleVisible(true)}>
                  Schedule Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {sortedData.length > 0 ? (
          viewMode === "table" ? (
            <>
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
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>View</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Tax Report Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about this tax report.
                                </DialogDescription>
                              </DialogHeader>
                              {selectedReport && (
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
                                      <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
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
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(paginatedData.length, pageSize)} of {sortedData.length} records
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </Button>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px] h-8">
                      <SelectValue placeholder="10 per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Rows per page</SelectLabel>
                        <SelectItem value="10">10 rows</SelectItem>
                        <SelectItem value="20">20 rows</SelectItem>
                        <SelectItem value="50">50 rows</SelectItem>
                        <SelectItem value="100">100 rows</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((report) => (
                <Card key={`card-${report.id}`} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 border-b bg-muted/50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-md">{formatTaxType(report.tax_type)}</h3>
                      {getStatusBadge(report.status)}
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
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tax Report Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this tax report.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedReport && (
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
                                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
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
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
              
              <div className="col-span-full flex items-center justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )
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
      </CardContent>

      <Dialog open={reportScheduleVisible} onOpenChange={setReportScheduleVisible}>
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
    </Card>
  );
};
