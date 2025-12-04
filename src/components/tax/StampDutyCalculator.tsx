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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, saveTaxCalculation } from "@/services/taxCalculator";
import { Info, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const StampDutyCalculator = () => {
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<string>("property");
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "stamp_duty"],
    queryFn: () => fetchTaxRates("stamp_duty"),
  });

  const getDefaultRate = (type: string) => {
    switch (type) {
      case "property": return 1.5;
      case "lease": return 0.78;
      case "shares": return 0.75;
      case "mortgage": return 0.375;
      default: return 1.5;
    }
  };

  const rate = taxRates?.find(rate => rate.subcategory === transactionType)?.rate || getDefaultRate(transactionType);

  const handleCalculate = async () => {
    try {
      const calculatedAmount = (amount * rate) / 100;
      setResult(calculatedAmount);

      await saveTaxCalculation(
        "stamp_duty",
        amount,
        calculatedAmount,
        { transactionType, amount },
        { rate, calculatedAmount }
      );

      toast({
        title: "Tax Calculated",
        description: `Stamp Duty: ₦${calculatedAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate stamp duty",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Stamp Duty Calculator
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
                  Stamp Duty = Transaction Amount × Rate%
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Rates by Transaction Type:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Property Transfer: 1.5%</li>
                  <li>Lease Agreements: 0.78%</li>
                  <li>Share Transfers: 0.75%</li>
                  <li>Mortgage Deeds: 0.375%</li>
                  <li>Tenancy Agreements: Flat rate (₦500 - ₦2,000)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Electronic Transactions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>₦10,000 and above: ₦50 flat duty</li>
                  <li>Below ₦10,000: Exempt</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Assumptions:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Ad valorem (percentage) rate applied</li>
                  <li>Transaction is dutiable under Stamp Duties Act</li>
                  <li>Document is executed in Nigeria</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Stamp Duties Act</a>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Type</label>
          <Select
            value={transactionType}
            onValueChange={setTransactionType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property">Property Transfer</SelectItem>
              <SelectItem value="lease">Lease Agreement</SelectItem>
              <SelectItem value="shares">Share Transfer</SelectItem>
              <SelectItem value="mortgage">Mortgage Deed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Amount (₦)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>

        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold">Stamp Duty:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
            <div className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
              <p><strong>Calculation Breakdown:</strong></p>
              <p>Transaction Amount: ₦{amount.toLocaleString()}</p>
              <p>Transaction Type: {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}</p>
              <p>Rate Applied: {rate}%</p>
              <p>= ₦{amount.toLocaleString()} × {rate}% = ₦{result.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
