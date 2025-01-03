import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { UpcomingDeadlines } from "@/components/global-reporting/UpcomingDeadlines";
import { RecentReports } from "@/components/global-reporting/RecentReports";
import { Suspense, startTransition, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="rounded-md bg-destructive/10 p-4 text-destructive">
    <h2 className="mb-2 font-semibold">Something went wrong:</h2>
    <p className="mb-4">{error.message}</p>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>
);

const GlobalReporting = () => {
  const [upcomingDeadlines] = useState([
    { country: "United States", date: "April 15, 2024" },
    { country: "United Kingdom", date: "March 31, 2024" },
    { country: "Germany", date: "May 31, 2024" },
    { country: "France", date: "April 30, 2024" },
    { country: "Japan", date: "March 15, 2024" },
  ]);

  const [recentReports] = useState([
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
  ]);

  const handleUploadReport = () => {
    startTransition(() => {
      // Handle report upload
      console.log("Uploading report...");
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Global Statutory Reporting</h1>
          <Button onClick={handleUploadReport}>
            <span className="mr-2">Upload Report</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingSpinner />}>
              <UpcomingDeadlines deadlines={upcomingDeadlines} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingSpinner />}>
              <RecentReports reports={recentReports} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GlobalReporting;