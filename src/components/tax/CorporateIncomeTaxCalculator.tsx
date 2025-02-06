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

  const { data: taxRates, error: taxRatesError } = useQuery({
    queryKey: ["taxRates", "corporate_income"],
    queryFn: () => fetchTaxRates("corporate_income"),
    retry: 2,
    onError: (error) => {
      console.error("Error fetching tax rates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tax rates. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = async () => {
    try {
      if (taxRatesError) {
        toast({
          title: "Error",
          description: "Unable to calculate tax due to missing tax rates.",
          variant: "destructive",
        });
        return;
      }

      const defaultRate = 30; // Default corporate tax rate if none found
      const rate = taxRates?.[0]?.rate ?? defaultRate;

      const calculation = calculateCorporateIncomeTax(
        inputs.annualIncome,
        inputs.deductibleExpenses,
        inputs.exemptions,
        rate
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
      console.error("Calculation error:", error);
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