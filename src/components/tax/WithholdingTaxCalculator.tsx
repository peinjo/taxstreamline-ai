import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaxCalculatorLayout } from "./components/TaxCalculatorLayout";
import { WithholdingTaxForm } from "./components/WithholdingTaxForm";
import { TaxResult } from "./components/TaxResult";

export const WithholdingTaxCalculator = () => {
  const { toast } = useToast();
  const [income, setIncome] = useState("");
  const [type, setType] = useState("dividends");
  const [result, setResult] = useState<number | null>(null);

  const calculateTax = async () => {
    if (!income || isNaN(Number(income))) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid income amount",
        variant: "destructive",
      });
      return;
    }

    const incomeAmount = Number(income);
    let taxRate = 0;

    switch (type) {
      case "dividends":
        taxRate = 0.10;
        break;
      case "rent":
        taxRate = 0.10;
        break;
      case "royalties":
        taxRate = 0.05;
        break;
      case "professional_fees":
        taxRate = 0.10;
        break;
      default:
        taxRate = 0.10;
    }

    const taxAmount = incomeAmount * taxRate;

    try {
      const { error } = await supabase.from("tax_calculations").insert({
        tax_type: "withholding",
        income: incomeAmount,
        tax_amount: taxAmount,
        input_data: { type },
        calculation_details: { tax_rate: taxRate },
      });

      if (error) throw error;

      setResult(taxAmount);

      toast({
        title: "Tax Calculated",
        description: `Withholding Tax Amount: ₦${taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation",
        variant: "destructive",
      });
    }
  };

  return (
    <TaxCalculatorLayout title="Withholding Tax Calculator">
      <WithholdingTaxForm
        income={income}
        type={type}
        onIncomeChange={setIncome}
        onTypeChange={setType}
        onCalculate={calculateTax}
      />
      <TaxResult amount={result} label="Withholding Tax" />
    </TaxCalculatorLayout>
  );
};