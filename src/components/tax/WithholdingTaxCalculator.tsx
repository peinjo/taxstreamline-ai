import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const WithholdingTaxCalculator = () => {
  const [income, setIncome] = useState("");
  const [type, setType] = useState("dividends");
  const { toast } = useToast();

  const calculateTax = async () => {
    if (!income || isNaN(Number(income))) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid income amount",
        variant: "destructive",
      });
      return;
    }

    const incomeAmount = Number(income);
    let taxRate = 0;

    switch (type) {
      case "dividends":
        taxRate = 0.10;
        break;
      case "rent":
        taxRate = 0.10;
        break;
      case "royalties":
        taxRate = 0.05;
        break;
      case "professional_fees":
        taxRate = 0.10;
        break;
      default:
        taxRate = 0.10;
    }

    const taxAmount = incomeAmount * taxRate;

    try {
      const { error } = await supabase.from("tax_calculations").insert({
        tax_type: "withholding",
        income: incomeAmount,
        tax_amount: taxAmount,
        input_data: { type },
        calculation_details: { tax_rate: taxRate },
      });

      if (error) throw error;

      toast({
        title: "Tax Calculated",
        description: `Withholding Tax Amount: ₦${taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Income Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dividends">Dividends</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="royalties">Royalties</SelectItem>
                <SelectItem value="professional_fees">Professional Fees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Income Amount (₦)</Label>
            <Input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Enter income amount"
            />
          </div>

          <Button onClick={calculateTax} className="w-full">
            Calculate Withholding Tax
          </Button>
        </div>
      </Card>
    </div>
  );
};