import React, { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TaxCalculator from "@/components/tax/TaxCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxGuidesList } from "@/components/guides/TaxGuidesList";
import { TemplatesList } from "@/components/templates/TemplatesList";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 rounded-md bg-destructive/10 text-destructive">
    <h2 className="font-semibold mb-2">Something went wrong:</h2>
    <p className="mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      Try again
    </button>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const TaxWebApp = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-12">
        <div>
          <h1 className="text-2xl font-semibold">Tax Web Application</h1>
          <p className="text-muted-foreground">
            Calculate different types of taxes based on your income
          </p>
        </div>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingSpinner />}>
            <TaxCalculator />
          </Suspense>
        </ErrorBoundary>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tax Templates & Guides</h2>
          <p className="text-muted-foreground">
            Access and download tax templates and guides
          </p>

          <Tabs defaultValue="templates" className="w-full">
            <TabsList>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<LoadingSpinner />}>
                <TabsContent value="templates" className="mt-6">
                  <TemplatesList />
                </TabsContent>
                <TabsContent value="guides" className="mt-6">
                  <TaxGuidesList />
                </TabsContent>
              </Suspense>
            </ErrorBoundary>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaxWebApp;