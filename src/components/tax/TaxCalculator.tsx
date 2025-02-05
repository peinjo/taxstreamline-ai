import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import type { TaxCalculation } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { CalculationForm } from "./CalculationForm";
import { CalculationHistory } from "./CalculationHistory";

export const TaxCalculator = () => {
  const { user } = useAuth();

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

  const handleCalculate = async (income: number) => {
    if (!user) return;

    const taxAmount = calculateTaxAmount(income);

    const { error } = await supabase.from("tax_calculations").insert([
      {
        user_id: user.id,
        tax_type: "income",
        income: income,
        tax_amount: taxAmount,
        input_data: { income },
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
        <CalculationForm onCalculate={handleCalculate} />
        {calculations && <CalculationHistory calculations={calculations} />}
      </div>
    </Card>
  );
};

export default TaxCalculator;