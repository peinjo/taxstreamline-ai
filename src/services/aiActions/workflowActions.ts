
import { AIAction } from "@/types/aiAssistant";
import { workflowEngine } from "../workflow/WorkflowEngine";
import { Workflow, WorkflowTemplate } from "@/types/workflow";

// Predefined workflow templates
const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "compliance_reminder",
    name: "Compliance Deadline Reminder",
    description: "Automatically reminds about upcoming compliance deadlines",
    category: "compliance",
    workflow: {
      name: "Compliance Deadline Reminder",
      description: "Sends reminders for compliance items due soon",
      steps: [
        {
          id: "check_deadlines",
          type: "action",
          actionName: "get_compliance_summary",
          parameters: { filter: "upcoming" },
          nextStepId: "check_overdue"
        },
        {
          id: "check_overdue",
          type: "condition",
          condition: {
            field: "check_deadlines.data.overdue_count",
            operator: "greater_than",
            value: 0
          },
          nextStepId: "send_urgent_notification",
          alternativeStepId: "send_regular_notification"
        },
        {
          id: "send_urgent_notification",
          type: "notification",
          notification: {
            type: "toast",
            message: "⚠️ You have overdue compliance items that need immediate attention!"
          }
        },
        {
          id: "send_regular_notification",
          type: "notification",
          notification: {
            type: "toast",
            message: "📅 You have upcoming compliance deadlines this week."
          }
        }
      ],
      triggers: [
        {
          id: "daily_check",
          type: "schedule",
          schedule: {
            frequency: "daily",
            time: "09:00"
          }
        }
      ],
      isActive: true
    },
    tags: ["compliance", "reminders", "automation"]
  },
  {
    id: "monthly_tax_report",
    name: "Monthly Tax Report Generation",
    description: "Generates monthly tax reports and summaries",
    category: "tax",
    workflow: {
      name: "Monthly Tax Report Generation",
      description: "Automatically generates and organizes monthly tax reports",
      steps: [
        {
          id: "get_dashboard_metrics",
          type: "action",
          actionName: "get_dashboard_metrics",
          parameters: {},
          nextStepId: "create_summary_notification"
        },
        {
          id: "create_summary_notification",
          type: "notification",
          notification: {
            type: "toast",
            message: "📊 Monthly tax report has been generated with your latest metrics."
          }
        }
      ],
      triggers: [
        {
          id: "monthly_trigger",
          type: "schedule",
          schedule: {
            frequency: "monthly",
            dayOfMonth: 1,
            time: "08:00"
          }
        }
      ],
      isActive: true
    },
    tags: ["tax", "reporting", "monthly"]
  }
];

export const workflowActions: AIAction[] = [
  {
    name: "create_workflow",
    description: "Create a new custom workflow for automation",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Workflow name" },
        description: { type: "string", description: "Workflow description" },
        template_id: { type: "string", description: "Optional template ID to base workflow on" }
      },
      required: ["name", "description"]
    },
    handler: async (params, context) => {
      let workflow: Partial<Workflow>;

      if (params.template_id) {
        const template = workflowTemplates.find(t => t.id === params.template_id);
        if (!template) {
          return {
            success: false,
            message: `Template with ID ${params.template_id} not found.`
          };
        }
        
        workflow = {
          ...template.workflow,
          id: `workflow_${Date.now()}`,
          name: params.name,
          description: params.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executionCount: 0
        };
      } else {
        workflow = {
          id: `workflow_${Date.now()}`,
          name: params.name,
          description: params.description,
          steps: [],
          triggers: [],
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executionCount: 0
        };
      }

      return {
        success: true,
        message: `Workflow "${params.name}" has been created${params.template_id ? ' from template' : ''}.`,
        data: workflow,
        suggestedActions: ["execute_workflow", "list_workflow_templates"]
      };
    }
  },
  {
    name: "execute_workflow",
    description: "Execute a workflow manually or by template",
    parameters: {
      type: "object",
      properties: {
        template_id: { type: "string", description: "Template ID to execute" },
        trigger_data: { type: "object", description: "Optional data to pass to workflow" }
      },
      required: ["template_id"]
    },
    handler: async (params, context) => {
      const template = workflowTemplates.find(t => t.id === params.template_id);
      if (!template) {
        return {
          success: false,
          message: `Workflow template "${params.template_id}" not found.`
        };
      }

      const workflow: Workflow = {
        ...template.workflow,
        id: `workflow_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0
      };

      try {
        const execution = await workflowEngine.executeWorkflow(
          workflow, 
          context, 
          params.trigger_data
        );

        return {
          success: true,
          message: `Workflow "${template.name}" executed successfully. Status: ${execution.status}`,
          data: { execution, template },
          suggestedActions: ["get_workflow_execution_status"]
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to execute workflow: ${error.message}`
        };
      }
    }
  },
  {
    name: "list_workflow_templates",
    description: "List available workflow templates",
    parameters: {
      type: "object",
      properties: {
        category: { 
          type: "string", 
          enum: ["all", "compliance", "tax", "reporting", "general"],
          description: "Filter templates by category" 
        }
      }
    },
    handler: async (params, context) => {
      let templates = workflowTemplates;

      if (params.category && params.category !== "all") {
        templates = workflowTemplates.filter(t => t.category === params.category);
      }

      const templateSummary = templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        tags: t.tags,
        stepCount: t.workflow.steps.length
      }));

      return {
        success: true,
        message: `Found ${templates.length} workflow templates${params.category && params.category !== 'all' ? ` in ${params.category} category` : ''}.`,
        data: templateSummary,
        suggestedActions: ["execute_workflow", "create_workflow"]
      };
    }
  },
  {
    name: "get_workflow_execution_status",
    description: "Get the status of workflow executions",
    parameters: {
      type: "object",
      properties: {
        execution_id: { type: "string", description: "Specific execution ID (optional)" }
      }
    },
    handler: async (params, context) => {
      if (params.execution_id) {
        const execution = workflowEngine.getExecution(params.execution_id);
        if (!execution) {
          return {
            success: false,
            message: `Execution with ID ${params.execution_id} not found.`
          };
        }

        return {
          success: true,
          message: `Execution ${params.execution_id} status: ${execution.status}`,
          data: execution
        };
      } else {
        const executions = workflowEngine.getAllExecutions();
        const summary = {
          total: executions.length,
          running: executions.filter(e => e.status === 'running').length,
          completed: executions.filter(e => e.status === 'completed').length,
          failed: executions.filter(e => e.status === 'failed').length,
          recent: executions.slice(-5)
        };

        return {
          success: true,
          message: `Found ${summary.total} workflow executions. ${summary.running} running, ${summary.completed} completed, ${summary.failed} failed.`,
          data: summary
        };
      }
    }
  }
];
