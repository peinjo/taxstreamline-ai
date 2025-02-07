
import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultTemplate } from "@/components/transfer-pricing/constants";
import { Document } from "@/components/transfer-pricing/types";

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export const executeAICommand = async (
  command: string,
  queryClient: QueryClient
): Promise<CommandResult> => {
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

  // Transfer Pricing Document Operations
  if (commandLower.includes("transfer pricing") || commandLower.includes("document")) {
    // Create new document
    if (commandLower.includes("create") || commandLower.includes("new")) {
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

    // Read document content
    if (commandLower.includes("read") || commandLower.includes("show")) {
      const titleMatch = command.match(/document (?:titled |called |named )"([^"]+)"/);
      if (titleMatch) {
        const title = titleMatch[1];
        try {
          // This is a mock implementation. In a real app, you would fetch from your database
          const mockDocument: Document = {
            id: 1,
            title: title,
            type: "local",
            modified: new Date().toLocaleDateString(),
            content: "This is the content of " + title,
          };

          return {
            success: true,
            message: `Here's the content of document "${title}"`,
            data: mockDocument,
          };
        } catch (error) {
          console.error("Error reading document:", error);
          return {
            success: false,
            message: `Failed to read document "${title}"`,
          };
        }
      }
    }

    // Edit document content
    if (commandLower.includes("edit") || commandLower.includes("update")) {
      const titleMatch = command.match(/document (?:titled |called |named )"([^"]+)"/);
      const contentMatch = command.match(/content to "([^"]+)"/);
      
      if (titleMatch && contentMatch) {
        const title = titleMatch[1];
        const newContent = contentMatch[1];
        
        try {
          // This is a mock implementation. In a real app, you would update your database
          const updatedDocument: Document = {
            id: 1,
            title: title,
            type: "local",
            modified: new Date().toLocaleDateString(),
            content: newContent,
          };

          return {
            success: true,
            message: `Document "${title}" has been updated.`,
            data: updatedDocument,
          };
        } catch (error) {
          console.error("Error updating document:", error);
          return {
            success: false,
            message: `Failed to update document "${title}"`,
          };
        }
      }
    }
  }

  // Default response for unrecognized commands
  return {
    success: false,
    message: "I'm sorry, I don't understand that command. For transfer pricing documents, you can try:\n" +
            '- "Create a new document"\n' +
            '- "Read document titled "Example Doc""\n' +
            '- "Edit document titled "Example Doc" with content to "New content here""',
  };
};
