import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FilingPackData {
  user: {
    fullName: string;
    email: string;
    businessName?: string;
    tin?: string;
    state: string;
  };
  taxType: "vat" | "cit" | "pit";
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    vatOutput?: number;
    vatInput?: number;
    netVatPayable?: number;
    taxAmount: number;
  };
  transactions: Array<{
    date: string;
    type: string;
    category: string;
    amount: number;
    description?: string;
  }>;
}

export async function generateVATFilingPack(data: FilingPackData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Cover Page
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TaxEase VAT Filing Pack", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.text([
    `Taxpayer: ${data.user.fullName}`,
    `Business: ${data.user.businessName || "N/A"}`,
    `TIN: ${data.user.tin || "Not Provided"}`,
    `State: ${data.user.state}`,
    `Email: ${data.user.email}`,
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ], 20, yPos);

  // Important Notice
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Important Notice", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const notice = [
    "This filing pack is prepared by TaxEase to assist you in filing your VAT return.",
    "",
    "CRITICAL: TaxEase does NOT file taxes on your behalf. You must:",
    "1. Review all calculations and ensure accuracy",
    "2. Log in to the FIRS portal yourself",
    "3. Enter the values from this pack manually",
    "4. Make payment yourself",
    "5. Upload proof of payment to TaxEase for your records",
    "",
    "TaxEase provides calculation assistance and guidance only.",
    "You remain responsible for filing and compliance.",
  ];
  doc.text(notice, 20, yPos);

  // VAT Summary
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("VAT Calculation Summary", 20, yPos);
  
  yPos += 15;
  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Amount (₦)"]],
    body: [
      ["Total Sales (Output)", data.summary.totalIncome.toLocaleString()],
      ["Output VAT (7.5%)", data.summary.vatOutput?.toLocaleString() || "0"],
      ["Total Purchases (Input)", data.summary.totalExpenses.toLocaleString()],
      ["Input VAT (7.5%)", data.summary.vatInput?.toLocaleString() || "0"],
      ["", ""],
      ["Net VAT Payable", (data.summary.netVatPayable || 0).toLocaleString()],
    ],
    theme: "striped",
  });

  // Calculation Breakdown
  yPos = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Calculation Formula", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const formulas = [
    "VAT is calculated using the standard rate of 7.5% as per Nigerian tax law.",
    "",
    "Output VAT = Total Taxable Sales × 7.5%",
    `Output VAT = ₦${data.summary.totalIncome.toLocaleString()} × 7.5% = ₦${data.summary.vatOutput?.toLocaleString() || "0"}`,
    "",
    "Input VAT = Total Purchases × 7.5%",
    `Input VAT = ₦${data.summary.totalExpenses.toLocaleString()} × 7.5% = ₦${data.summary.vatInput?.toLocaleString() || "0"}`,
    "",
    "Net VAT Payable = Output VAT - Input VAT",
    `Net VAT = ₦${data.summary.vatOutput?.toLocaleString() || "0"} - ₦${data.summary.vatInput?.toLocaleString() || "0"} = ₦${data.summary.netVatPayable?.toLocaleString() || "0"}`,
    "",
    "Assumptions:",
    "• All sales are VAT-inclusive standard-rated supplies",
    "• Input VAT is fully recoverable (no exempt inputs)",
    "• Rate: 7.5% (current FIRS standard rate)",
  ];
  doc.text(formulas, 20, yPos);

  // Income & Expense Statement
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Income Statement", 20, yPos);
  
  const incomeTransactions = data.transactions
    .filter(t => t.type === "income")
    .slice(0, 20); // Limit for PDF space
  
  yPos += 10;
  if (incomeTransactions.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Category", "Amount (₦)"]],
      body: incomeTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.category,
        t.amount.toLocaleString(),
      ]),
      foot: [["", "Total Income", data.summary.totalIncome.toLocaleString()]],
      theme: "grid",
    });
  }

  // Expense Statement
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Statement", 20, yPos);
  
  const expenseTransactions = data.transactions
    .filter(t => t.type === "expense")
    .slice(0, 20);
  
  yPos += 10;
  if (expenseTransactions.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Category", "Amount (₦)"]],
      body: expenseTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.category,
        t.amount.toLocaleString(),
      ]),
      foot: [["", "Total Expenses", data.summary.totalExpenses.toLocaleString()]],
      theme: "grid",
    });
  }

  // Filing Guide - Step by Step
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Step-by-Step Filing Instructions", 20, yPos);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FIRS TaxPro-Max Portal Filing Guide", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const steps = [
    "Step 1: Access the FIRS Portal",
    "• Go to: https://taxpromax.firs.gov.ng/",
    "• Click 'Login' (top right)",
    "• Enter your TIN and password",
    "",
    "Step 2: Navigate to VAT Filing",
    "• From dashboard, click 'Returns'",
    "• Select 'File VAT Return'",
    "• Choose the tax period: " + data.period.start + " to " + data.period.end,
    "",
    "Step 3: Enter Values from This Pack",
    `• Total Output (Sales): ₦${data.summary.totalIncome.toLocaleString()}`,
    `• Output VAT: ₦${data.summary.vatOutput?.toLocaleString() || "0"}`,
    `• Total Input (Purchases): ₦${data.summary.totalExpenses.toLocaleString()}`,
    `• Input VAT: ₦${data.summary.vatInput?.toLocaleString() || "0"}`,
    `• Net VAT Payable: ₦${data.summary.netVatPayable?.toLocaleString() || "0"}`,
    "",
    "Step 4: Review and Submit",
    "• Review all entered values carefully",
    "• Click 'Calculate' to verify",
    "• Click 'Submit Return'",
    "• Download the acknowledgement receipt (PDF)",
    "",
    "Step 5: Make Payment",
    "• Note the Remita Retrieval Reference (RRR) from your submission",
    "• Payment options:",
    "  - Online: Use the RRR on Remita payment gateway",
    "  - Bank: Visit any commercial bank with your RRR",
    `• Amount to pay: ₦${data.summary.netVatPayable?.toLocaleString() || "0"}`,
    "",
    "Step 6: Upload Proof to TaxEase",
    "• Return to TaxEase app",
    "• Go to Filing Packs",
    "• Upload your payment receipt and FIRS acknowledgement",
    "• Mark filing as 'Completed'",
  ];
  doc.text(steps, 20, yPos);

  // Checklist
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Filing Checklist", 20, yPos);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const checklist = [
    "□ Review all income and expense transactions for accuracy",
    "□ Ensure you have your FIRS TIN and portal login credentials",
    "□ Log in to FIRS TaxPro-Max portal",
    "□ File VAT return using values from this pack",
    "□ Download FIRS acknowledgement receipt",
    "□ Make payment using Remita RRR",
    "□ Obtain payment receipt from bank/Remita",
    "□ Upload proof documents to TaxEase",
    "□ Keep copies of all documents for at least 6 years",
  ];
  doc.text(checklist, 20, yPos);

  return doc.output("blob");
}

export async function saveFilingPackToStorage(
  userId: string,
  pdfBlob: Blob,
  taxType: string,
  periodStart: string,
  periodEnd: string
): Promise<string> {
  const fileName = `filing-pack-${taxType}-${periodStart}-${periodEnd}-${Date.now()}.pdf`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("tax_documents")
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("tax_documents")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// Import supabase at the top
import { supabase } from "@/integrations/supabase/client";