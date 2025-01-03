import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxGuidesList } from "@/components/guides/TaxGuidesList";
import { TemplatesList } from "@/components/templates/TemplatesList";

const TaxTemplatesAndGuides = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tax Templates & Guides</h1>
          <p className="text-muted-foreground">
            Access and download tax templates and guides
          </p>
        </div>

        <Tabs defaultValue="templates">
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
    </DashboardLayout>
  );
};

export default TaxTemplatesAndGuides;