
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
import { fetchTaxRates, calculateIndustryTax, saveTaxCalculation } from "@/services/taxCalculator";

export const IndustryTaxForm = () => {
  const { toast } = useToast();
  const [industry, setIndustry] = useState<string>("manufacturing");
  const [inputs, setInputs] = useState({
    revenue: 0,
    operatingCosts: 0,
    capitalAllowance: 0,
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", industry],
    queryFn: () => fetchTaxRates(industry),
  });

  const handleCalculate = async () => {
    try {
      const calculation = calculateIndustryTax(
        inputs,
        industry,
        taxRates?.[0]?.rate || 30
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        industry,
        inputs.revenue,
        calculation.taxAmount,
        { ...inputs, industry },
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Industry Tax: ₦${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate industry tax",
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
        <CardTitle>Industry-Specific Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space

-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Industry</label>
          <Select
            value={industry}
            onValueChange={setIndustry}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="oil_and_gas">Oil and Gas</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>

        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Tax:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
