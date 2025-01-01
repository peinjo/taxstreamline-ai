import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const TaxWebApp = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Manage your tax calculations and submissions
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p>Tax Web Application content will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;