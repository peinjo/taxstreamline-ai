
import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useDeadlineChecker } from "@/hooks/useDeadlineChecker";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useDeadlineChecker();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  console.log("DashboardLayout rendering, auth state:", { 
    userExists: !!user, 
    userId: user?.id, 
    loading 
  });
  
  // Check for authentication and redirect if needed
  useEffect(() => {
    if (!loading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/auth/login");
    }
  }, [user, loading, navigate]);

  // Render content even during loading to prevent UI flashes,
  // but show a loading indicator in place of the actual content
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="flex items-center border-b bg-white p-4 shadow-sm">
          <img
            src="/lovable-uploads/8f4d9e33-a30b-4278-98bf-b226eb32a5f6.png"
            alt="TaxPal Logo"
            className="h-8 w-8"
          />
          <span className="ml-2 text-xl font-semibold">TaxPal</span>
        </div>
        <div className="container mx-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
                <p>Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
