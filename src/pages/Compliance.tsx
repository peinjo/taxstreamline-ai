import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const ComplianceTracker = () => {
  const complianceData = [
    {
      country: "United States",
      status: "Compliant",
      lastUpdate: "2024-03-15",
      nextReview: "2024-06-15",
    },
    {
      country: "United Kingdom",
      status: "Pending",
      lastUpdate: "2024-02-28",
      nextReview: "2024-03-31",
    },
    {
      country: "Germany",
      status: "Attention",
      lastUpdate: "2024-03-01",
      nextReview: "2024-03-30",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Attention":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Compliance Tracker</h1>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Run Compliance Check
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>Compliant</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-green-700">15</p>
          </div>

          <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              <span>Pending Review</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-yellow-700">8</p>
          </div>

          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Needs Attention</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-red-700">3</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Compliance Status by Country</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>COUNTRY</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>LAST UPDATE</TableHead>
                <TableHead>NEXT REVIEW</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.map((row) => (
                <TableRow key={row.country}>
                  <TableCell>{row.country}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(row.status)}
                      {row.status}
                    </div>
                  </TableCell>
                  <TableCell>{row.lastUpdate}</TableCell>
                  <TableCell>{row.nextReview}</TableCell>
                  <TableCell>
                    <Button variant="link" className="text-blue-500">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplianceTracker;