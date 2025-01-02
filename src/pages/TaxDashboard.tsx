import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { DocumentUpload } from "@/components/tax/DocumentUpload";
import { DocumentList } from "@/components/tax/DocumentList";

const TaxDashboard = () => {
  const { data: recentCalculations, isLoading } = useQuery({
    queryKey: ["recentCalculations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        toast.error("Failed to fetch recent calculations");
        throw error;
      }

      return data;
    },
  });

  const taxTypes = [
    { name: "Corporate Income Tax", path: "/tax-web-app?type=cit", icon: Calculator },
    { name: "VAT", path: "/tax-web-app?type=vat", icon: Calculator },
    { name: "PAYE", path: "/tax-web-app?type=paye", icon: Calculator },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Tax Dashboard</h1>

      {/* Tax Calculator Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {taxTypes.map((tax) => (
          <Link key={tax.name} to={tax.path}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <tax.icon className="h-6 w-6 text-primary" />
                  <span className="font-medium">{tax.name}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Document Management Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tax Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DocumentUpload onUploadSuccess={() => {
            const documentList = document.querySelector('[data-testid="document-list"]');
            if (documentList instanceof HTMLElement) {
              documentList.click();
            }
          }} />
          <DocumentList />
        </CardContent>
      </Card>

      {/* Recent Calculations History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading recent calculations...</p>
          ) : recentCalculations?.length ? (
            <div className="space-y-4">
              {recentCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{calc.tax_type}</p>
                    <p className="text-sm text-gray-500">
                      Income: ${calc.income.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    ${calc.tax_amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent calculations</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxDashboard;