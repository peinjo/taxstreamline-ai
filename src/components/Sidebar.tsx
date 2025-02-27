import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Globe,
  Calendar,
  ShieldCheck,
  Bot,
  Bell,
  UserRound,
  Calculator,
  ChartBar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import SidebarFooter from "./sidebar/SidebarFooter";

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, text: "Dashboard", path: "/dashboard" },
    { icon: UserRound, text: "Personal Info", path: "/auth/personal-info" },
    { icon: Calculator, text: "Tax Web App", path: "/tax-web-app" },
    { icon: ChartBar, text: "Audit & Reporting", path: "/audit-reporting" },
    { icon: FileText, text: "Transfer Pricing", path: "/transfer-pricing" },
    { icon: Globe, text: "Global Reporting", path: "/global-reporting" },
    { icon: Calendar, text: "Calendar", path: "/calendar" },
    { icon: ShieldCheck, text: "Compliance", path: "/compliance" },
    { icon: Bot, text: "AI Assistant", path: "/ai-assistant" },
  ];

  const bottomMenuItems = [
    { icon: Bell, text: "Notifications", path: "/notifications" },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-sidebar">
      <SidebarHeader />
      <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
        <SidebarNavigation menuItems={menuItems} />
        <SidebarFooter 
          bottomMenuItems={bottomMenuItems} 
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;