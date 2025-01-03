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
  Calculator,
  BookOpen,
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
    { icon: Calculator, text: "Tax Web App", path: "/tax-web-app" },
    { icon: FileText, text: "Transfer Pricing", path: "/transfer-pricing" },
    { icon: Globe, text: "Global Reporting", path: "/global-reporting" },
    { icon: Calendar, text: "Calendar", path: "/calendar" },
    { icon: ShieldCheck, text: "Compliance", path: "/compliance" },
    { icon: BookOpen, text: "Templates & Guides", path: "/tax-templates-and-guides" },
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar p-4 text-white">
      <div className="mb-8 flex items-center gap-2 px-2">
        <img
          src="/lovable-uploads/235a3f0b-697d-47c6-8c81-c2b3066c1717.png"
          alt="Phester Consult Logo"
          className="h-8 w-8"
        />
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