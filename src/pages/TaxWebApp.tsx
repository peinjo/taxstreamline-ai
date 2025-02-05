
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { CorporateIncomeTaxCalculator } from "@/components/tax/CorporateIncomeTaxCalculator";
import { VATCalculator } from "@/components/tax/VATCalculator";
import { PAYECalculator } from "@/components/tax/PAYECalculator";
import { CapitalGainsTaxCalculator } from "@/components/tax/CapitalGainsTaxCalculator";
import { WithholdingTaxCalculator } from "@/components/tax/WithholdingTaxCalculator";
import { IndustryTaxForm } from "@/components/tax/IndustryTaxForm";
import { StampDutyCalculator } from "@/components/tax/StampDutyCalculator";
import { EducationTaxCalculator } from "@/components/tax/EducationTaxCalculator";
import { FilingHistory } from "@/components/tax/FilingHistory";
import { PaymentForm } from "@/components/tax/PaymentForm";
import { DocumentManager } from "@/components/tax/DocumentManager";
import { TemplatesAndGuides } from "@/components/tax/TemplatesAndGuides";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const TaxWebApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-12 mt-16">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Manage your tax calculations, filings, and payments
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-12">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <TabsTrigger value="calculator">Income Tax</TabsTrigger>
            <TabsTrigger value="corporate">Corporate</TabsTrigger>
            <TabsTrigger value="vat">VAT</TabsTrigger>
            <TabsTrigger value="paye">PAYE</TabsTrigger>
            <TabsTrigger value="capital-gains">Capital Gains</TabsTrigger>
            <TabsTrigger value="withholding">Withholding</TabsTrigger>
            <TabsTrigger value="stamp-duty">Stamp Duty</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="industry">Industry</TabsTrigger>
            <TabsTrigger value="filings">Filings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="mt-12">
            <TaxCalculator />
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

          <TabsContent value="industry" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <IndustryTaxForm industry="manufacturing" />
              <IndustryTaxForm industry="oil_and_gas" />
            </div>
          </TabsContent>

          <TabsContent value="filings">
            <FilingHistory />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentForm />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentManager />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesAndGuides />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;
