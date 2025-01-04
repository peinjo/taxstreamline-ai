import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LucideIcon } from "lucide-react";

interface MenuItem {
  icon: LucideIcon;
  text: string;
  path: string;
}

interface SidebarFooterProps {
  bottomMenuItems: MenuItem[];
  onLogout: () => void;
}

const SidebarFooter = ({ bottomMenuItems, onLogout }: SidebarFooterProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="mt-auto px-4 pb-4">
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
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-sidebar-hover"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarFooter;