import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import PersonalInfoForm from "@/components/auth/PersonalInfoForm";
import { Loader2 } from "lucide-react";

const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-gray-600">Please try again later</p>
    </div>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const PersonalInfo = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <PersonalInfoForm />
      </Suspense>
    </ErrorBoundary>
  );
};

export default PersonalInfo;