import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateCorporateIncomeTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";
import type { CorporateIncomeTaxInput } from "@/types/tax";
import { logger } from "@/lib/logging/logger";
import { Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const CorporateIncomeTaxCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<CorporateIncomeTaxInput>({
    annualIncome: 0,
    deductibleExpenses: 0,
    exemptions: 0,
  });
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const { data: taxRates, error: taxRatesError } = useQuery({
    queryKey: ["taxRates", "corporate_income"],
    queryFn: () => fetchTaxRates("corporate_income"),
    retry: 2,
  });

  const defaultRate = 30;
  const rate = taxRates?.[0]?.rate ?? defaultRate;
  const taxableIncome = Math.max(0, inputs.annualIncome - inputs.deductibleExpenses - inputs.exemptions);

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
        description: `Corporate Income Tax: ₦${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      logger.error("Calculation error", error as Error, { component: 'CorporateIncomeTaxCalculator', inputs });
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
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Corporate Income Tax Calculator
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
                  CIT = (Annual Income - Deductible Expenses - Exemptions) × Rate
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Current Rate:</h4>
                <p className="text-muted-foreground">
                  {rate}% (Standard CIT rate per FIRS)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Rate Tiers:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Small companies (turnover ≤₦25M): 0%</li>
                  <li>Medium companies (₦25M-₦100M): 20%</li>
                  <li>Large companies (turnover &gt;₦100M): 30%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Company is resident in Nigeria</li>
                  <li>Standard rate applied (adjust based on turnover tier)</li>
                  <li>Deductible expenses are FIRS-approved</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Companies Income Tax Act</a>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <label className="text-sm font-medium">Annual Income (₦)</label>
          <Input
            type="number"
            value={inputs.annualIncome}
            onChange={(e) =>
              setInputs({ ...inputs, annualIncome: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Deductible Expenses (₦)</label>
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
          <label className="text-sm font-medium">Exemptions (₦)</label>
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Calculated Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ₦{result.toFixed(2)}
            </p>
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Taxable Income: ₦{taxableIncome.toLocaleString()}</p>
              <p>Rate Applied: {rate}%</p>
              <p>= ₦{taxableIncome.toLocaleString()} × {rate}% = ₦{result.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
