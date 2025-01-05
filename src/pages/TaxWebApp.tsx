import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TaxCalculator from "@/components/tax/TaxCalculator";
import { TemplatesAndGuides } from "@/components/tax/TemplatesAndGuides";
import { DocumentManager } from "@/components/tax/DocumentManager";
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
            Calculate different types of taxes based on your income
          </p>
        </div>

        <TaxCalculator />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <DocumentManager />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Templates and Guides</h2>
          <TemplatesAndGuides />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;