import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TaxCalculator from "@/components/tax/TaxCalculator";

const TaxWebApp = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Calculate different types of taxes based on your income
          </p>
        </div>

        <TaxCalculator />
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;