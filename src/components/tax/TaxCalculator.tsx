
import React from "react";
import { TaxCalculatorTabs } from "./calculator/TaxCalculatorTabs";
import { RecentCalculations } from "./calculator/RecentCalculations";

export const TaxCalculator = () => {
  return (
    <div className="space-y-6">
      <TaxCalculatorTabs />
      <RecentCalculations />
    </div>
  );
};
