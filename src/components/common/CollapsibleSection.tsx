import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        type="button"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="font-semibold text-left">{title}</h3>
          {badge !== undefined && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
};
