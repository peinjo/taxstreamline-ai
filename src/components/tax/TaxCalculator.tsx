import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaxCalculation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const TaxCalculator = () => {
  const { user } = useAuth();
  const [income, setIncome] = useState("");

  const { data: calculations } = useQuery({
    queryKey: ["tax-calculations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tax_type", "income")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TaxCalculation[];
    },
    enabled: !!user?.id,
  });

  const handleCalculate = async () => {
    if (!user) return;

    const incomeAmount = parseFloat(income);
    if (isNaN(incomeAmount)) return;

    const taxAmount = calculateTaxAmount(incomeAmount);

    const { error } = await supabase.from("tax_calculations").insert([
      {
        user_id: user.id,
        tax_type: "income",
        income: incomeAmount,
        tax_amount: taxAmount,
        input_data: { income: incomeAmount },
        calculation_details: { method: "standard" },
      },
    ]);

    if (error) {
      console.error("Error saving calculation:", error);
    }
  };

  const calculateTaxAmount = (income: number): number => {
    // Fetch rate from tax_rates table for income tax
    return income * 0.24; // Using 24% as default income tax rate
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Income Tax Calculator</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Income Amount</label>
          <Input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter income amount"
          />
        </div>

        <Button onClick={handleCalculate}>Calculate Tax</Button>

        {calculations && calculations.length > 0 && (
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
        )}
      </div>
    </Card>
  );
};

export default TaxCalculator;