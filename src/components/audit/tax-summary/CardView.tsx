
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { TaxReport } from "@/types/tax";

interface CardViewProps {
  reports: TaxReport[];
  onViewDetails: (report: TaxReport) => void;
}

export const CardView: React.FC<CardViewProps> = ({ reports, onViewDetails }) => {
  if (!reports.length) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{report.tax_type}</h3>
                <p className="text-sm text-muted-foreground">
                  Year: {report.tax_year}
                </p>
              </div>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-lg font-bold">
              ₦{report.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Last Updated: {format(new Date(report.updated_at), "dd MMM yyyy")}
            </p>
          </CardContent>
          <CardFooter className="px-4 py-3 bg-gray-50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full" 
              onClick={() => onViewDetails(report)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
