
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, calculateIndustryTax, saveTaxCalculation } from "@/services/taxCalculator";

export const PetroleumProfitTaxCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    revenue: 0,
    operatingCosts: 0,
    capitalAllowance: 0,
    royalties: 0,
    petroleumProfitTax: 0,
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "petroleum_profit"],
    queryFn: () => fetchTaxRates("petroleum_profit"),
  });

  const handleCalculate = async () => {
    try {
      const calculation = calculateIndustryTax(
        inputs,
        "oil_and_gas",
        taxRates?.[0]?.rate || 85
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "petroleum_profit",
        inputs.revenue,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Petroleum Profit Tax: ₦${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate petroleum profit tax",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Petroleum Profit Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Revenue (₦)</label>
          <Input
            type="number"
            value={inputs.revenue}
            onChange={(e) => handleInputChange("revenue", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Operating Costs (₦)</label>
          <Input
            type="number"
            value={inputs.operatingCosts}
            onChange={(e) => handleInputChange("operatingCosts", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Capital Allowance (₦)</label>
          <Input
            type="number"
            value={inputs.capitalAllowance}
            onChange={(e) => handleInputChange("capitalAllowance", parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Royalties (₦)</label>
          <Input
            type="number"
            value={inputs.royalties}
            onChange={(e) => handleInputChange("royalties", parseFloat(e.target.value) || 0)}
          />
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>

        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Petroleum Profit Tax:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
