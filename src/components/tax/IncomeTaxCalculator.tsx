
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, saveTaxCalculation } from "@/services/taxCalculator";

export const IncomeTaxCalculator = () => {
  const { toast } = useToast();
  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "income_tax"],
    queryFn: () => fetchTaxRates("income_tax"),
  });

  const calculateIncomeTax = (income: number) => {
    const brackets = [
      { limit: 300000, rate: 7 },
      { limit: 300000, rate: 11 },
      { limit: 500000, rate: 15 },
      { limit: 500000, rate: 19 },
      { limit: 1600000, rate: 21 },
      { limit: Infinity, rate: 24 }
    ];

    let remainingIncome = income;
    let totalTax = 0;
    let previousLimit = 0;

    brackets.forEach(({ limit, rate }) => {
      const taxableAmount = Math.min(Math.max(remainingIncome, 0), limit);
      totalTax += (taxableAmount * rate) / 100;
      remainingIncome -= limit;
      previousLimit += limit;
    });

    return totalTax;
  };

  const handleCalculate = async () => {
    try {
      const calculatedTax = calculateIncomeTax(annualIncome);
      setResult(calculatedTax);

      await saveTaxCalculation(
        "income_tax",
        annualIncome,
        calculatedTax,
        { annualIncome },
        { calculatedTax }
      );

      toast({
        title: "Tax Calculated",
        description: `Income Tax: ₦${calculatedTax.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate income tax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Annual Income (₦)</label>
          <Input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
          />
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>

        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Income Tax:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
