import { lazy } from "react";

const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const PersonalInfo = lazy(() => import("@/pages/auth/PersonalInfo"));
const TaxWebApp = lazy(() => import("@/pages/TaxWebApp"));
const TransferPricing = lazy(() => import("@/pages/TransferPricing"));
const GlobalReporting = lazy(() => import("@/pages/GlobalReporting"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const TaxTemplatesAndGuides = lazy(() => import("@/pages/TaxTemplatesAndGuides"));

export const routes = [
  {
    path: "/",
    element: <Dashboard />,
    isProtected: true,
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
    path: "/auth/personal-info",
    element: <PersonalInfo />,
    isProtected: true,
  },
  {
    path: "/tax-web-app",
    element: <TaxWebApp />,
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
    element: <Compliance />,
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
    path: "/tax-templates-and-guides",
    element: <TaxTemplatesAndGuides />,
    isProtected: true,
  },
];