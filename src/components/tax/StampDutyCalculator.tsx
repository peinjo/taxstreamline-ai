
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
import { fetchTaxRates, saveTaxCalculation } from "@/services/taxCalculator";

export const StampDutyCalculator = () => {
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<string>("property");
  const [amount, setAmount] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const { data: taxRates } = useQuery({
    queryKey: ["taxRates", "stamp_duty"],
    queryFn: () => fetchTaxRates("stamp_duty"),
  });

  const handleCalculate = async () => {
    try {
      const rate = taxRates?.find(rate => rate.subcategory === transactionType)?.rate || 0;
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
        <CardTitle>Stamp Duty Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold">Stamp Duty:</h3>
            <p className="text-2xl font-bold text-primary">₦{result.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
