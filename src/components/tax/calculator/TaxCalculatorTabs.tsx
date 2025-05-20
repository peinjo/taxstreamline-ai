
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { IncomeTaxCalculator } from "../IncomeTaxCalculator";
import { CorporateIncomeTaxCalculator } from "../CorporateIncomeTaxCalculator";
import { VATCalculator } from "../VATCalculator";
import { PAYECalculator } from "../PAYECalculator";
import { CapitalGainsTaxCalculator } from "../CapitalGainsTaxCalculator";
import { WithholdingTaxCalculator } from "../WithholdingTaxCalculator";
import { StampDutyCalculator } from "../StampDutyCalculator";
import { EducationTaxCalculator } from "../EducationTaxCalculator";
import { PetroleumProfitTaxCalculator } from "../PetroleumProfitTaxCalculator";
import { IndustryTaxForm } from "../IndustryTaxForm";

export const TaxCalculatorTabs = () => {
  return (
    <Card className="p-6">
      <Tabs defaultValue="income" className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="corporate">Corporate Income</TabsTrigger>
          <TabsTrigger value="vat">VAT</TabsTrigger>
          <TabsTrigger value="paye">PAYE</TabsTrigger>
          <TabsTrigger value="capital-gains">Capital Gains</TabsTrigger>
          <TabsTrigger value="withholding">Withholding</TabsTrigger>
          <TabsTrigger value="stamp-duty">Stamp Duty</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="petroleum">Petroleum Profit</TabsTrigger>
          <TabsTrigger value="industry">Industry Specific</TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <TabsContent value="income">
            <IncomeTaxCalculator />
          </TabsContent>
          <TabsContent value="corporate">
            <CorporateIncomeTaxCalculator />
          </TabsContent>
          <TabsContent value="vat">
            <VATCalculator />
          </TabsContent>
          <TabsContent value="paye">
            <PAYECalculator />
          </TabsContent>
          <TabsContent value="capital-gains">
            <CapitalGainsTaxCalculator />
          </TabsContent>
          <TabsContent value="withholding">
            <WithholdingTaxCalculator />
          </TabsContent>
          <TabsContent value="stamp-duty">
            <StampDutyCalculator />
          </TabsContent>
          <TabsContent value="education">
            <EducationTaxCalculator />
          </TabsContent>
          <TabsContent value="petroleum">
            <PetroleumProfitTaxCalculator />
          </TabsContent>
          <TabsContent value="industry">
            <IndustryTaxForm />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
