import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNaira, MONTHS } from "./PayrollCalculations";

interface PayslipData {
  employeeName: string;
  department: string;
  jobTitle: string;
  month: number;
  year: number;
  basic: number;
  housing: number;
  transport: number;
  otherAllowances: number;
  gross: number;
  paye: number;
  pensionEmployee: number;
  pensionEmployer: number;
  nhf: number;
  net: number;
}

export function generatePayslipPDF(data: PayslipData) {
  const doc = new jsPDF();
  const period = `${MONTHS[data.month - 1]} ${data.year}`;

  // Header
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("PAYSLIP", 14, 22);
  doc.setFontSize(11);
  doc.text(period, 14, 32);

  // Employee info
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text(`Employee: ${data.employeeName}`, 14, 52);
  doc.text(`Department: ${data.department}`, 14, 59);
  doc.text(`Position: ${data.jobTitle}`, 14, 66);

  // Earnings table
  autoTable(doc, {
    startY: 76,
    head: [["Earnings", "Amount (₦)"]],
    body: [
      ["Basic Salary", formatNaira(data.basic)],
      ["Housing Allowance", formatNaira(data.housing)],
      ["Transport Allowance", formatNaira(data.transport)],
      ["Other Allowances", formatNaira(data.otherAllowances)],
      ["Gross Pay", formatNaira(data.gross)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 14, right: 105 },
    tableWidth: 85,
  });

  // Deductions table
  autoTable(doc, {
    startY: 76,
    head: [["Deductions", "Amount (₦)"]],
    body: [
      ["PAYE Tax", formatNaira(data.paye)],
      ["Pension (Employee)", formatNaira(data.pensionEmployee)],
      ["NHF", formatNaira(data.nhf)],
      ["", ""],
      ["Total Deductions", formatNaira(data.paye + data.pensionEmployee + data.nhf)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 110, right: 14 },
    tableWidth: 85,
  });

  // Net pay
  const finalY = Math.max(
    (doc as any).lastAutoTable?.finalY || 180,
    160
  );

  doc.setFillColor(240, 249, 255);
  doc.roundedRect(14, finalY + 10, 182, 28, 3, 3, "F");
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text("NET PAY", 20, finalY + 27);
  doc.setFontSize(18);
  doc.text(formatNaira(data.net), 190, finalY + 27, { align: "right" });

  // Employer cost note
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Employer Pension Contribution (10%): ${formatNaira(data.pensionEmployer)}`, 14, finalY + 48);
  doc.text("This is a computer-generated payslip and does not require a signature.", 14, finalY + 55);

  doc.save(`payslip-${data.employeeName.replace(/\s+/g, "-").toLowerCase()}-${period.replace(/\s+/g, "-")}.pdf`);
}
