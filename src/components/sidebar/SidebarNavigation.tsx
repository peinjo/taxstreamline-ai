import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { LockedFeatureBadge } from "@/components/common/LockedFeatureBadge";
import type { FeatureKey } from "@/hooks/useFeatureUnlock";

interface MenuItem {
  icon: LucideIcon;
  text: string;
  path: string;
  featureKey?: FeatureKey;
  locked?: boolean;
  progress?: number;
}

interface SidebarNavigationProps {
  menuItems: MenuItem[];
}

const SidebarNavigation = ({ menuItems }: SidebarNavigationProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="px-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const content = (
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-sidebar-hover"
              } ${item.locked ? 'opacity-60' : ''}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.text}</span>
              {item.locked && item.featureKey && (
                <LockedFeatureBadge 
                  featureKey={item.featureKey} 
                  progress={item.progress || 0}
                  variant="compact"
                />
              )}
            </div>
          );

          if (item.locked) {
            return (
              <div key={item.text} className="cursor-not-allowed">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.text} to={item.path}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarNavigation;
