import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, saveTaxCalculation } from "@/services/taxCalculator";
import { Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const IncomeTaxCalculator = () => {
  const { toast } = useToast();
  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [breakdown, setBreakdown] = useState<{bracket: string; amount: number; tax: number}[]>([]);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "income_tax"],
    queryFn: () => fetchTaxRates("income_tax"),
  });

  const brackets = [
    { limit: 300000, rate: 7, label: "First ₦300,000" },
    { limit: 300000, rate: 11, label: "Next ₦300,000" },
    { limit: 500000, rate: 15, label: "Next ₦500,000" },
    { limit: 500000, rate: 19, label: "Next ₦500,000" },
    { limit: 1600000, rate: 21, label: "Next ₦1,600,000" },
    { limit: Infinity, rate: 24, label: "Above ₦3,200,000" }
  ];

  const calculateIncomeTax = (income: number) => {
    let remainingIncome = income;
    let totalTax = 0;
    const taxBreakdown: {bracket: string; amount: number; tax: number}[] = [];

    brackets.forEach(({ limit, rate, label }) => {
      const taxableAmount = Math.min(Math.max(remainingIncome, 0), limit);
      const taxForBracket = (taxableAmount * rate) / 100;
      
      if (taxableAmount > 0) {
        taxBreakdown.push({
          bracket: label,
          amount: taxableAmount,
          tax: taxForBracket
        });
      }
      
      totalTax += taxForBracket;
      remainingIncome -= limit;
    });

    return { totalTax, breakdown: taxBreakdown };
  };

  const handleCalculate = async () => {
    try {
      const { totalTax, breakdown: taxBreakdown } = calculateIncomeTax(annualIncome);
      setResult(totalTax);
      setBreakdown(taxBreakdown);

      await saveTaxCalculation(
        "income_tax",
        annualIncome,
        totalTax,
        { annualIncome },
        { totalTax, breakdown: taxBreakdown }
      );

      toast({
        title: "Tax Calculated",
        description: `Income Tax: ₦${totalTax.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate income tax",
        variant: "destructive",
      });
    }
  };

  const effectiveRate = annualIncome > 0 && result ? ((result / annualIncome) * 100).toFixed(2) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Personal Income Tax Calculator
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
                <h4 className="font-semibold text-foreground">Calculation Method:</h4>
                <p className="text-muted-foreground">
                  Progressive tax applied to each income bracket separately
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Tax Brackets (PIT Act):</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {brackets.map((b, i) => (
                    <li key={i}>{b.label}: {b.rate}%</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Formula per Bracket:</h4>
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  Tax = Taxable Amount in Bracket × Bracket Rate%
                </code>
                <code className="block mt-1 p-2 bg-background rounded text-xs">
                  Total Tax = Sum of all bracket taxes
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Note:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>This shows gross tax before reliefs</li>
                  <li>Use PAYE Calculator for employment income (includes CRA)</li>
                  <li>Minimum tax: 1% of gross income if higher</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Individual is Nigerian tax resident</li>
                  <li>No reliefs/deductions applied (use PAYE for those)</li>
                  <li>Annual income calculation</li>
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Income Tax:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Effective Rate: {effectiveRate}%</p>
            
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Annual Income: ₦{annualIncome.toLocaleString()}</p>
              
              {breakdown.length > 0 && (
                <div className="mt-2 space-y-1">
                  {breakdown.map((item, index) => (
                    <p key={index}>
                      {item.bracket}: ₦{item.amount.toLocaleString()} × rate = ₦{item.tax.toFixed(2)}
                    </p>
                  ))}
                  <p className="font-semibold pt-1 border-t border-border">
                    Total Tax: ₦{result.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
