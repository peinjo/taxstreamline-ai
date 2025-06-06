
import { AIAction } from "@/types/aiAssistant";

export const recurringTaskActions: AIAction[] = [
  {
    name: "generate_recurring_task_template",
    description: "Generate recurring task templates for common activities",
    parameters: {
      type: "object",
      properties: {
        task_type: {
          type: "string",
          enum: ["monthly_tax_review", "quarterly_compliance", "annual_audit", "weekly_reporting"],
          description: "Type of recurring task"
        },
        frequency: {
          type: "string",
          enum: ["weekly", "monthly", "quarterly", "annual"],
          description: "How often the task should recur"
        },
        start_date: { type: "string", description: "When to start the recurring tasks" }
      },
      required: ["task_type", "frequency"]
    },
    handler: async (params, context) => {
      const taskTemplates = {
        monthly_tax_review: {
          title: "Monthly Tax Review",
          description: "Review monthly tax obligations and filing requirements",
          actions: ["get_dashboard_metrics", "get_compliance_summary"]
        },
        quarterly_compliance: {
          title: "Quarterly Compliance Check",
          description: "Comprehensive quarterly compliance review",
          actions: ["get_compliance_summary", "create_compliance_item"]
        },
        annual_audit: {
          title: "Annual Audit Preparation",
          description: "Prepare for annual audit requirements",
          actions: ["get_dashboard_metrics", "search_documents"]
        },
        weekly_reporting: {
          title: "Weekly Status Report",
          description: "Generate weekly status and progress reports",
          actions: ["get_dashboard_metrics", "get_upcoming_events"]
        }
      };

      const template = taskTemplates[params.task_type];
      const startDate = params.start_date ? new Date(params.start_date) : new Date();

      const workflow = {
        id: `recurring_${params.task_type}_${Date.now()}`,
        name: `Recurring: ${template.title}`,
        description: `${params.frequency} ${template.description}`,
        steps: [
          ...template.actions.map((action, index) => ({
            id: `step_${index + 1}`,
            type: "action" as const,
            actionName: action,
            parameters: {},
            nextStepId: index < template.actions.length - 1 ? `step_${index + 2}` : "final_notification"
          })),
          {
            id: "final_notification",
            type: "notification" as const,
            notification: {
              type: "toast" as const,
              message: `✅ ${template.title} completed successfully.`
            }
          }
        ],
        triggers: [
          {
            id: "recurring_trigger",
            type: "schedule" as const,
            schedule: {
              frequency: params.frequency as "weekly" | "monthly",
              time: "09:00"
            }
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0
      };

      return {
        success: true,
        message: `Recurring task template created: ${template.title} (${params.frequency}). Tasks will run automatically starting from ${startDate.toLocaleDateString()}.`,
        data: { workflow, template },
        suggestedActions: ["list_workflow_templates", "execute_workflow"]
      };
    }
  }
];
