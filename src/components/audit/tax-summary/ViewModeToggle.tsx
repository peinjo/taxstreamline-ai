
import React from "react";
import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  viewMode: "table" | "card";
  setViewMode: (mode: "table" | "card") => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  viewMode, 
  setViewMode 
}) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
    >
      {viewMode === "table" ? "Card View" : "Table View"}
    </Button>
  );
};
