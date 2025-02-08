
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import { routes } from "./config/routes";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return <>{children}</>;
};

// Public Route component - redirects to dashboard if user is authenticated
const PublicAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {routes.map((route) => {
                    // Special case for index route - no auth check
                    if (route.path === "/") {
                      return (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={route.element}
                        />
                      );
                    }
                    
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
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </ErrorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
