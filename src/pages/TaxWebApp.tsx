import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartBar, Wallet, FileText, Calendar, LightbulbIcon } from "lucide-react";
import { TaxPlanner } from "@/components/tax/TaxPlanner";

const TaxWebApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("calculator");

  const { data: recentCalculations, isLoading: isCalcLoading } = useQuery({
    queryKey: ["recent-tax-calculations"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentPayments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["recent-payments"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentFilings, isLoading: isFilingsLoading } = useQuery({
    queryKey: ["recent-filings"],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tax_filings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  const renderDashboardMetrics = () => {
    const metrics = [
      {
        title: "Recent Calculations",
        value: recentCalculations?.length || 0,
        icon: ChartBar,
        color: "text-blue-500 bg-blue-100",
        loading: isCalcLoading,
      },
      {
        title: "Recent Payments",
        value: recentPayments?.length || 0, 
        icon: Wallet,
        color: "text-green-500 bg-green-100",
        loading: isPaymentsLoading,
      },
      {
        title: "Documents",
        value: "View", 
        icon: FileText,
        color: "text-purple-500 bg-purple-100",
        action: () => setActiveTab("documents"),
        loading: false,
      },
      {
        title: "Recent Filings",
        value: recentFilings?.length || 0,
        icon: Calendar,
        color: "text-orange-500 bg-orange-100", 
        loading: isFilingsLoading,
      },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={metric.action ? metric.action : undefined}>
            <CardContent className="p-4 flex items-center">
              <div className={`p-2 rounded-full mr-4 ${metric.color}`}>
                {<metric.icon className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                {metric.loading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold">{metric.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Manage your tax calculations, filings, and payments
          </p>
        </div>

        {renderDashboardMetrics()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;
