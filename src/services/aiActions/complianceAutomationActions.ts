
import { AIAction } from "@/types/aiAssistant";
import { workflowEngine } from "../workflow/WorkflowEngine";

export const complianceAutomationActions: AIAction[] = [
  {
    name: "setup_compliance_notifications",
    description: "Set up automated compliance deadline notifications",
    parameters: {
      type: "object",
      properties: {
        frequency: { 
          type: "string", 
          enum: ["daily", "weekly", "monthly"],
          description: "Notification frequency" 
        },
        lead_time_days: { 
          type: "number", 
          description: "Days before deadline to notify (default: 7)" 
        },
        priority_filter: {
          type: "string",
          enum: ["all", "high", "urgent"],
          description: "Only notify for specific priority levels"
        }
      },
      required: ["frequency"]
    },
    handler: async (params, context) => {
      const leadTimeDays = params.lead_time_days || 7;
      const priorityFilter = params.priority_filter || "all";

      const workflow = {
        id: `compliance_notifications_${Date.now()}`,
        name: "Automated Compliance Notifications",
        description: `${params.frequency} notifications for compliance deadlines ${leadTimeDays} days in advance`,
        steps: [
          {
            id: "check_deadlines",
            type: "action" as const,
            actionName: "get_compliance_summary",
            parameters: { 
              filter: "upcoming",
              priority: priorityFilter,
              days_ahead: leadTimeDays
            },
            nextStepId: "send_notification"
          },
          {
            id: "send_notification",
            type: "notification" as const,
            notification: {
              type: "toast" as const,
              message: `📋 You have upcoming compliance deadlines in the next ${leadTimeDays} days. Check your compliance dashboard for details.`
            }
          }
        ],
        triggers: [
          {
            id: "notification_trigger",
            type: "schedule" as const,
            schedule: {
              frequency: params.frequency as "daily" | "weekly" | "monthly",
              time: "09:00"
            }
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
        message: `Automated compliance notifications set up with ${params.frequency} frequency. You'll be notified ${leadTimeDays} days before deadlines.`,
        data: { workflow, execution },
        suggestedActions: ["list_workflow_templates", "get_compliance_summary"]
      };
    }
  }
];
