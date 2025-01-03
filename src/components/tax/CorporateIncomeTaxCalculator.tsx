import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateCorporateIncomeTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";
import type { CorporateIncomeTaxInput } from "@/types/tax";

export const CorporateIncomeTaxCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<CorporateIncomeTaxInput>({
    annualIncome: 0,
    deductibleExpenses: 0,
    exemptions: 0,
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "corporate_income"],
    queryFn: () => fetchTaxRates("corporate_income"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates?.[0]) return;

      const calculation = calculateCorporateIncomeTax(
        inputs.annualIncome,
        inputs.deductibleExpenses,
        inputs.exemptions,
        taxRates[0].rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "corporate_income",
        inputs.annualIncome,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Corporate Income Tax: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate tax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corporate Income Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Annual Income</label>
          <Input
            type="number"
            value={inputs.annualIncome}
            onChange={(e) =>
              setInputs({ ...inputs, annualIncome: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Deductible Expenses</label>
          <Input
            type="number"
            value={inputs.deductibleExpenses}
            onChange={(e) =>
              setInputs({
                ...inputs,
                deductibleExpenses: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Exemptions</label>
          <Input
            type="number"
            value={inputs.exemptions}
            onChange={(e) =>
              setInputs({ ...inputs, exemptions: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};