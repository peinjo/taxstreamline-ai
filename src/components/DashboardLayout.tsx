import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useDeadlineChecker } from "@/hooks/useDeadlineChecker";
import { QuickActionsFAB } from "@/components/common/QuickActionsFAB";
import { CommandPalette } from "@/components/common/CommandPalette";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useDeadlineChecker();
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="flex items-center border-b bg-card p-4 shadow-sm">
          <img
            src="/lovable-uploads/8f4d9e33-a30b-4278-98bf-b226eb32a5f6.png"
            alt="TaxEase Logo"
            className="h-8 w-8"
          />
          <span className="ml-2 text-xl font-semibold">TaxEase</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘K</kbd> for quick actions
          </span>
        </div>
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
      
      {/* Global Components */}
      <QuickActionsFAB />
      <CommandPalette />
    </div>
  );
};

export default DashboardLayout;
