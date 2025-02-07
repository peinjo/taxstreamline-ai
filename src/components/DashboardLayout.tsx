
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useDeadlineChecker } from "@/hooks/useDeadlineChecker";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useDeadlineChecker();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

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
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
