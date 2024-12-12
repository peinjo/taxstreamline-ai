import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, AlertOctagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const firstName = profile?.full_name?.split(' ')[0] || "User";

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

  const recentActivities = [
    "Local File updated for Client A",
    "New benchmark analysis completed",
    "Transfer pricing documentation reviewed",
    "Compliance check completed for Client B",
  ];

  const upcomingDeadlines = [
    { task: "Master File submission", date: "March 31" },
    { task: "Local File preparation", date: "April 15" },
    { task: "Quarterly compliance review", date: "April 30" },
    { task: "Annual tax filing", date: "May 15" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
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

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Calendar className="h-4 w-4 text-red-500" />
                    <span>
                      {deadline.task} - {deadline.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;