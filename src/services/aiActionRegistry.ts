
import { AIAction, AIActionContext, AIActionResult } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

class AIActionRegistry {
  private actions: Map<string, AIAction> = new Map();

  register(action: AIAction) {
    this.actions.set(action.name, action);
  }

  getAction(name: string): AIAction | undefined {
    return this.actions.get(name);
  }

  getAllActions(): AIAction[] {
    return Array.from(this.actions.values());
  }

  getFunctionDefinitions() {
    return this.getAllActions().map(action => ({
      name: action.name,
      description: action.description,
      parameters: action.parameters
    }));
  }

  async executeAction(name: string, params: any, context: AIActionContext): Promise<AIActionResult> {
    const action = this.getAction(name);
    if (!action) {
      return {
        success: false,
        message: `Unknown action: ${name}`
      };
    }

    try {
      return await action.handler(params, context);
    } catch (error) {
      console.error(`Error executing action ${name}:`, error);
      return {
        success: false,
        message: `Failed to execute ${name}: ${error.message}`
      };
    }
  }
}

export const actionRegistry = new AIActionRegistry();

// Calendar Actions
actionRegistry.register({
  name: "create_calendar_event",
  description: "Create a new calendar event",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Event title" },
      date: { type: "string", description: "Event date in ISO format" },
      time: { type: "string", description: "Event time (optional)" },
      description: { type: "string", description: "Event description (optional)" },
      company: { type: "string", description: "Associated company (optional)" },
      category: { 
        type: "string", 
        enum: ["meeting", "deadline", "appointment", "conference", "training", "review", "other"],
        description: "Event category" 
      },
      priority: { 
        type: "string", 
        enum: ["low", "medium", "high", "urgent"],
        description: "Event priority" 
      }
    },
    required: ["title", "date"]
  },
  handler: async (params, context) => {
    const { data, error } = await supabase
      .from("calendar_events")
      .insert([{
        title: params.title,
        date: params.date,
        start_time: params.time,
        description: params.description,
        company: params.company || "General",
        category: params.category || "meeting",
        priority: params.priority || "medium",
        user_id: context.user?.id
      }])
      .select()
      .single();

    if (error) throw error;

    context.queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    toast.success(`Event "${params.title}" created successfully`);

    return {
      success: true,
      message: `Calendar event "${params.title}" has been created for ${new Date(params.date).toLocaleDateString()}.`,
      data
    };
  }
});

actionRegistry.register({
  name: "get_upcoming_events",
  description: "Get upcoming calendar events",
  parameters: {
    type: "object",
    properties: {
      days: { type: "number", description: "Number of days to look ahead (default: 7)" },
      category: { 
        type: "string", 
        enum: ["all", "meeting", "deadline", "appointment", "conference", "training", "review", "other"],
        description: "Filter by category (optional)" 
      }
    }
  },
  handler: async (params, context) => {
    const daysAhead = params.days || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    let query = supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", context.user?.id)
      .gte("date", new Date().toISOString())
      .lte("date", endDate.toISOString())
      .order("date", { ascending: true });

    if (params.category && params.category !== "all") {
      query = query.eq("category", params.category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      message: `Found ${data.length} upcoming events in the next ${daysAhead} days.`,
      data
    };
  }
});

// Compliance Actions
actionRegistry.register({
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
});

actionRegistry.register({
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
});

// Tax Actions
actionRegistry.register({
  name: "create_tax_calculation",
  description: "Create a new tax calculation",
  parameters: {
    type: "object",
    properties: {
      tax_type: { 
        type: "string", 
        enum: ["income", "vat", "corporate", "capital_gains", "withholding"],
        description: "Type of tax calculation" 
      },
      income: { type: "number", description: "Income or base amount" },
      additional_data: { type: "object", description: "Additional calculation data (optional)" }
    },
    required: ["tax_type", "income"]
  },
  handler: async (params, context) => {
    // This would integrate with the existing tax calculation service
    const { data, error } = await supabase
      .from("tax_calculations")
      .insert([{
        tax_type: params.tax_type,
        income: params.income,
        input_data: params.additional_data || {},
        user_id: context.user?.id,
        tax_amount: 0 // This would be calculated by the tax service
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Tax calculation for ${params.tax_type} has been created.`,
      data
    };
  }
});

// Document Actions
actionRegistry.register({
  name: "search_documents",
  description: "Search for documents by name or type",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      file_type: { type: "string", description: "Filter by file type (optional)" },
      limit: { type: "number", description: "Maximum number of results (default: 10)" }
    },
    required: ["query"]
  },
  handler: async (params, context) => {
    const limit = params.limit || 10;
    
    let query = supabase
      .from("tax_documents")
      .select("*")
      .eq("user_id", context.user?.id)
      .ilike("filename", `%${params.query}%`)
      .limit(limit);

    if (params.file_type) {
      query = query.eq("content_type", params.file_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      message: `Found ${data.length} documents matching "${params.query}".`,
      data
    };
  }
});

// Navigation Action
actionRegistry.register({
  name: "navigate_to_page",
  description: "Navigate to a different page in the application",
  parameters: {
    type: "object",
    properties: {
      page: { 
        type: "string", 
        enum: ["dashboard", "compliance", "calendar", "tax", "global-reporting", "transfer-pricing", "audit-reporting"],
        description: "Page to navigate to" 
      }
    },
    required: ["page"]
  },
  handler: async (params, context) => {
    return {
      success: true,
      message: `Navigation to ${params.page} page requested.`,
      data: { navigation: `/${params.page}` },
      requiresConfirmation: false
    };
  }
});

// Information Retrieval Actions
actionRegistry.register({
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
});

actionRegistry.register({
  name: "get_dashboard_metrics",
  description: "Get dashboard metrics and statistics",
  parameters: {
    type: "object",
    properties: {}
  },
  handler: async (params, context) => {
    // Get various metrics from different tables
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
});
