import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateEducationTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";

export const EducationTaxCalculator = () => {
  const { toast } = useToast();
  const [assessableProfits, setAssessableProfits] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "education_tax"],
    queryFn: () => fetchTaxRates("education_tax"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates?.[0]) return;

      const calculation = calculateEducationTax(
        assessableProfits,
        taxRates[0].rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "education_tax",
        assessableProfits,
        calculation.taxAmount,
        { assessableProfits },
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Education Tax: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate education tax",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Assessable Profits</label>
          <Input
            type="number"
            value={assessableProfits}
            onChange={(e) => setAssessableProfits(parseFloat(e.target.value) || 0)}
          />
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Education Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};