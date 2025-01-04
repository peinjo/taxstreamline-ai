import { ReactNode } from "react";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import PersonalInfoForm from "@/components/auth/PersonalInfoForm";
import Dashboard from "@/pages/Dashboard";
import TransferPricing from "@/pages/TransferPricing";
import GlobalReporting from "@/pages/GlobalReporting";
import Calendar from "@/pages/Calendar";
import ComplianceTracker from "@/pages/Compliance";
import AIAssistant from "@/pages/AIAssistant";
import Notifications from "@/pages/Notifications";
import TaxWebApp from "@/pages/TaxWebApp";
import AuditReporting from "@/pages/AuditReporting";

interface RouteConfig {
  path: string;
  element: ReactNode;
  isProtected: boolean;
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: "/",
    element: <Index />,
    isProtected: false,
  },
  {
    path: "/auth/login",
    element: <Login />,
    isProtected: false,
  },
  {
    path: "/auth/signup",
    element: <Signup />,
    isProtected: false,
  },
  
  // Protected routes
  {
    path: "/dashboard",
    element: <Dashboard />,
    isProtected: true,
  },
  {
    path: "/auth/personal-info",
    element: <PersonalInfoForm />,
    isProtected: true,
  },
  {
    path: "/tax-web-app",
    element: <TaxWebApp />,
    isProtected: true,
  },
  {
    path: "/audit-reporting",
    element: <AuditReporting />,
    isProtected: true,
  },
  {
    path: "/transfer-pricing",
    element: <TransferPricing />,
    isProtected: true,
  },
  {
    path: "/global-reporting",
    element: <GlobalReporting />,
    isProtected: true,
  },
  {
    path: "/calendar",
    element: <Calendar />,
    isProtected: true,
  },
  {
    path: "/compliance",
    element: <ComplianceTracker />,
    isProtected: true,
  },
  {
    path: "/ai-assistant",
    element: <AIAssistant />,
    isProtected: true,
  },
  {
    path: "/notifications",
    element: <Notifications />,
    isProtected: true,
  },
];