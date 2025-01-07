import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CorporateIncomeTaxCalculator } from "./CorporateIncomeTaxCalculator";
import { VATCalculator } from "./VATCalculator";
import { PAYECalculator } from "./PAYECalculator";
import { CapitalGainsTaxCalculator } from "./CapitalGainsTaxCalculator";
import { WithholdingTaxCalculator } from "./WithholdingTaxCalculator";
import { IndustryTaxForm } from "./IndustryTaxForm";

const TAX_TYPES = [
  { id: "corporate", name: "Corporate Income Tax" },
  { id: "vat", name: "VAT" },
  { id: "paye", name: "PAYE" },
  { id: "capital_gains", name: "Capital Gains Tax" },
  { id: "withholding", name: "Withholding Tax" },
];

const TaxCalculator = () => {
  const [selectedTaxType, setSelectedTaxType] = useState<string>("");

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
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General Tax</TabsTrigger>
            <TabsTrigger value="manufacturing" className="flex-1">Manufacturing</TabsTrigger>
            <TabsTrigger value="oil-and-gas" className="flex-1">Oil & Gas</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-6">
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
              {renderCalculator()}
            </div>
          </TabsContent>

          <TabsContent value="manufacturing">
            <IndustryTaxForm industry="manufacturing" />
          </TabsContent>

          <TabsContent value="oil-and-gas">
            <IndustryTaxForm industry="oil_and_gas" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;