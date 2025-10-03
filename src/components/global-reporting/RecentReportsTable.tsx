
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { EmptyReportsState } from "./EmptyReportsState";

interface Report {
  id: number;
  tax_type: string;
  country?: string;
  amount: number;
  status: string;
  tax_year: number;
  created_at: string;
}

interface RecentReportsTableProps {
  reports: Report[];
  isLoading: boolean;
}

export function RecentReportsTable({ reports, isLoading }: RecentReportsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "filed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, country?: string) => {
    const currencyMap: { [key: string]: string } = {
      "United States": "USD",
      "United Kingdom": "GBP",
      "Germany": "EUR",
      "France": "EUR",
      "Japan": "JPY",
      "Canada": "CAD",
      "Australia": "AUD",
      "Nigeria": "NGN",
    };

    const currency = country ? currencyMap[country] || "USD" : "USD";
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Reports ({reports.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyReportsState />
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{report.tax_type}</h3>
                    <Badge variant="outline" className="text-xs">
                      {report.country || "Nigeria"}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Year: {report.tax_year}</span>
                    <span>Amount: {formatCurrency(report.amount, report.country)}</span>
                    <span>Submitted: {format(new Date(report.created_at), "MMM dd, yyyy")}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
