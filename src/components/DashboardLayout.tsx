import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="flex items-center border-b bg-white p-4 shadow-sm">
          <img
            src="/lovable-uploads/235a3f0b-697d-47c6-8c81-c2b3066c1717.png"
            alt="Phester Consult Logo"
            className="h-8 w-8"
          />
          <span className="ml-2 text-xl font-semibold">Phester Consult</span>
        </div>
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;