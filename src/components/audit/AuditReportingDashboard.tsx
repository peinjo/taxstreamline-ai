import React, { useState } from "react";
import { ReportFilters } from "./ReportFilters";
import { TaxSummaryTable } from "./TaxSummaryTable";
import { ActivityLog } from "./ActivityLog";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Organization {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
}

interface OrganizationMember {
  organizations: Organization;
}

export const AuditReportingDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    dateRange: "all",
    taxType: "all",
    status: "all",
  });

  const { data: memberData } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          organizations (
            id,
            name,
            created_at,
            created_by
          )
        `)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as OrganizationMember;
    },
    enabled: !!user,
  });

  const organization = memberData?.organizations;

  const { data: reports, isLoading } = useQuery({
    queryKey: ["tax-reports", filters, organization?.id],
    queryFn: async () => {
      let query = supabase
        .from("tax_reports")
        .select("*")
        .eq("organization_id", organization?.id);

      if (filters.dateRange !== "all") {
        // Add date range filter logic
      }

      if (filters.taxType !== "all") {
        query = query.eq("tax_type", filters.taxType);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  if (!organization) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-2">No Organization Found</h2>
        <p className="text-muted-foreground">
          Please join or create an organization to access the audit reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Audit Reports for {organization.name}
        </h1>
        <p className="text-muted-foreground">
          View and analyze your organization's tax reports
        </p>
      </div>

      <ReportFilters filters={filters} onFilterChange={setFilters} />
      
      <AnalyticsCharts data={reports || []} />
      
      <TaxSummaryTable data={reports || []} isLoading={isLoading} />
      
      {organization && <ActivityLog organizationId={organization.id} />}
    </div>
  );
};