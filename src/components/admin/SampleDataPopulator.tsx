import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logging/logger";

export const SampleDataPopulator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const populateSampleData = async () => {
    if (!user) {
      toast.error("You must be logged in to create sample data");
      return;
    }

    setIsLoading(true);
    try {
      // Check if data already exists
      const { data: existingReports } = await supabase
        .from("tax_reports")
        .select("id")
        .limit(1);

      if (existingReports && existingReports.length > 0) {
        toast.error("Sample data already exists. Clear existing data first.");
        setIsLoading(false);
        return;
      }

      // Create sample tax reports
      const sampleReports = [
        { tax_type: "Income Tax", tax_year: 2024, amount: 125000, status: "Paid", country: "Nigeria", user_id: user.id },
        { tax_type: "VAT", tax_year: 2024, amount: 45000, status: "Pending", country: "Nigeria", user_id: user.id },
        { tax_type: "Corporate Tax", tax_year: 2024, amount: 250000, status: "Paid", country: "Nigeria", user_id: user.id },
        { tax_type: "WHT", tax_year: 2023, amount: 32000, status: "Paid", country: "Nigeria", user_id: user.id },
        { tax_type: "Income Tax", tax_year: 2023, amount: 115000, status: "Paid", country: "Nigeria", user_id: user.id },
      ];

      const { error: reportsError } = await supabase
        .from("tax_reports")
        .insert(sampleReports);

      if (reportsError) throw reportsError;

      // Create sample dashboard metrics
      const { error: metricsError } = await supabase
        .from("dashboard_metrics")
        .insert({
          upcoming_deadlines: 8,
          active_clients: 24,
          documents_pending: 12,
          compliance_alerts: 3,
          user_id: user.id
        });

      if (metricsError) throw metricsError;

      // Create sample activities
      const sampleActivities = [
        { action: "Filed", document_title: "Q4 2024 VAT Return", document_type: "Tax Return", user_id: user.id },
        { action: "Submitted", document_title: "2024 Annual Tax Filing", document_type: "Annual Report", user_id: user.id },
        { action: "Updated", document_title: "Employee PAYE Records", document_type: "Payroll", user_id: user.id },
        { action: "Created", document_title: "Transfer Pricing Documentation", document_type: "TP Document", user_id: user.id },
      ];

      const { error: activitiesError } = await supabase
        .from("activities")
        .insert(sampleActivities);

      if (activitiesError) throw activitiesError;

      // Create sample deadlines
      const today = new Date();
      const sampleDeadlines = [
        { text: "Q1 2025 VAT Filing", date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], user_id: user.id },
        { text: "2024 Annual Return Submission", date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], user_id: user.id },
        { text: "WHT Monthly Remittance", date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], user_id: user.id },
        { text: "Transfer Pricing Documentation Review", date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], user_id: user.id },
      ];

      const { error: deadlinesError } = await supabase
        .from("deadlines")
        .insert(sampleDeadlines);

      if (deadlinesError) throw deadlinesError;

      toast.success("Sample data created successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      logger.error("Error creating sample data", error as Error, { component: 'SampleDataPopulator' });
      toast.error(`Failed to create sample data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sample Data Population
        </CardTitle>
        <CardDescription>
          Create realistic sample data to explore all features of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>This will create:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>5 sample tax reports (various types and years)</li>
            <li>Dashboard metrics with realistic numbers</li>
            <li>4 recent activity entries</li>
            <li>4 upcoming deadline reminders</li>
          </ul>
        </div>
        <Button 
          onClick={populateSampleData} 
          disabled={isLoading || !user}
          className="w-full"
        >
          {isLoading ? (
            <>
              <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
              Creating Sample Data...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Create Sample Data
            </>
          )}
        </Button>
        {!user && (
          <p className="text-sm text-destructive">
            Please log in to create sample data
          </p>
        )}
      </CardContent>
    </Card>
  );
};