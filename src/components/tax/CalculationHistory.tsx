import React from "react";
import type { TaxCalculation } from "@/types";

interface CalculationHistoryProps {
  calculations: TaxCalculation[];
}

export const CalculationHistory = ({ calculations }: CalculationHistoryProps) => {
  if (!calculations?.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Recent Calculations</h3>
      <div className="space-y-2">
        {calculations.map((calc) => (
          <div
            key={calc.id}
            className="p-3 bg-gray-50 rounded-lg flex justify-between"
          >
            <div>
              <span className="font-medium">Income Tax</span>
              <span className="text-gray-500 ml-2">
                Income: ₦{calc.income.toLocaleString()}
              </span>
            </div>
            <span className="font-medium">
              Tax: ₦{calc.tax_amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};