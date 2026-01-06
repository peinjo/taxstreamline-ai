import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useContentSecurityPolicy } from "./hooks/useContentSecurityPolicy";
import { routes } from "./config/routes";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { HelpProvider } from "@/contexts/HelpContext";
import { HelpButton } from "@/components/help/HelpButton";
import { HelpCenter } from "@/components/help/HelpCenter";

// Simplified Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show minimal loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Immediately redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

// Simplified Public Auth Route component
const PublicAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show minimal loading indicator for auth routes
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
      </div>
    );
  }
  
  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render the auth page
  return <>{children}</>;
};

// Inner component to use hooks within Router context
const AppContent: React.FC = () => {
  useGlobalKeyboardShortcuts();

  return (
    <Routes>
        {routes.map((route) => {
          // Handle the index route
          if (route.path === "/") {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            );
          }
          
          // Handle all other routes with appropriate protection
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.isProtected ? (
                  <ProtectedRoute>{route.element}</ProtectedRoute>
                ) : (
                  <PublicAuthRoute>{route.element}</PublicAuthRoute>
                )
              }
            />
          );
        })}
      </Routes>
  );
};

const App: React.FC = () => {
  // Apply Content Security Policy
  useContentSecurityPolicy();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ErrorProvider>
          <NotificationProvider>
            <OnboardingProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <OnboardingWizard />
                <BrowserRouter>
                  <AnalyticsProvider>
                    <HelpProvider>
                      <AppContent />
                      <HelpButton />
                      <HelpCenter />
                    </HelpProvider>
                  </AnalyticsProvider>
                </BrowserRouter>
              </TooltipProvider>
            </OnboardingProvider>
          </NotificationProvider>
        </ErrorProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
