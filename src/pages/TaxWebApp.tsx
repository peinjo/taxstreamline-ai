import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TaxCalculator from "@/components/tax/TaxCalculator";
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
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Calculate different types of taxes based on your income
          </p>
        </div>

        <TaxCalculator />
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;