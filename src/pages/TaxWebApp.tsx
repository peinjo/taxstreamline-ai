
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { TemplatesAndGuides } from "@/components/tax/TemplatesAndGuides";
import { DocumentManager } from "@/components/tax/DocumentManager";
import { FilingForm } from "@/components/tax/FilingForm";
import { FilingHistory } from "@/components/tax/FilingHistory";
import { PaymentForm } from "@/components/tax/PaymentForm";
import { PaymentHistory } from "@/components/tax/PaymentHistory";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LightbulbIcon } from "lucide-react";
import { TaxPlanner } from "@/components/tax/TaxPlanner";
import { TaxMetrics } from "@/components/tax/dashboard/TaxMetrics";

const TaxWebApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("calculator");

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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

        <TaxMetrics onNavigate={setActiveTab} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="planning">
              <LightbulbIcon className="h-4 w-4 mr-1" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="filings">Filings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <div className="pt-4">
            <TabsContent value="calculator">
              <TaxCalculator />
            </TabsContent>
            <TabsContent value="planning">
              <TaxPlanner />
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
                  <PaymentHistory />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <DocumentManager />
            </TabsContent>
            <TabsContent value="templates">
              <TemplatesAndGuides />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;
