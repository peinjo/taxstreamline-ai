import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const SampleDataButton = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createSampleData = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create sample dashboard metrics
      const { error: metricsError } = await supabase
        .from("dashboard_metrics")
        .insert({
          user_id: user.id,
          upcoming_deadlines: 5,
          active_clients: 12,
          documents_pending: 8,
          compliance_alerts: 3,
        });

      if (metricsError) throw metricsError;

      // Create sample activities
      const activities = [
        {
          user_id: user.id,
          action: "created",
          document_title: "Q4 2024 Tax Return",
          document_type: "Tax Filing",
        },
        {
          user_id: user.id,
          action: "updated",
          document_title: "Transfer Pricing Report",
          document_type: "TP Documentation",
        },
        {
          user_id: user.id,
          action: "submitted",
          document_title: "VAT Return - December",
          document_type: "Tax Filing",
        },
      ];

      const { error: activitiesError } = await supabase
        .from("activities")
        .insert(activities);

      if (activitiesError) throw activitiesError;

      // Create sample deadlines
      const today = new Date();
      const deadlines = [
        {
          user_id: user.id,
          text: "Annual Tax Return Filing",
          date: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString(),
        },
        {
          user_id: user.id,
          text: "VAT Return Submission",
          date: new Date(today.getFullYear(), today.getMonth(), 28).toISOString(),
        },
        {
          user_id: user.id,
          text: "Transfer Pricing Documentation",
          date: new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString(),
        },
      ];

      const { error: deadlinesError } = await supabase
        .from("deadlines")
        .insert(deadlines);

      if (deadlinesError) throw deadlinesError;

      // Create sample tax reports
      const taxReports = [
        {
          user_id: user.id,
          tax_type: "Income Tax",
          tax_year: 2024,
          amount: 250000,
          status: "paid",
          country: "Nigeria",
        },
        {
          user_id: user.id,
          tax_type: "VAT",
          tax_year: 2024,
          amount: 87500,
          status: "pending",
          country: "Nigeria",
        },
        {
          user_id: user.id,
          tax_type: "Corporate Tax",
          tax_year: 2024,
          amount: 450000,
          status: "overdue",
          country: "Nigeria",
        },
      ];

      const { error: reportsError } = await supabase
        .from("tax_reports")
        .insert(taxReports);

      if (reportsError) throw reportsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Sample data created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create sample data: ${error.message}`);
    },
  });

  return (
    <Button
      onClick={() => createSampleData.mutate()}
      disabled={createSampleData.isPending || !user}
      variant="outline"
      className="gap-2"
    >
      {createSampleData.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Sample Data...
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          Load Sample Data
        </>
      )}
    </Button>
  );
};
