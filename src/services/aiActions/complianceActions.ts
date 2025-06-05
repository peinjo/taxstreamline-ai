
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const complianceActions: AIAction[] = [
  {
    name: "create_compliance_item",
    description: "Create a new compliance item",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Compliance item title" },
        country: { type: "string", description: "Country for compliance" },
        requirement_type: { type: "string", description: "Type of requirement" },
        frequency: { 
          type: "string", 
          enum: ["daily", "weekly", "monthly", "quarterly", "annual"],
          description: "Frequency of compliance" 
        },
        priority: { 
          type: "string", 
          enum: ["low", "medium", "high", "urgent"],
          description: "Priority level" 
        },
        description: { type: "string", description: "Description (optional)" },
        next_due_date: { type: "string", description: "Next due date in ISO format (optional)" }
      },
      required: ["title", "country", "requirement_type", "frequency", "priority"]
    },
    handler: async (params, context) => {
      const { data, error } = await supabase
        .from("compliance_items")
        .insert([{
          ...params,
          user_id: context.user?.id,
          status: "pending"
        }])
        .select()
        .single();

      if (error) throw error;

      context.queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success(`Compliance item "${params.title}" created successfully`);

      return {
        success: true,
        message: `Compliance item "${params.title}" has been created for ${params.country}.`,
        data
      };
    }
  },
  {
    name: "update_compliance_status",
    description: "Update the status of a compliance item",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Compliance item ID" },
        status: { 
          type: "string", 
          enum: ["pending", "compliant", "attention", "overdue"],
          description: "New status" 
        }
      },
      required: ["id", "status"]
    },
    handler: async (params, context) => {
      const updateData: any = {
        status: params.status,
        updated_at: new Date().toISOString()
      };

      if (params.status === 'compliant') {
        updateData.last_completed_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("compliance_items")
        .update(updateData)
        .eq("id", params.id)
        .eq("user_id", context.user?.id)
        .select()
        .single();

      if (error) throw error;

      context.queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success("Compliance status updated successfully");

      return {
        success: true,
        message: `Compliance item status updated to "${params.status}".`,
        data
      };
    }
  },
  {
    name: "get_compliance_summary",
    description: "Get a summary of compliance items",
    parameters: {
      type: "object",
      properties: {
        status: { 
          type: "string", 
          enum: ["all", "pending", "compliant", "attention", "overdue"],
          description: "Filter by status (optional)" 
        },
        country: { type: "string", description: "Filter by country (optional)" }
      }
    },
    handler: async (params, context) => {
      let query = supabase
        .from("compliance_items")
        .select("*")
        .eq("user_id", context.user?.id);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }

      if (params.country) {
        query = query.eq("country", params.country);
      }

      const { data, error } = await query;

      if (error) throw error;

      const summary = {
        total: data.length,
        by_status: data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}),
        by_country: data.reduce((acc, item) => {
          acc[item.country] = (acc[item.country] || 0) + 1;
          return acc;
        }, {})
      };

      return {
        success: true,
        message: `Found ${data.length} compliance items. Summary: ${JSON.stringify(summary, null, 2)}`,
        data: { items: data, summary }
      };
    }
  }
];
