
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAYECalculator } from "./PAYECalculator";
import { VATCalculator } from "./VATCalculator";
import { CorporateIncomeTaxCalculator } from "./CorporateIncomeTaxCalculator";
import { CapitalGainsTaxCalculator } from "./CapitalGainsTaxCalculator";
import { WithholdingTaxCalculator } from "./WithholdingTaxCalculator";
import { StampDutyCalculator } from "./StampDutyCalculator";
import { EducationTaxCalculator } from "./EducationTaxCalculator";
import { PetroleumProfitTaxCalculator } from "./PetroleumProfitTaxCalculator";
import { IndustryTaxForm } from "./IndustryTaxForm";
import { IncomeTaxCalculator } from "./IncomeTaxCalculator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

export const TaxCalculator = () => {
  const { data: recentCalculations } = useQuery({
    queryKey: ["recentCalculations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="income" className="space-y-4">
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

          <div className="grid gap-6">
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

      {recentCalculations && recentCalculations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Calculations</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCalculations.map((calc) => (
                <TableRow key={calc.id}>
                  <TableCell className="capitalize">{calc.tax_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>₦{calc.income.toFixed(2)}</TableCell>
                  <TableCell>₦{calc.tax_amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(calc.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
