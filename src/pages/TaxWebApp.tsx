import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { TemplatesAndGuides } from "@/components/tax/TemplatesAndGuides";
import { DocumentManager } from "@/components/tax/DocumentManager";
import { FilingForm } from "@/components/tax/FilingForm";
import { FilingHistory } from "@/components/tax/FilingHistory";
import { PaymentForm } from "@/components/tax/PaymentForm";
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
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Manage your tax calculations, filings, and payments
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="filings">Filings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <TaxCalculator />
          </TabsContent>

          <TabsContent value="filings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold mb-4">Submit New Filing</h2>
                <FilingForm />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Filing History</h2>
                <FilingHistory />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold mb-4">Make Payment</h2>
                <PaymentForm />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
                {/* Add payment history component here */}
              </div>
            </div>
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