import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TeamWorkspace } from "@/components/teams/TeamWorkspace";
import { TaskManagement } from "@/components/tasks/TaskManagement";
import { OrganizationActivity } from "@/components/organization/OrganizationActivity";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";

interface Organization {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
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

  const { data: organizationMember } = useQuery({
    queryKey: ['organization-member', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: organization } = useQuery({
    queryKey: ['organization', organizationMember?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationMember?.organization_id)
        .single();
      
      if (error) throw error;
      return data as Organization;
    },
    enabled: !!organizationMember?.organization_id,
  });

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

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to TaxStreamline AI</h2>
          <p className="text-muted-foreground mb-6">
            To get started, create your organization
          </p>
          <CreateOrganizationDialog />
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

        <DashboardMetrics metrics={metrics || {
          upcoming_deadlines: 0,
          active_clients: 0,
          documents_pending: 0,
          compliance_alerts: 0
        }} />

        <div className="grid gap-8 md:grid-cols-2">
          <TaskManagement />
          {organization && <OrganizationActivity organizationId={organization.id} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;