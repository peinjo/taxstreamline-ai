import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AuditReportingDashboard } from "@/components/audit/AuditReportingDashboard";

const AuditReporting = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Audit & Reporting</h1>
          <p className="text-muted-foreground">
            View and export tax reports and analytics
          </p>
        </div>
        <AuditReportingDashboard />
      </div>
    </DashboardLayout>
  );
};

export default AuditReporting;