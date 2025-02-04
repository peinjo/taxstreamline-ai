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
import {
  fetchTaxRates,
  calculateStampDuty,
  saveTaxCalculation,
} from "@/services/taxCalculator";

export const StampDutyCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    amount: 0,
    type: "property",
  });
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "stamp_duty"],
    queryFn: () => fetchTaxRates("stamp_duty"),
  });

  const handleCalculate = async () => {
    try {
      if (!taxRates) return;
      
      const selectedRate = taxRates.find(
        (rate) => rate.subcategory === inputs.type
      );
      
      if (!selectedRate) return;

      const calculation = calculateStampDuty(
        inputs.amount,
        selectedRate.rate
      );

      setResult(calculation.taxAmount);

      await saveTaxCalculation(
        "stamp_duty",
        inputs.amount,
        calculation.taxAmount,
        inputs,
        calculation.details
      );

      toast({
        title: "Tax Calculated",
        description: `Stamp Duty: $${calculation.taxAmount.toFixed(2)}`,
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
        <CardTitle>Stamp Duty Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Amount</label>
          <Input
            type="number"
            value={inputs.amount}
            onChange={(e) =>
              setInputs({
                ...inputs,
                amount: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Type</label>
          <Select
            value={inputs.type}
            onValueChange={(value) => setInputs({ ...inputs, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
        {result !== null && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Calculated Stamp Duty:</h3>
            <p className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};