import { useNavigate } from "react-router-dom";
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
  Upload,
  Activity,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { FeatureAnnouncement, useFeatureAnnouncement } from "@/components/common/FeatureAnnouncement";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import SidebarFooter from "./sidebar/SidebarFooter";

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isFeatureUnlocked, getUnlockProgress } = useFeatureUnlock();
  const { currentFeature, dismissAnnouncement } = useFeatureAnnouncement();

  const menuItems = [
    { icon: LayoutDashboard, text: "Dashboard", path: "/dashboard" },
    { icon: Calculator, text: "Tax Web App", path: "/tax-web-app" },
    { icon: ChartBar, text: "Audit & Reporting", path: "/audit-reporting" },
    { 
      icon: FileText, 
      text: "Transfer Pricing", 
      path: "/transfer-pricing",
      featureKey: 'transfer_pricing' as const,
      locked: !isFeatureUnlocked('transfer_pricing'),
      progress: getUnlockProgress('transfer_pricing'),
    },
    { icon: Globe, text: "Global Reporting", path: "/global-reporting" },
    { icon: Calendar, text: "Calendar", path: "/calendar" },
    { icon: ShieldCheck, text: "Compliance", path: "/compliance" },
    { 
      icon: Upload, 
      text: "Bulk Operations", 
      path: "/bulk-operations",
      featureKey: 'bulk_operations' as const,
      locked: !isFeatureUnlocked('bulk_operations'),
      progress: getUnlockProgress('bulk_operations'),
    },
    { icon: Bot, text: "AI Assistant", path: "/ai-assistant" },
    { icon: Activity, text: "System Logs", path: "/logs" },
  ];

  const bottomMenuItems = [
    { icon: Bell, text: "Notifications", path: "/notifications" },
    { icon: Settings, text: "Settings", path: "/settings" },
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
    <>
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
      
      {currentFeature && (
        <FeatureAnnouncement 
          featureKey={currentFeature} 
          onDismiss={dismissAnnouncement} 
        />
      )}
    </>
  );
};

export default Sidebar;
