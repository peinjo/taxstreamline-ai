import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  icon: LucideIcon;
  text: string;
  path: string;
}

interface SidebarNavigationProps {
  menuItems: MenuItem[];
}

const SidebarNavigation = ({ menuItems }: SidebarNavigationProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="custom-scrollbar overflow-y-auto px-4">
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
    </div>
  );
};

export default SidebarNavigation;