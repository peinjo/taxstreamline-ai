import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateCapitalGainsTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";
import type { CapitalGainsTaxInput } from "@/types/tax";

export const CapitalGainsTaxCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<CapitalGainsTaxInput>({
    purchasePrice: 0,
    sellingPrice: 0,
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "capital_gains"],
    queryFn: () => fetchTaxRates("capital_gains"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates?.[0]) return;

      const calculation = calculateCapitalGainsTax(
        inputs.purchasePrice,
        inputs.sellingPrice,
        taxRates[0].rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "capital_gains",
        inputs.sellingPrice - inputs.purchasePrice,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Capital Gains Tax: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate capital gains tax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capital Gains Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Price</label>
          <Input
            type="number"
            value={inputs.purchasePrice}
            onChange={(e) =>
              setInputs({
                ...inputs,
                purchasePrice: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Selling Price</label>
          <Input
            type="number"
            value={inputs.sellingPrice}
            onChange={(e) =>
              setInputs({
                ...inputs,
                sellingPrice: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Capital Gains Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};