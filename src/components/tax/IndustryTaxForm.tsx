import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchTaxRates,
  calculateIndustryTax,
  saveTaxCalculation,
} from "@/services/taxCalculator";

interface IndustryTaxFormProps {
  industry: "manufacturing" | "oil_and_gas";
}

export const IndustryTaxForm = ({ industry }: IndustryTaxFormProps) => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    revenue: 0,
    operatingCosts: 0,
    capitalAllowance: 0,
    ...(industry === "oil_and_gas" ? { royalties: 0, petroleumProfitTax: 0 } : {}),
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", industry],
    queryFn: () => fetchTaxRates(industry),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates?.[0]) return;

      const calculation = calculateIndustryTax(
        inputs,
        industry,
        taxRates[0].rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        industry,
        inputs.revenue,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `${industry.replace('_', ' ')} Tax: $${calculation.taxAmount.toFixed(2)}`,
      });
    } catch (error) {
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
        <CardTitle>
          {industry === "manufacturing" ? "Manufacturing" : "Oil & Gas"} Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Revenue</label>
          <Input
            type="number"
            value={inputs.revenue}
            onChange={(e) =>
              setInputs({ ...inputs, revenue: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Operating Costs</label>
          <Input
            type="number"
            value={inputs.operatingCosts}
            onChange={(e) =>
              setInputs({
                ...inputs,
                operatingCosts: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Capital Allowance</label>
          <Input
            type="number"
            value={inputs.capitalAllowance}
            onChange={(e) =>
              setInputs({
                ...inputs,
                capitalAllowance: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        {industry === "oil_and_gas" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Royalties</label>
              <Input
                type="number"
                value={inputs.royalties}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    royalties: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Petroleum Profit Tax</label>
              <Input
                type="number"
                value={inputs.petroleumProfitTax}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    petroleumProfitTax: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </>
        )}
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};