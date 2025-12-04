import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, calculatePAYETax, saveTaxCalculation } from "@/services/taxCalculator";
import type { PAYEInput } from "@/types/tax";
import { Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const PAYECalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<PAYEInput>({
    grossSalary: 0,
    pensionContributions: 0,
    allowances: 0,
  });
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "paye"],
    queryFn: () => fetchTaxRates("paye"),
  });

  const consolidatedRelief = Math.max(200000, inputs.grossSalary * 0.01) + (inputs.grossSalary * 0.2);
  const taxableIncome = Math.max(0, inputs.grossSalary - inputs.pensionContributions - consolidatedRelief);

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
        description: `PAYE Tax: ₦${calculation.taxAmount.toFixed(2)}`,
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
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          PAYE Calculator
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
                  Taxable Income = Gross Salary - Pension - Consolidated Relief
                </code>
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  CRA = ₦200,000 or 1% of Gross (higher) + 20% of Gross
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Progressive Tax Brackets:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>First ₦300,000: 7%</li>
                  <li>Next ₦300,000: 11%</li>
                  <li>Next ₦500,000: 15%</li>
                  <li>Next ₦500,000: 19%</li>
                  <li>Next ₦1,600,000: 21%</li>
                  <li>Above ₦3,200,000: 24%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Reliefs Applied:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Consolidated Relief Allowance (CRA)</li>
                  <li>Pension contributions (up to 8% of basic)</li>
                  <li>National Housing Fund (2.5% if applicable)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Employee is Nigerian tax resident</li>
                  <li>Annual income calculation</li>
                  <li>Standard CRA applied automatically</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Personal Income Tax Act</a>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gross Salary (₦)</label>
          <Input
            type="number"
            value={inputs.grossSalary}
            onChange={(e) =>
              setInputs({ ...inputs, grossSalary: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Pension Contributions (₦)</label>
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
          <label className="text-sm font-medium">Other Allowances (₦)</label>
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Calculated PAYE Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ₦{result.toFixed(2)}
            </p>
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Gross Salary: ₦{inputs.grossSalary.toLocaleString()}</p>
              <p>Consolidated Relief: ₦{consolidatedRelief.toLocaleString()}</p>
              <p>Pension Deduction: ₦{inputs.pensionContributions.toLocaleString()}</p>
              <p>Taxable Income: ₦{taxableIncome.toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
