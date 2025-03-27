
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
      retry: 1,
    },
  },
});

// Protected Route component - simplified to prevent loops
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Only show the brief loading spinner during initial auth check
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
  
  // Redirect unauthenticated users
  if (!user) {
    console.log("Protected route: User not authenticated, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

// Public Route component - prevents authenticated users from accessing auth pages
const PublicAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Don't show loading state for auth pages, just render them
  // This prevents flash of loading screen during auth flow
  if (loading) {
    return <>{children}</>;
  }
  
  // Redirect authenticated users to dashboard
  if (user) {
    console.log("Public auth route: User is authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render the auth page
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
                    // Special case for index route
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
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </ErrorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
