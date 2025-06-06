
import { AIAction } from "@/types/aiAssistant";
import { workflowEngine } from "../workflow/WorkflowEngine";
import { addDays } from "date-fns";

export const clientOnboardingActions: AIAction[] = [
  {
    name: "create_client_onboarding_workflow",
    description: "Create workflow for new client onboarding",
    parameters: {
      type: "object",
      properties: {
        client_name: { type: "string", description: "Name of the new client" },
        client_type: { 
          type: "string", 
          enum: ["individual", "business", "corporation"],
          description: "Type of client" 
        },
        services: {
          type: "array",
          items: { type: "string" },
          description: "Services to be provided (tax, compliance, audit)"
        }
      },
      required: ["client_name", "client_type"]
    },
    handler: async (params, context) => {
      const services = params.services || ["tax", "compliance"];
      
      const workflow = {
        id: `onboarding_${Date.now()}`,
        name: `Client Onboarding: ${params.client_name}`,
        description: `Automated onboarding workflow for ${params.client_type} client`,
        steps: [
          {
            id: "create_welcome_event",
            type: "action" as const,
            actionName: "create_calendar_event",
            parameters: {
              title: `Welcome Meeting - ${params.client_name}`,
              company: params.client_name,
              category: "meeting",
              priority: "high",
              date: addDays(new Date(), 3).toISOString(),
              description: "Initial consultation and setup meeting"
            },
            nextStepId: "create_compliance_items"
          },
          {
            id: "create_compliance_items",
            type: "action" as const,
            actionName: "create_compliance_item",
            parameters: {
              title: `Initial Compliance Assessment - ${params.client_name}`,
              country: "Nigeria",
              requirement_type: "assessment",
              frequency: "annual",
              priority: "high",
              status: "pending"
            },
            nextStepId: "send_welcome_notification"
          },
          {
            id: "send_welcome_notification",
            type: "notification" as const,
            notification: {
              type: "toast" as const,
              message: `🎉 Client onboarding workflow created for ${params.client_name}. Welcome meeting scheduled and initial assessments set up.`
            }
          }
        ],
        triggers: [
          {
            id: "manual_trigger",
            type: "manual" as const
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0
      };

      const execution = await workflowEngine.executeWorkflow(workflow, context);

      return {
        success: true,
        message: `Client onboarding workflow created for ${params.client_name}. Welcome meeting scheduled and compliance items set up.`,
        data: { workflow, execution, client: params.client_name },
        suggestedActions: ["get_upcoming_events", "get_compliance_summary"]
      };
    }
  }
];
