
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart,
  Bell,
  Calendar,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNavigation from "./sidebar/SidebarNavigation";

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      text: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: FileText,
      text: "Tax Documents",
      path: "/documents",
    },
    {
      icon: Calendar,
      text: "Tax Calendar",
      path: "/calendar",
    },
    {
      icon: BarChart,
      text: "Audit & Reporting",
      path: "/audit-reporting",
    },
    {
      icon: Users,
      text: "Team",
      path: "/team",
    },
    {
      icon: Bell,
      text: "Notifications",
      path: "/notifications",
    },
    {
      icon: Settings,
      text: "Settings",
      path: "/settings",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-sidebar border-r border-gray-200">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/8f4d9e33-a30b-4278-98bf-b226eb32a5f6.png"
              alt="TaxPal Logo"
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold">TaxPal</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <SidebarNavigation menuItems={menuItems} />
        </div>
        <div className="border-t p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-sidebar-hover"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
