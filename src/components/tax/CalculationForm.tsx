import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CalculationFormProps {
  onCalculate: (income: number) => void;
}

export const CalculationForm = ({ onCalculate }: CalculationFormProps) => {
  const [income, setIncome] = useState("");

  const handleSubmit = () => {
    const incomeAmount = parseFloat(income);
    if (!isNaN(incomeAmount)) {
      onCalculate(incomeAmount);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Income Amount</label>
        <Input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Enter income amount"
        />
      </div>
      <Button onClick={handleSubmit}>Calculate Tax</Button>
    </div>
  );
};