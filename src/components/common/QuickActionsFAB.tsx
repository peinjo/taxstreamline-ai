import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  X, 
  Calculator, 
  Calendar, 
  FileText, 
  CheckSquare,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    icon: Calculator,
    label: "Tax Calculation",
    path: "/tax",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    icon: Calendar,
    label: "Calendar Event",
    path: "/calendar",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    icon: CheckSquare,
    label: "Compliance Item",
    path: "/compliance",
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    icon: FileText,
    label: "Transfer Pricing",
    path: "/transfer-pricing",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    icon: Upload,
    label: "Upload Document",
    path: "/tax?tab=documents",
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Action Buttons */}
            <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3">
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 20, 
                    scale: 0.8,
                    transition: { delay: (actions.length - index) * 0.03 }
                  }}
                  className="flex items-center gap-3 justify-end"
                >
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 + 0.1 } }}
                    className="px-3 py-1.5 rounded-lg bg-popover text-popover-foreground text-sm font-medium shadow-lg whitespace-nowrap"
                  >
                    {action.label}
                  </motion.span>
                  <Button
                    size="lg"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg text-white",
                      action.color
                    )}
                    onClick={() => handleActionClick(action.path)}
                  >
                    <action.icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all",
            isOpen 
              ? "bg-destructive hover:bg-destructive/90" 
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}
