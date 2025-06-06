
import { AIAction } from "@/types/aiAssistant";
import { workflowEngine } from "../workflow/WorkflowEngine";
import { supabase } from "@/integrations/supabase/client";
import { addDays, addWeeks, addMonths } from "date-fns";

export const automationActions: AIAction[] = [
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
              type: "toast",
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
  },
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
              type: "toast",
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
  },
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
              type: "toast",
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
