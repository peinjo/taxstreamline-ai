import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Globe } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const GlobalReporting = () => {
  const upcomingDeadlines = [
    { country: "United States", date: "April 15, 2024" },
    { country: "United Kingdom", date: "March 31, 2024" },
    { country: "Germany", date: "May 31, 2024" },
    { country: "France", date: "April 30, 2024" },
    { country: "Japan", date: "March 15, 2024" },
  ];

  const recentReports = [
    {
      title: "Q4 2023 Financial Statement",
      submitted: "March 1, 2024",
    },
    {
      title: "Annual Tax Return 2023",
      submitted: "February 28, 2024",
    },
    {
      title: "Transfer Pricing Documentation",
      submitted: "February 15, 2024",
    },
    {
      title: "VAT Return Q4",
      submitted: "January 31, 2024",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Global Statutory Reporting</h1>
          <Button>
            <span className="mr-2">Upload Report</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Upcoming Deadlines</h2>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{deadline.country}</p>
                        <p className="text-sm text-gray-500">
                          Due: {deadline.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start Report
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Recent Reports</h2>
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {report.submitted}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GlobalReporting;