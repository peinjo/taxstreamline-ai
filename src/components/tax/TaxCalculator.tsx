import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaxCalculation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const TaxCalculator = () => {
  const { user } = useAuth();
  const [income, setIncome] = useState("");
  const [taxType, setTaxType] = useState("income");

  const { data: calculations } = useQuery({
    queryKey: ["tax-calculations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .eq("user_id", user?.id)
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

    const taxAmount = calculateTaxAmount(incomeAmount, taxType);

    const { error } = await supabase.from("tax_calculations").insert([
      {
        user_id: user.id,
        tax_type: taxType,
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

  const calculateTaxAmount = (income: number, type: string): number => {
    // Simplified tax calculation logic
    const rates: Record<string, number> = {
      income: 0.3,
      corporate: 0.25,
      capital_gains: 0.15,
    };

    return income * (rates[type] || 0.3);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tax Calculator</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tax Type</label>
          <Select value={taxType} onValueChange={setTaxType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income Tax</SelectItem>
              <SelectItem value="corporate">Corporate Tax</SelectItem>
              <SelectItem value="capital_gains">Capital Gains Tax</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                    <span className="font-medium">
                      {calc.tax_type.charAt(0).toUpperCase() +
                        calc.tax_type.slice(1)}{" "}
                      Tax
                    </span>
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