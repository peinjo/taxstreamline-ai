
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";

export const documentActions: AIAction[] = [
  {
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
  }
];
