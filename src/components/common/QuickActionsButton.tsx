import React, { useState } from "react";
import { Plus, Calculator, Calendar, FileText, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export const QuickActionsButton: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: Calculator,
      label: "New Tax Calculation",
      action: () => {
        navigate("/tax");
        setOpen(false);
      },
    },
    {
      icon: Calendar,
      label: "Add Calendar Event",
      action: () => {
        navigate("/calendar");
        setOpen(false);
      },
    },
    {
      icon: CheckSquare,
      label: "Create Compliance Item",
      action: () => {
        navigate("/compliance");
        setOpen(false);
      },
    },
    {
      icon: FileText,
      label: "New Transfer Pricing Doc",
      action: () => {
        navigate("/transfer-pricing");
        setOpen(false);
      },
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card z-50">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.action}
            className="cursor-pointer"
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
