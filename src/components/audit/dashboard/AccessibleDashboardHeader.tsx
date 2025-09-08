import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useAccessibility, useLoadingAnnouncement } from "@/hooks/useAccessibility";

interface AccessibleDashboardHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onExport: (format: "pdf" | "excel") => void;
}

export const AccessibleDashboardHeader: React.FC<AccessibleDashboardHeaderProps> = ({
  isRefreshing,
  onRefresh,
  onExport
}) => {
  const { announce, getAriaProps } = useAccessibility({ announceChanges: true });
  const { announce: announceLoading } = useLoadingAnnouncement();

  React.useEffect(() => {
    announceLoading(isRefreshing, "Refreshing dashboard data", "Dashboard data refreshed");
  }, [isRefreshing, announceLoading]);

  const handleRefresh = () => {
    announce("Refreshing dashboard data");
    onRefresh();
  };

  const handleExport = (format: "pdf" | "excel") => {
    announce(`Exporting data as ${format.toUpperCase()}`);
    onExport(format);
  };

  return (
    <header 
      className="flex justify-between items-center"
      {...getAriaProps("Dashboard header with refresh and export options")}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tax Audit Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and analyze your tax compliance and audit metrics
        </p>
      </div>

      <div className="flex gap-3" role="group" aria-label="Dashboard actions">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label={isRefreshing ? "Refreshing data" : "Refresh dashboard data"}
          aria-describedby="refresh-status"
        >
          <RefreshCw 
            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        
        <div className="sr-only" id="refresh-status" aria-live="polite">
          {isRefreshing ? "Data is being refreshed" : "Data is up to date"}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("excel")}
          aria-label="Export dashboard data as Excel file"
        >
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          Export
        </Button>
      </div>
    </header>
  );
};