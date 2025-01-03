import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, calculatePAYETax, saveTaxCalculation } from "@/services/taxCalculator";
import type { PAYEInput } from "@/types/tax";

export const PAYECalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<PAYEInput>({
    grossSalary: 0,
    pensionContributions: 0,
    allowances: 0,
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "paye"],
    queryFn: () => fetchTaxRates("paye"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates) return;

      const calculation = calculatePAYETax(
        inputs.grossSalary,
        inputs.pensionContributions,
        inputs.allowances,
        taxRates
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "paye",
        inputs.grossSalary,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `PAYE Tax: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate PAYE tax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PAYE Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Gross Salary</label>
          <Input
            type="number"
            value={inputs.grossSalary}
            onChange={(e) =>
              setInputs({ ...inputs, grossSalary: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Pension Contributions</label>
          <Input
            type="number"
            value={inputs.pensionContributions}
            onChange={(e) =>
              setInputs({
                ...inputs,
                pensionContributions: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Allowances</label>
          <Input
            type="number"
            value={inputs.allowances}
            onChange={(e) =>
              setInputs({ ...inputs, allowances: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated PAYE Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};