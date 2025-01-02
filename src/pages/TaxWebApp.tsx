import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { TaxDashboard } from "@/components/tax/TaxDashboard";
import TaxCalculator from "@/components/tax/TaxCalculator";
import { Routes, Route, Navigate } from "react-router-dom";

const TaxWebApp = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Manage your tax calculations and documents
          </p>
        </div>

        <Routes>
          <Route index element={<TaxDashboard />} />
          <Route path="calculator/:taxType" element={<TaxCalculator />} />
          <Route path="*" element={<Navigate to="/tax-web-app" replace />} />
        </Routes>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;