import { ReactNode } from "react";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import SignupConfirmation from "@/pages/auth/SignupConfirmation";
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
import Settings from "@/pages/Settings";
import BulkOperations from "@/pages/BulkOperations";
import LoggingDashboard from "@/pages/LoggingDashboard";
import Pricing from "@/pages/Pricing";
import Receipts from "@/pages/Receipts";
import Invoices from "@/pages/Invoices";
import Payroll from "@/pages/Payroll";
import MFASetup from "@/pages/MFASetup";
import PredictiveAnalytics from "@/pages/PredictiveAnalytics";
import BankStatements from "@/pages/BankStatements";
import PublicInvoice from "@/pages/PublicInvoice";
import Referrals from "@/pages/Referrals";

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
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword />,
    isProtected: false,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
    isProtected: false,
  },
  {
    path: "/auth/signup-confirmation",
    element: <SignupConfirmation />,
    isProtected: false,
  },
  {
    path: "/pricing",
    element: <Pricing />,
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
  {
    path: "/settings",
    element: <Settings />,
    isProtected: true,
  },
  {
    path: "/bulk-operations",
    element: <BulkOperations />,
    isProtected: true,
  },
  {
    path: "/logs",
    element: <LoggingDashboard />,
    isProtected: true,
  },
  {
    path: "/receipts",
    element: <Receipts />,
    isProtected: true,
  },
  {
    path: "/invoices",
    element: <Invoices />,
    isProtected: true,
  },
  {
    path: "/payroll",
    element: <Payroll />,
    isProtected: true,
  },
  {
    path: "/mfa-setup",
    element: <MFASetup />,
    isProtected: true,
  },
  {
    path: "/analytics",
    element: <PredictiveAnalytics />,
    isProtected: true,
  },
  {
    path: "/bank-statements",
    element: <BankStatements />,
    isProtected: true,
  },
];