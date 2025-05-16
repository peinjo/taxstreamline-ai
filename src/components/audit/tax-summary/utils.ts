
import { TaxReport } from "@/types";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (error) {
    return "Invalid date";
  }
};

export const formatTaxType = (taxType: string): string => {
  return taxType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const filterAndSortData = (
  data: TaxReport[], 
  searchTerm: string, 
  sortField: keyof TaxReport, 
  sortDirection: "asc" | "desc"
): TaxReport[] => {
  // Filter data based on search term
  const filteredData = data.filter((report) => {
    return (
      report.tax_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tax_year.toString().includes(searchTerm)
    );
  });
  
  // Sort data based on sort field and direction
  return [...filteredData].sort((a, b) => {
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
};

export const exportToPDF = (sortedData: TaxReport[]): void => {
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

export const exportToExcel = (sortedData: TaxReport[]): void => {
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
