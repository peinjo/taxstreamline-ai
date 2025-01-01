import React, { useState } from "react";
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

const TAX_TYPES = [
  { id: "cit", name: "Corporate Income Tax", rate: 0.30 },
  { id: "vat", name: "VAT", rate: 0.16 },
  { id: "paye", name: "PAYE", rate: 0.25 },
  { id: "cgt", name: "Capital Gain Tax", rate: 0.15 },
  { id: "wht", name: "Withholding Tax", rate: 0.20 },
];

const TaxCalculator = () => {
  const [income, setIncome] = useState<string>("");
  const [selectedTaxType, setSelectedTaxType] = useState<string>("");
  const [calculatedTax, setCalculatedTax] = useState<number | null>(null);

  const handleCalculate = () => {
    const selectedTax = TAX_TYPES.find((tax) => tax.id === selectedTaxType);
    if (selectedTax && income) {
      const taxAmount = parseFloat(income) * selectedTax.rate;
      setCalculatedTax(taxAmount);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="income" className="text-sm font-medium">
            Income Amount
          </label>
          <Input
            id="income"
            type="number"
            placeholder="Enter income amount"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tax Type</label>
          <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tax type" />
            </SelectTrigger>
            <SelectContent>
              {TAX_TYPES.map((tax) => (
                <SelectItem key={tax.id} value={tax.id}>
                  {tax.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full"
          disabled={!income || !selectedTaxType}
        >
          Calculate Tax
        </Button>

        {calculatedTax !== null && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Calculated Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ${calculatedTax.toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;