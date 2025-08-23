
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AuditTable } from "@/components/audit/AuditTable";
import { ReportFilters } from "@/components/audit/ReportFilters";
import { logError } from "@/lib/errorHandler";

export const AuditLogsTab = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    taxType: "all",
    status: "all",
  });

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(`Error loading audit activities: ${error.message}`);
        throw error;
      }
      return data || [];
    },
  });

  const handleRefreshActivities = async () => {
    try {
      await refetch();
      toast.success("Audit logs refreshed");
    } catch (error) {
      logError(error as Error, "AuditLogsTab.refreshLogs");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ReportFilters filters={filters} onFilterChange={setFilters} />
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleRefreshActivities}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Logs
        </Button>
      </div>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Activity Logs</h3>
        {activities && <AuditTable activities={activities} />}
      </Card>
    </div>
  );
};
