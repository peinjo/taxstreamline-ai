
import React from "react";
import { SummaryMetrics } from "@/components/audit/SummaryMetrics";
import { AnalyticsCharts } from "@/components/audit/AnalyticsCharts";
import { MaterialityCalculator } from "@/components/audit";
import { AccountsReceivableAnalysis } from "@/components/audit/AccountsReceivableAnalysis";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

export const AnalyticsTab = () => {
  const handleGenerateAuditSummary = () => {
    toast.success("Generating comprehensive audit summary...", {
      duration: 3000,
    });
    // In a real implementation, this would generate a PDF or downloadable report
    setTimeout(() => {
      toast.success("Audit summary generated successfully");
    }, 3000);
  };

  return (
    <>
      <SummaryMetrics metrics={{
        totalLiability: 8500000,
        filingCount: 24,
        pendingPayments: 3,
        complianceRate: 92,
      }} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <MaterialityCalculator />
        <AccountsReceivableAnalysis />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsCharts
          taxData={[
            { name: "Jan", value: 4000 },
            { name: "Feb", value: 3000 },
            { name: "Mar", value: 2000 },
            { name: "Apr", value: 2780 },
            { name: "May", value: 1890 },
            { name: "Jun", value: 2390 },
          ]}
          title="Monthly Tax Payments"
          description="Overview of tax payments over time"
        />
        <AnalyticsCharts
          taxData={[
            { name: "Corporate", value: 4000 },
            { name: "VAT", value: 3000 },
            { name: "PAYE", value: 2000 },
            { name: "Capital Gains", value: 1500 },
            { name: "Withholding", value: 1200 },
          ]}
          title="Filing Distribution"
          description="Distribution of tax filings by type"
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleGenerateAuditSummary} className="gap-2">
          <FileDown className="h-4 w-4" />
          Generate Audit Summary
        </Button>
      </div>
    </>
  );
};
