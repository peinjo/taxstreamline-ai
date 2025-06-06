
export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'notification';
  actionName?: string;
  parameters?: Record<string, any>;
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  };
  delay?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  notification?: {
    type: 'email' | 'in_app' | 'toast';
    message: string;
    recipients?: string[];
  };
  nextStepId?: string;
  alternativeStepId?: string; // For condition failures
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  lastExecuted?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'schedule' | 'event' | 'manual';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  event?: {
    source: 'calendar' | 'compliance' | 'document' | 'tax';
    eventType: string;
    conditions?: Record<string, any>;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  currentStepId?: string;
  results: Record<string, any>;
  errors?: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'tax' | 'reporting' | 'general';
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>;
  tags: string[];
}
