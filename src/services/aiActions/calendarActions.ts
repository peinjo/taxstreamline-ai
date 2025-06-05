
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const calendarActions: AIAction[] = [
  {
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
  },
  {
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
  }
];
