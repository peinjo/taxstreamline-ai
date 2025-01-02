import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RecentCalculations } from "./RecentCalculations";
import { useToast } from "@/hooks/use-toast";

export const TaxDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const taxTypes = [
    { id: "cit", name: "Corporate Income Tax", description: "Calculate your company's tax obligations" },
    { id: "vat", name: "Value Added Tax", description: "Calculate VAT for goods and services" },
    { id: "paye", name: "PAYE", description: "Calculate Pay As You Earn tax" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {taxTypes.map((tax) => (
          <Card key={tax.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                {tax.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{tax.description}</p>
              <Button 
                onClick={() => navigate(`/tax-web-app/calculator/${tax.id}`)}
                className="w-full"
              >
                Calculate Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Calculations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCalculations />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Tax Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload and manage your tax-related documents securely.
            </p>
            <Button 
              onClick={() => navigate("/tax-web-app/documents")}
              variant="outline"
              className="w-full"
            >
              Manage Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};