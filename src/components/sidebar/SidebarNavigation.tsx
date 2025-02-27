
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Globe,
  Calendar,
  ShieldCheck,
  Bot,
  Bell,
  Calculator,
  ChartBar,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const SidebarNavigation = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Calculator className="h-5 w-5" />,
      label: "Tax Web App",
      path: "/tax-web-app",
    },
    {
      icon: <ChartBar className="h-5 w-5" />,
      label: "Audit Reporting",
      path: "/audit-reporting",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Transfer Pricing",
      path: "/transfer-pricing",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Global Reporting",
      path: "/global-reporting",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Calendar",
      path: "/calendar",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: "Compliance Tracker",
      path: "/compliance",
    },
    {
      icon: <Bot className="h-5 w-5" />,
      label: "AI Assistant",
      path: "/ai-assistant",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      path: "/notifications",
    },
  ];

  return (
    <nav className="mt-6 space-y-1 px-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
            location.pathname === item.path
              ? "bg-gray-200 text-gray-900"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {item.icon}
          <span className="ml-3">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
