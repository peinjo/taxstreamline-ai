import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { logError } from "@/lib/errorHandler";
import { format } from "date-fns";

// Types for export data
export interface ExportData {
  id?: string | number;
  tax_type?: string;
  tax_year?: number;
  amount?: number;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export interface ExportOptions {
  title: string;
  filename: string;
  includeMetadata?: boolean;
  customHeaders?: string[];
  summaryData?: Record<string, any>;
}

// PDF Export Service
export class PDFExportService {
  static async export(
    data: ExportData[], 
    options: ExportOptions,
    isLoading?: (loading: boolean) => void
  ): Promise<void> {
    try {
      isLoading?.(true);
      toast.info(`Generating ${options.title} PDF...`);

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175);
      doc.text(options.title, 14, 20);
      
      // Metadata
      if (options.includeMetadata !== false) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${format(new Date(), "PPP 'at' p")}`, 14, 30);
        doc.text(`Total Records: ${data.length}`, 14, 35);
      }

      let startY = 45;

      // Summary section
      if (options.summaryData) {
        const summaryEntries = Object.entries(options.summaryData);
        autoTable(doc, {
          startY,
          head: [['Summary', 'Value']],
          body: summaryEntries.map(([key, value]) => [
            key,
            typeof value === 'number' && key.toLowerCase().includes('amount') 
              ? `₦${value.toLocaleString()}` 
              : value?.toString() || 'N/A'
          ]),
          styles: { fontSize: 10, cellPadding: 5 },
          headStyles: { fillColor: [30, 64, 175], textColor: 255 },
          margin: { left: 14 },
          tableWidth: 'auto'
        });
        startY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Main data table
      if (data.length > 0) {
        const headers = options.customHeaders || this.getDefaultHeaders(data[0]);
        const tableData = data.map(item => 
          headers.map(header => this.formatCellValue(item, header))
        );

        autoTable(doc, {
          head: [headers],
          body: tableData,
          startY,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [30, 64, 175], textColor: 255 },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          margin: { left: 14, right: 14 }
        });
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 14,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }

      doc.save(`${options.filename}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      logError(error as Error, "PDFExportService.export");
      toast.error("Failed to export PDF");
    } finally {
      isLoading?.(false);
    }
  }

  private static getDefaultHeaders(item: ExportData): string[] {
    const commonHeaders = ['Tax Type', 'Year', 'Amount', 'Status', 'Date Created'];
    const availableKeys = Object.keys(item);
    
    return commonHeaders.filter(header => {
      const key = header.toLowerCase().replace(/\s+/g, '_');
      return availableKeys.some(k => k.includes(key) || key.includes(k));
    });
  }

  private static formatCellValue(item: ExportData, header: string): string {
    const key = this.getKeyForHeader(item, header);
    const value = item[key];

    if (!value && value !== 0) return 'N/A';

    switch (header.toLowerCase()) {
      case 'amount':
        return `₦${Number(value).toLocaleString()}`;
      case 'date created':
      case 'created_at':
        return format(new Date(value), "MMM d, yyyy");
      case 'tax type':
        return this.formatTaxType(value.toString());
      default:
        return value.toString();
    }
  }

  private static getKeyForHeader(item: ExportData, header: string): string {
    const headerKey = header.toLowerCase().replace(/\s+/g, '_');
    return Object.keys(item).find(key => 
      key.toLowerCase() === headerKey || 
      key.toLowerCase().includes(headerKey) ||
      headerKey.includes(key.toLowerCase())
    ) || headerKey;
  }

  private static formatTaxType(taxType: string): string {
    return taxType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

// Excel Export Service
export class ExcelExportService {
  static async export(
    data: ExportData[], 
    options: ExportOptions,
    isLoading?: (loading: boolean) => void
  ): Promise<void> {
    try {
      isLoading?.(true);
      toast.info(`Generating ${options.title} Excel...`);

      const wb = XLSX.utils.book_new();

      // Main data sheet
      const excelData = data.map(item => this.formatItemForExcel(item));
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns
      const colWidths = this.calculateColumnWidths(excelData);
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      // Summary sheet
      if (options.summaryData) {
        const summaryData = Object.entries(options.summaryData).map(([key, value]) => ({
          "Metric": key,
          "Value": value
        }));
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
      }

      // Metadata sheet
      if (options.includeMetadata !== false) {
        const metadataSheet = XLSX.utils.json_to_sheet([
          { "Property": "Generated", "Value": format(new Date(), "PPP 'at' p") },
          { "Property": "Total Records", "Value": data.length },
          { "Property": "Export Type", "Value": options.title }
        ]);
        metadataSheet['!cols'] = [{ wch: 15 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, metadataSheet, "Metadata");
      }

      XLSX.writeFile(wb, `${options.filename}.xlsx`);
      toast.success("Excel exported successfully");
    } catch (error) {
      logError(error as Error, "ExcelExportService.export");
      toast.error("Failed to export Excel");
    } finally {
      isLoading?.(false);
    }
  }

  private static formatItemForExcel(item: ExportData): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    Object.entries(item).forEach(([key, value]) => {
      const displayKey = this.formatKeyForDisplay(key);
      
      if (key.toLowerCase().includes('amount') && typeof value === 'number') {
        formatted[displayKey] = value;
      } else if (key.toLowerCase().includes('date') && value) {
        formatted[displayKey] = format(new Date(value), "MMM d, yyyy");
      } else if (key === 'tax_type' && value) {
        formatted[displayKey] = this.formatTaxType(value.toString());
      } else {
        formatted[displayKey] = value || 'N/A';
      }
    });
    
    return formatted;
  }

  private static formatKeyForDisplay(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private static formatTaxType(taxType: string): string {
    return taxType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private static calculateColumnWidths(data: any[]): any[] {
    if (!data.length) return [];
    
    const keys = Object.keys(data[0]);
    return keys.map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength, 10), 50) };
    });
  }
}

// Utility function for quick exports
export const exportData = async (
  data: ExportData[],
  format: 'pdf' | 'excel',
  options: Partial<ExportOptions> = {},
  isLoading?: (loading: boolean) => void
) => {
  const defaultOptions: ExportOptions = {
    title: "Data Export",
    filename: `export-${format}-${Date.now()}`,
    includeMetadata: true,
    ...options
  };

  if (format === 'pdf') {
    await PDFExportService.export(data, defaultOptions, isLoading);
  } else {
    await ExcelExportService.export(data, defaultOptions, isLoading);
  }
};