
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
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationData?: any;
}

export interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  actionResult?: AIActionResult;
}
