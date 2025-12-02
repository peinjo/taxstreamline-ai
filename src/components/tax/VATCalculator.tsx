import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { fetchTaxRates, calculateVAT, saveTaxCalculation } from "@/services/taxCalculator";
import type { VATInput } from "@/types/tax";
import { Info, Calculator } from "lucide-react";

export const VATCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<VATInput>({
    totalSales: 0,
    exemptSales: 0,
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "vat"],
    queryFn: () => fetchTaxRates("vat"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates?.[0]) return;

      const calculation = calculateVAT(
        inputs.totalSales,
        inputs.exemptSales,
        taxRates[0].rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "vat",
        inputs.totalSales,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `VAT: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate VAT",
        variant: "destructive",
      });
    }
  };

  const currentRate = taxRates?.[0]?.rate || 0.075;
  const taxableSales = inputs.totalSales - inputs.exemptSales;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>VAT Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate Value Added Tax for your business transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formula Transparency */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <div className="font-semibold">Formula Used:</div>
              <div className="font-mono bg-muted p-2 rounded">
                VAT = (Total Sales - Exempt Sales) × {(currentRate * 100).toFixed(1)}%
              </div>
              <div className="mt-3">
                <div className="font-semibold">Current Rate:</div>
                <div>{(currentRate * 100).toFixed(1)}% (FIRS Standard VAT Rate)</div>
              </div>
              <div className="mt-2">
                <div className="font-semibold">Assumptions:</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>All sales are taxable unless marked as exempt</li>
                  <li>Rate applies to goods and services (some exemptions apply)</li>
                  <li>Businesses must register if turnover exceeds ₦25 million</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <label className="text-sm font-medium">Total Sales</label>
          <Input
            type="number"
            value={inputs.totalSales}
            onChange={(e) =>
              setInputs({ ...inputs, totalSales: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Exempt Sales</label>
          <Input
            type="number"
            value={inputs.exemptSales}
            onChange={(e) =>
              setInputs({ ...inputs, exemptSales: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate VAT
        </Button>
        
        {result !== null && (
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Calculated VAT</h3>
              <p className="text-3xl font-bold text-primary">
                ₦{result.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            {/* Calculation Breakdown */}
            <div className="p-4 border rounded-lg space-y-2 text-sm">
              <div className="font-semibold mb-2">Calculation Breakdown:</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sales:</span>
                <span className="font-medium">₦{inputs.totalSales.toLocaleString('en-NG')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Less: Exempt Sales:</span>
                <span className="font-medium">₦{inputs.exemptSales.toLocaleString('en-NG')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-muted-foreground">Taxable Sales:</span>
                <span className="font-medium">₦{taxableSales.toLocaleString('en-NG')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT Rate:</span>
                <span className="font-medium">{(currentRate * 100).toFixed(1)}%</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>VAT Payable:</span>
                <span className="text-primary">₦{result.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};