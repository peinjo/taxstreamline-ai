
export interface AIAction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any, context: AIActionContext) => Promise<AIActionResult>;
}

export interface AIActionContext {
  user: any;
  queryClient: any;
  currentRoute?: string;
  conversationHistory?: ConversationMessage[];
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationData?: any;
  suggestedActions?: string[];
}

export interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  actionResult?: AIActionResult;
  metadata?: {
    tokens?: number;
    model?: string;
    executionTime?: number;
  };
}

export interface AIAssistantConfig {
  maxHistoryLength: number;
  enableContextAwareness: boolean;
  enableSuggestions: boolean;
  retryAttempts: number;
}

export interface ActionMetrics {
  actionName: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastUsed: string;
}
