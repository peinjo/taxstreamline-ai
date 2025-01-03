import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface Report {
  title: string;
  submitted: string;
}

interface RecentReportsProps {
  reports: Report[];
}

export const RecentReports = ({ reports }: RecentReportsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Reports</h2>
        <div className="space-y-4">
          {reports.map((report, index) => (
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
  );
};