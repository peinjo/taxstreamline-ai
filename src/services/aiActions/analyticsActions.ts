
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";

export const analyticsActions: AIAction[] = [
  {
    name: "get_dashboard_metrics",
    description: "Get dashboard metrics and statistics",
    parameters: {
      type: "object",
      properties: {}
    },
    handler: async (params, context) => {
      const [
        { data: upcomingEvents },
        { data: complianceItems },
        { data: taxDocuments }
      ] = await Promise.all([
        supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", context.user?.id)
          .gte("date", new Date().toISOString())
          .limit(5),
        supabase
          .from("compliance_items")
          .select("*")
          .eq("user_id", context.user?.id),
        supabase
          .from("tax_documents")
          .select("*")
          .eq("user_id", context.user?.id)
      ]);

      const metrics = {
        upcoming_events: upcomingEvents?.length || 0,
        total_compliance_items: complianceItems?.length || 0,
        overdue_compliance: complianceItems?.filter(item => item.status === 'overdue').length || 0,
        total_documents: taxDocuments?.length || 0
      };

      return {
        success: true,
        message: `Dashboard metrics: ${metrics.upcoming_events} upcoming events, ${metrics.total_compliance_items} compliance items (${metrics.overdue_compliance} overdue), ${metrics.total_documents} documents.`,
        data: metrics
      };
    }
  }
];
