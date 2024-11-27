import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import TransferPricing from "./pages/TransferPricing";
import GlobalReporting from "./pages/GlobalReporting";
import Calendar from "./pages/Calendar";
import ComplianceTracker from "./pages/Compliance";
import AIAssistant from "./pages/AIAssistant";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return <>{children}</>;
};

// Public Route component - redirects to dashboard if user is authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <Index />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/signup"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <TransferPricing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transfer-pricing"
                  element={
                    <ProtectedRoute>
                      <TransferPricing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/global-reporting"
                  element={
                    <ProtectedRoute>
                      <GlobalReporting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/compliance"
                  element={
                    <ProtectedRoute>
                      <ComplianceTracker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <ProtectedRoute>
                      <AIAssistant />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <TransferPricing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <TransferPricing />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;