
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isRefreshing,
  onRefresh
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Audit Dashboard</h2>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        {isRefreshing ? "Refreshing..." : "Refresh Data"}
      </Button>
    </div>
  );
};
