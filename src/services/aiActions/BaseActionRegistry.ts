
import { AIAction, AIActionContext, AIActionResult } from "@/types/aiAssistant";
import { logger } from "@/lib/logging/logger";

export class BaseActionRegistry {
  private actions: Map<string, AIAction> = new Map();

  register(action: AIAction) {
    this.actions.set(action.name, action);
  }

  getAction(name: string): AIAction | undefined {
    return this.actions.get(name);
  }

  getAllActions(): AIAction[] {
    return Array.from(this.actions.values());
  }

  getFunctionDefinitions() {
    return this.getAllActions().map(action => ({
      name: action.name,
      description: action.description,
      parameters: action.parameters
    }));
  }

  async executeAction(name: string, params: Record<string, unknown>, context: AIActionContext): Promise<AIActionResult> {
    const action = this.getAction(name);
    if (!action) {
      return {
        success: false,
        message: `Unknown action: ${name}`
      };
    }

    try {
      return await action.handler(params, context);
    } catch (error) {
      logger.error(`Error executing action ${name}`, error as Error, { 
        action: name, 
        component: 'BaseActionRegistry' 
      });
      return {
        success: false,
        message: `Failed to execute ${name}: ${error.message}`
      };
    }
  }
}
