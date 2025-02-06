import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WithholdingTaxFormProps {
  income: string;
  type: string;
  onIncomeChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCalculate: () => void;
}

export const WithholdingTaxForm = ({
  income,
  type,
  onIncomeChange,
  onTypeChange,
  onCalculate,
}: WithholdingTaxFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Income Type</Label>
        <Select value={type} onValueChange={onTypeChange}>
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
          onChange={(e) => onIncomeChange(e.target.value)}
          placeholder="Enter income amount"
        />
      </div>

      <Button onClick={onCalculate} className="w-full">
        Calculate Withholding Tax
      </Button>
    </div>
  );
};