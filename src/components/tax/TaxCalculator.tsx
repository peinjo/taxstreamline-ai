import React, { useState, startTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CorporateIncomeTaxCalculator } from "./CorporateIncomeTaxCalculator";
import { VATCalculator } from "./VATCalculator";
import { PAYECalculator } from "./PAYECalculator";
import { CapitalGainsTaxCalculator } from "./CapitalGainsTaxCalculator";
import { WithholdingTaxCalculator } from "./WithholdingTaxCalculator";

const TAX_TYPES = [
  { id: "corporate", name: "Corporate Income Tax" },
  { id: "vat", name: "VAT" },
  { id: "paye", name: "PAYE" },
  { id: "capital_gains", name: "Capital Gains Tax" },
  { id: "withholding", name: "Withholding Tax" },
];

const TaxCalculator = () => {
  const [selectedTaxType, setSelectedTaxType] = useState<string>("");

  const handleTaxTypeChange = (value: string) => {
    startTransition(() => {
      setSelectedTaxType(value);
    });
  };

  const renderCalculator = () => {
    switch (selectedTaxType) {
      case "corporate":
        return <CorporateIncomeTaxCalculator />;
      case "vat":
        return <VATCalculator />;
      case "paye":
        return <PAYECalculator />;
      case "capital_gains":
        return <CapitalGainsTaxCalculator />;
      case "withholding":
        return <WithholdingTaxCalculator />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tax Type</label>
          <Select value={selectedTaxType} onValueChange={handleTaxTypeChange}>
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

        {renderCalculator()}
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;