import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Globe,
  Calendar,
  ShieldCheck,
  Bot,
  Bell,
  LogOut,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, text: "Dashboard", path: "/" },
    { icon: UserRound, text: "Personal Info", path: "/auth/personal-info" },
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
      navigate("/"); // Changed from "/auth/login" to "/"
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar p-4 text-white">
      <div className="mb-8 flex items-center gap-2 px-2">
        <img src="/lovable-uploads/14b7660e-0879-41c1-a1d8-b3327eeae3e4.png" alt="Logo" className="h-8 w-8" />
        <span className="text-xl font-bold">Phester Consult</span>
      </div>

      <nav className="flex h-[calc(100%-6rem)] flex-col justify-between">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.text}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-sidebar-hover"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.text}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          {bottomMenuItems.map((item) => (
            <Link
              key={item.text}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-sidebar-hover"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.text}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-sidebar-hover"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;