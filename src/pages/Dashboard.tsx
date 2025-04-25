
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, AlertOctagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeamWorkspace } from "@/components/teams/TeamWorkspace";
import { TaskManagement } from "@/components/tasks/TaskManagement";
import { useDashboardMetrics, useRecentActivities, useUpcomingDeadlines } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();

  console.log("Dashboard rendering, auth state:", { 
    userExists: !!user, 
    userId: user?.id, 
    authLoading,
    userRole
  });

  // Fetch metrics from the database
  const { 
    data: metrics, 
    isLoading: isMetricsLoading, 
    error: metricsError 
  } = useDashboardMetrics();
  
  // Fetch activities
  const { 
    data: activities, 
    isLoading: isActivitiesLoading 
  } = useRecentActivities();
  
  // Fetch upcoming deadlines
  const { 
    data: deadlines, 
    isLoading: isDeadlinesLoading 
  } = useUpcomingDeadlines();

  // Don't attempt to fetch profile data until we have a user
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      console.log("Fetching user profile for:", user?.id);
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("user_id", user?.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          throw error;
        }
        
        console.log("Profile data received:", data);
        return data || { full_name: "User" }; // Fallback if no profile found
      } catch (err) {
        console.error("Profile fetch exception:", err);
        return { full_name: "User" }; // Fallback on error
      }
    },
    enabled: !!user?.id,
    retry: 1,
    retryDelay: 1000,
  });

  // Show error notification if metrics failed to load
  React.useEffect(() => {
    if (metricsError) {
      toast.error("Failed to load dashboard metrics");
    }
  }, [metricsError]);

  if (profileError) {
    console.error("Profile query error:", profileError);
  }

  // Use this approach for fewer loading states - continue rendering with default values
  const firstName = profile?.full_name?.split(" ")[0] || "User";

  const metricItems = [
    {
      title: "Upcoming Deadlines",
      value: isMetricsLoading ? "..." : metrics?.upcoming_deadlines || "0",
      icon: Calendar,
      className: "bg-blue-500",
    },
    {
      title: "Active Clients",
      value: isMetricsLoading ? "..." : metrics?.active_clients || "0",
      icon: Users,
      className: "bg-green-500",
    },
    {
      title: "Documents Pending",
      value: isMetricsLoading ? "..." : metrics?.documents_pending || "0",
      icon: FileText,
      className: "bg-yellow-500",
    },
    {
      title: "Compliance Alerts",
      value: isMetricsLoading ? "..." : metrics?.compliance_alerts || "0",
      icon: AlertOctagon,
      className: "bg-red-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {firstName}
            {userRole === "admin" && (
              <span className="ml-2 text-sm text-muted-foreground">(Admin)</span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your clients today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricItems.map((metric) => (
            <Card key={metric.title}>
              <CardContent className="flex items-center p-6">
                <div
                  className={`mr-4 rounded-full p-2 text-white ${metric.className}`}
                >
                  <metric.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  {isMetricsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h2 className="text-3xl font-bold">{metric.value}</h2>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <TaskManagement />
          <TeamWorkspace />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
