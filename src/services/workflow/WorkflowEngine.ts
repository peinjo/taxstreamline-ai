
import { Workflow, WorkflowStep, WorkflowExecution } from "@/types/workflow";
import { actionRegistry } from "../aiActionRegistry";
import { AIActionContext } from "@/types/aiAssistant";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();

  async executeWorkflow(
    workflow: Workflow, 
    context: AIActionContext,
    triggerData?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: 'running',
      startedAt: new Date().toISOString(),
      currentStepId: workflow.steps[0]?.id,
      results: { triggerData: triggerData || {} },
      errors: []
    };

    this.executions.set(execution.id, execution);

    // Persist to DB
    const userId = context.user?.id;
    if (userId) {
      await supabase.from('workflow_executions').insert({
        id: execution.id.replace('exec_', '').length === 36 ? execution.id : undefined,
        user_id: userId,
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status: 'running',
        started_at: execution.startedAt,
        current_step_id: execution.currentStepId,
        results: execution.results,
        errors: [],
      } as any);
    }

    try {
      await this.executeSteps(workflow, execution, context);
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
    } catch (error) {
      execution.status = 'failed';
      execution.errors?.push(error.message);
      execution.completedAt = new Date().toISOString();
    }

    // Update DB with final status
    if (userId) {
      await supabase.from('workflow_executions')
        .update({
          status: execution.status,
          completed_at: execution.completedAt,
          results: execution.results,
          errors: execution.errors,
        } as any)
        .eq('workflow_id', workflow.id)
        .eq('user_id', userId)
        .eq('status', 'running');
    }

    return execution;
  }

  private async executeSteps(
    workflow: Workflow, 
    execution: WorkflowExecution,
    context: AIActionContext
  ) {
    let currentStepId = workflow.steps[0]?.id;

    while (currentStepId) {
      const step = workflow.steps.find(s => s.id === currentStepId);
      if (!step) break;

      execution.currentStepId = currentStepId;
      
      try {
        const result = await this.executeStep(step, execution, context);
        execution.results[step.id] = result;
        
        if (step.type === 'condition' && result.conditionMet === false && step.alternativeStepId) {
          currentStepId = step.alternativeStepId;
        } else {
          currentStepId = step.nextStepId;
        }
      } catch (error) {
        execution.errors?.push(`Step ${step.id}: ${error.message}`);
        throw error;
      }
    }
  }

  private async executeStep(
    step: WorkflowStep, 
    execution: WorkflowExecution,
    context: AIActionContext
  ): Promise<any> {
    switch (step.type) {
      case 'action':
        if (!step.actionName) throw new Error('Action name is required');
        return await actionRegistry.executeAction(
          step.actionName, 
          step.parameters || {}, 
          context
        );

      case 'condition':
        if (!step.condition) throw new Error('Condition is required');
        return this.evaluateCondition(step.condition, execution.results);

      case 'delay':
        if (!step.delay) throw new Error('Delay configuration is required');
        await this.delay(step.delay.duration, step.delay.unit);
        return { delayed: true };

      case 'notification':
        if (!step.notification) throw new Error('Notification configuration is required');
        return this.sendNotification(step.notification);

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private evaluateCondition(condition: any, results: Record<string, any>): { conditionMet: boolean } {
    const value = this.getNestedValue(results, condition.field);
    
    switch (condition.operator) {
      case 'equals': return { conditionMet: value === condition.value };
      case 'not_equals': return { conditionMet: value !== condition.value };
      case 'greater_than': return { conditionMet: Number(value) > Number(condition.value) };
      case 'less_than': return { conditionMet: Number(value) < Number(condition.value) };
      case 'contains': return { conditionMet: String(value).includes(String(condition.value)) };
      default: return { conditionMet: false };
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async delay(duration: number, unit: string): Promise<void> {
    const milliseconds = this.convertToMilliseconds(duration, unit);
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  private convertToMilliseconds(duration: number, unit: string): number {
    switch (unit) {
      case 'minutes': return duration * 60 * 1000;
      case 'hours': return duration * 60 * 60 * 1000;
      case 'days': return duration * 24 * 60 * 60 * 1000;
      default: return duration * 1000;
    }
  }

  private sendNotification(notification: any): { notificationSent: boolean } {
    switch (notification.type) {
      case 'toast':
        toast.info(notification.message);
        break;
      case 'in_app':
        break;
      case 'email':
        break;
    }
    return { notificationSent: true };
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  // Load past executions from DB
  async loadExecutions(userId: string): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return (data as any[]).map(row => ({
      id: row.id,
      workflowId: row.workflow_id,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      currentStepId: row.current_step_id,
      results: row.results || {},
      errors: row.errors || [],
    }));
  }
}

export const workflowEngine = new WorkflowEngine();
