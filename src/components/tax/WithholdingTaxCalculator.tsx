import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateWithholdingTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";
import type { WithholdingTaxInput, TaxRate } from "@/types/tax";

export const WithholdingTaxCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<WithholdingTaxInput>({
    paymentAmount: 0,
    category: "",
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "withholding"],
    queryFn: () => fetchTaxRates("withholding"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates) return;
      
      const selectedRate = taxRates.find(
        (rate: TaxRate) => rate.subcategory === inputs.category
      );
      
      if (!selectedRate) return;

      const calculation = calculateWithholdingTax(
        inputs.paymentAmount,
        selectedRate.rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "withholding",
        inputs.paymentAmount,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Withholding Tax: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate withholding tax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withholding Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Amount</label>
          <Input
            type="number"
            value={inputs.paymentAmount}
            onChange={(e) =>
              setInputs({
                ...inputs,
                paymentAmount: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={inputs.category}
            onValueChange={(value) => setInputs({ ...inputs, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {taxRates?.map((rate) => (
                <SelectItem key={rate.subcategory} value={rate.subcategory || ""}>
                  {rate.subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Withholding Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};