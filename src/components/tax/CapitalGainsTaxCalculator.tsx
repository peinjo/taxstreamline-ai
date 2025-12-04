import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateCapitalGainsTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";
import type { CapitalGainsTaxInput } from "@/types/tax";
import { Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const CapitalGainsTaxCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<CapitalGainsTaxInput>({
    purchasePrice: 0,
    sellingPrice: 0,
  });
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "capital_gains"],
    queryFn: () => fetchTaxRates("capital_gains"),
  });

  const defaultRate = 10;
  const rate = taxRates?.[0]?.rate ?? defaultRate;
  const capitalGain = Math.max(0, inputs.sellingPrice - inputs.purchasePrice);

  const handleCalculate = async () => {
    try {
      const calculation = calculateCapitalGainsTax(
        inputs.purchasePrice,
        inputs.sellingPrice,
        rate
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
        description: `Capital Gains Tax: ₦${calculation.taxAmount.toFixed(2)}`,
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
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Capital Gains Tax Calculator
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
                  Capital Gain = Selling Price - Purchase Price
                </code>
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  CGT = Capital Gain × {rate}%
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Current Rate:</h4>
                <p className="text-muted-foreground">
                  {rate}% (Standard CGT rate per FIRS)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Exempt Assets:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Government securities and bonds</li>
                  <li>Unit trusts</li>
                  <li>Life insurance policies</li>
                  <li>Private motor vehicles</li>
                  <li>Gains reinvested within same year</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Asset is not exempt from CGT</li>
                  <li>Disposal is not a gift or inheritance</li>
                  <li>No rollover relief claimed</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Capital Gains Tax Act</a>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Price (₦)</label>
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
          <label className="text-sm font-medium">Selling Price (₦)</label>
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Calculated Capital Gains Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ₦{result.toFixed(2)}
            </p>
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Purchase Price: ₦{inputs.purchasePrice.toLocaleString()}</p>
              <p>Selling Price: ₦{inputs.sellingPrice.toLocaleString()}</p>
              <p>Capital Gain: ₦{capitalGain.toLocaleString()}</p>
              <p>Rate Applied: {rate}%</p>
              <p>= ₦{capitalGain.toLocaleString()} × {rate}% = ₦{result.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
