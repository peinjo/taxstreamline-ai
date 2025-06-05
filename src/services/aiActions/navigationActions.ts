
import { AIAction } from "@/types/aiAssistant";

export const navigationActions: AIAction[] = [
  {
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
  }
];
