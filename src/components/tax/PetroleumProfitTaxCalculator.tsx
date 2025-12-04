import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, calculateIndustryTax, saveTaxCalculation } from "@/services/taxCalculator";
import { Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showFormula, setShowFormula] = useState(false);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "petroleum_profit"],
    queryFn: () => fetchTaxRates("petroleum_profit"),
  });

  const rate = taxRates?.[0]?.rate || 85;
  const adjustedProfit = Math.max(0, inputs.revenue - inputs.operatingCosts - inputs.capitalAllowance - inputs.royalties);

  const handleCalculate = async () => {
    try {
      const calculation = calculateIndustryTax(
        inputs,
        "oil_and_gas",
        rate
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
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Petroleum Profit Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formula Transparency Section */}
        <Collapsible open={showFormula} onOpenChange={setShowFormula}>
          <CollapsibleTrigger asChild>
            <Alert className="cursor-pointer hover:bg-muted/50 transition-colors">
              <Info className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                Formula & Rates
                <span className="text-xs text-muted-foreground">
                  {showFormula ? "Click to hide" : "Click to expand"}
                </span>
              </AlertTitle>
            </Alert>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="p-4 bg-muted/30 rounded-lg space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-foreground">Formula:</h4>
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  Adjusted Profit = Revenue - Operating Costs - Capital Allowance - Royalties
                </code>
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  PPT = Adjusted Profit × Rate%
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Rate Tiers (per PIA 2021):</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Onshore & Shallow Water: 65%</li>
                  <li>Deep Offshore: 50%</li>
                  <li>Pre-2021 PSC contracts: 85% (legacy)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Allowable Deductions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Operating costs (exploration, drilling, production)</li>
                  <li>Capital allowances (accelerated depreciation)</li>
                  <li>Royalties paid to government</li>
                  <li>Investment tax credit (10% for gas)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Company holds valid petroleum license</li>
                  <li>Operations in Nigerian territory</li>
                  <li>Standard rate applied (adjust for location)</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Petroleum Industry Act 2021</a>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Petroleum Profit Tax:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Revenue: ₦{inputs.revenue.toLocaleString()}</p>
              <p>Operating Costs: ₦{inputs.operatingCosts.toLocaleString()}</p>
              <p>Capital Allowance: ₦{inputs.capitalAllowance.toLocaleString()}</p>
              <p>Royalties: ₦{inputs.royalties.toLocaleString()}</p>
              <p>Adjusted Profit: ₦{adjustedProfit.toLocaleString()}</p>
              <p>Rate Applied: {rate}%</p>
              <p>= ₦{adjustedProfit.toLocaleString()} × {rate}% = ₦{result.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
