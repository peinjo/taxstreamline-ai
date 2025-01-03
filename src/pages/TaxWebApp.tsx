import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TaxCalculator from "@/components/tax/TaxCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxGuidesList } from "@/components/guides/TaxGuidesList";
import { TemplatesList } from "@/components/templates/TemplatesList";

const TaxWebApp = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-12">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Calculate different types of taxes based on your income
          </p>
        </div>

        <TaxCalculator />

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tax Templates & Guides</h2>
          <p className="text-muted-foreground">
            Access and download tax templates and guides
          </p>

          <Tabs defaultValue="templates" className="w-full">
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>
            <TabsContent value="templates" className="mt-6">
              <TemplatesList />
            </TabsContent>
            <TabsContent value="guides" className="mt-6">
              <TaxGuidesList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;