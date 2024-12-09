import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { defaultTemplate } from "@/components/transfer-pricing/constants";

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export const executeAICommand = async (
  command: string,
  queryClient: QueryClient
): Promise<CommandResult> => {
  // Parse the command to identify the target component and action
  const commandLower = command.toLowerCase();

  // Calendar commands
  if (commandLower.includes("calendar") || commandLower.includes("event")) {
    if (commandLower.includes("add event") || commandLower.includes("create event")) {
      // Extract event details using regex
      const titleMatch = command.match(/titled "([^"]+)"/);
      const dateMatch = command.match(/on ([A-Za-z]+ \d{1,2},? \d{4})/);
      const companyMatch = command.match(/for ([^"]+)/);

      if (titleMatch && dateMatch) {
        try {
          const eventData = {
            title: titleMatch[1],
            date: new Date(dateMatch[1]).toISOString(),
            company: companyMatch ? companyMatch[1] : "General",
          };

          const { data, error } = await supabase
            .from("calendar_events")
            .insert([eventData])
            .select()
            .single();

          if (error) throw error;

          // Invalidate calendar events query
          queryClient.invalidateQueries({ queryKey: ["calendar-events"] });

          return {
            success: true,
            message: `Event "${eventData.title}" has been added to the calendar.`,
            data,
          };
        } catch (error) {
          console.error("Error adding event:", error);
          return {
            success: false,
            message: "Failed to add the event to the calendar.",
          };
        }
      }
    }
  }

  // Transfer Pricing commands
  if (commandLower.includes("transfer pricing") || commandLower.includes("documentation")) {
    if (commandLower.includes("create document") || commandLower.includes("new document")) {
      try {
        const newDocument = {
          title: "New Document",
          type: "local",
          content: defaultTemplate,
          modified: new Date().toLocaleDateString(),
        };

        // Invalidate documents query
        queryClient.invalidateQueries({ queryKey: ["transfer-pricing-documents"] });

        return {
          success: true,
          message: "New transfer pricing document has been created.",
          data: newDocument,
        };
      } catch (error) {
        console.error("Error creating document:", error);
        return {
          success: false,
          message: "Failed to create new transfer pricing document.",
        };
      }
    }
  }

  // Default response for unrecognized commands
  return {
    success: false,
    message: "I'm sorry, I don't understand that command. Please try something else.",
  };
};