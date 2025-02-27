
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, AlertOctagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TeamWorkspace } from "@/components/teams/TeamWorkspace";
import { TaskManagement } from "@/components/tasks/TaskManagement";

const Dashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();

  // Don't attempt to fetch profile data until we have a user
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      console.log("Fetching user profile for:", user?.id);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", user?.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Show a loading indicator while auth and profile are loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If profile data is loading after auth is ready, show a skeleton UI
  const firstName = profile?.full_name?.split(" ")[0] || "User";

  const metrics = [
    {
      title: "Upcoming Deadlines",
      value: "5",
      icon: Calendar,
      className: "bg-blue-500",
    },
    {
      title: "Active Clients",
      value: "24",
      icon: Users,
      className: "bg-green-500",
    },
    {
      title: "Documents Pending",
      value: "12",
      icon: FileText,
      className: "bg-yellow-500",
    },
    {
      title: "Compliance Alerts",
      value: "3",
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
          {metrics.map((metric) => (
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
                  <h2 className="text-3xl font-bold">{metric.value}</h2>
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
