import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, AlertOctagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TeamWorkspace } from "@/components/teams/TeamWorkspace";
import { TaskManagement } from "@/components/tasks/TaskManagement";
import { OrganizationActivity } from "@/components/organization/OrganizationActivity";

interface Organization {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
}

interface OrganizationMember {
  organizations: Organization;
}

interface DashboardMetrics {
  upcoming_deadlines: number;
  active_clients: number;
  documents_pending: number;
  compliance_alerts: number;
}

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: memberData } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('organizations(*)')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as OrganizationMember;
    },
    enabled: !!user?.id,
  });

  const organization = memberData?.organizations;

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('organization_id', organization?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as DashboardMetrics || {
        upcoming_deadlines: 0,
        active_clients: 0,
        documents_pending: 0,
        compliance_alerts: 0
      };
    },
    enabled: !!organization?.id,
  });

  const firstName = profile?.full_name?.split(' ')[0] || "User";

  const metricCards = [
    {
      title: "Upcoming Deadlines",
      value: metrics?.upcoming_deadlines || "0",
      icon: Calendar,
      className: "bg-blue-500",
    },
    {
      title: "Active Clients",
      value: metrics?.active_clients || "0",
      icon: Users,
      className: "bg-green-500",
    },
    {
      title: "Documents Pending",
      value: metrics?.documents_pending || "0",
      icon: FileText,
      className: "bg-yellow-500",
    },
    {
      title: "Compliance Alerts",
      value: metrics?.compliance_alerts || "0",
      icon: AlertOctagon,
      className: "bg-red-500",
    },
  ];

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-2">No Organization Found</h2>
          <p className="text-muted-foreground">
            Please join or create an organization to access the dashboard.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">
            Here's what's happening at {organization.name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric) => (
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
          {organization && <OrganizationActivity organizationId={organization.id} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;