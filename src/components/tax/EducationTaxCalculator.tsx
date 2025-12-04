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

export const EducationTaxCalculator = () => {
  const { toast } = useToast();
  const [assessableProfits, setAssessableProfits] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "education"],
    queryFn: () => fetchTaxRates("education"),
  });

  const rate = taxRates?.[0]?.rate || 2;

  const handleCalculate = async () => {
    try {
      const calculatedAmount = (assessableProfits * rate) / 100;
      setResult(calculatedAmount);

      await saveTaxCalculation(
        "education",
        assessableProfits,
        calculatedAmount,
        { assessableProfits },
        { rate, calculatedAmount }
      );

      toast({
        title: "Tax Calculated",
        description: `Education Tax: ₦${calculatedAmount.toFixed(2)}`,
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
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Education Tax (TETFund) Calculator
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
                  Education Tax = Assessable Profits × {rate}%
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Current Rate:</h4>
                <p className="text-muted-foreground">
                  {rate}% of Assessable Profits (Tertiary Education Trust Fund Levy)
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Who Pays:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>All companies registered in Nigeria</li>
                  <li>Applies to companies with assessable profits</li>
                  <li>Payable along with Companies Income Tax</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Key Notes:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Administered by FIRS</li>
                  <li>Funds tertiary education institutions</li>
                  <li>Due same time as CIT returns</li>
                  <li>Not deductible for CIT purposes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Company is registered in Nigeria</li>
                  <li>Has assessable profits for the year</li>
                  <li>Standard rate applied (no exemptions)</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Tertiary Education Trust Fund Act</a>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assessable Profits (₦)</label>
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Education Tax:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Assessable Profits: ₦{assessableProfits.toLocaleString()}</p>
              <p>Rate Applied: {rate}%</p>
              <p>= ₦{assessableProfits.toLocaleString()} × {rate}% = ₦{result.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
