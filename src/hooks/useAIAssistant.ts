
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { actionRegistry } from "@/services/aiActionRegistry";
import { ConversationMessage, AIActionResult } from "@/types/aiAssistant";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logging/logger";

export function useAIAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      content: `Hello! I'm your enhanced AI assistant with expanded capabilities. I can help you with:

• **Calendar Management** - Create events, check upcoming schedules, set reminders
• **Compliance Tracking** - Create items, update statuses, get detailed summaries  
• **Tax Management** - Create calculations, search documents, manage filings
• **Document Management** - Search files, organize documents, track uploads
• **Navigation** - Move between different sections seamlessly
• **Analytics & Insights** - Get dashboard metrics, compliance summaries, and trends

Try commands like:
- "Create a quarterly review meeting for next Friday"
- "Show me all overdue compliance items for Germany"
- "What are my upcoming deadlines this week?"
- "Search for VAT documents from 2024"
- "Get me a summary of all my compliance items"
- "Navigate to the tax calculator"`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<any[]>([]);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const executeAction = useCallback(async (functionCall: { name: string; arguments?: string }): Promise<AIActionResult> => {
    const actionName = functionCall.name;
    const params = JSON.parse(functionCall.arguments || "{}");

    const result = await actionRegistry.executeAction(actionName, params, {
      user,
      queryClient,
      currentRoute: location.pathname
    });

    if (result.success && result.data?.navigation) {
      navigate(result.data.navigation);
    }

    return result;
  }, [user, queryClient, location.pathname, navigate]);

  // Build OpenAI-compatible tool definitions from the action registry
  const getToolDefinitions = useCallback(() => {
    return actionRegistry.getAllActions().map(action => ({
      type: 'function' as const,
      function: {
        name: action.name,
        description: action.description,
        parameters: action.parameters,
      }
    }));
  }, []);

  const buildContextualPrompt = useCallback(() => {
    const currentPage = location.pathname.split('/')[1] || 'dashboard';
    const timeContext = new Date().toLocaleString();
    
    return `You are an AI assistant for a comprehensive tax and compliance management application with advanced workflow automation and intelligent analysis capabilities. 

Current context:
- User: ${user?.email || 'Anonymous user'}
- Current page: ${currentPage}
- Current time: ${timeContext}
- Available functions: ${actionRegistry.getAllActions().length} actions

Key capabilities:
- Calendar management (creating events, checking schedules)
- Compliance tracking (creating items, updating statuses, getting summaries)
- Tax management (calculations, document search)
- Document management (search, organization)
- Navigation assistance
- Analytics and reporting
- **Workflow Automation** (create, execute, and manage automated workflows)
- **Smart Automation** (automated notifications, client onboarding, recurring tasks)
- **Data Analysis & Insights** (compliance trends, tax optimization, risk assessment)
- **Integration & Export** (Excel export, calendar sync, API reports)

IMPORTANT: When the user asks you to perform an action, you MUST call the appropriate function. Do not just describe what you would do.

Guidelines:
- Always try to use the appropriate function when the user requests an action
- Be proactive in suggesting workflow automation for repetitive tasks
- Provide context-aware responses based on the current page
- If multiple actions could help, suggest the most relevant one
- For navigation requests, use the navigate_to_page function
- When creating items, suggest reasonable defaults for optional fields
- Always confirm successful actions and provide next steps`;
  }, [user, location.pathname]);

  const handleUserMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    const newUserMessage: ConversationMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = [
        {
          role: "system" as const,
          content: buildContextualPrompt()
        },
        ...conversationContext,
        ...messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user" as const, content: userMessage }
      ];

      // Pass tool definitions to the edge function
      const toolDefs = getToolDefinitions();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-operations', {
        body: {
          action: 'chat',
          payload: {
            messages: conversationHistory,
            context: {
              currentPath: location.pathname,
              userRole: user?.role || 'user'
            },
            tools: toolDefs
          }
        }
      });

      if (aiError) {
        throw new Error(`AI service error: ${aiError.message}`);
      }

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI service failed');
      }

      // Check if the AI wants to call a function
      if (aiResponse.function_call) {
        const actionResult = await executeAction(aiResponse.function_call);
        
        const assistantMessage: ConversationMessage = {
          role: "assistant",
          content: aiResponse.response 
            ? `${aiResponse.response}\n\n${actionResult.message}` 
            : actionResult.message,
          timestamp: new Date().toISOString(),
          actionResult
        };

        setMessages(prev => [...prev, assistantMessage]);

        setConversationContext(prev => [...prev.slice(-5), {
          role: "assistant",
          content: `Executed ${aiResponse.function_call.name} with result: ${actionResult.success ? 'success' : 'failure'} - ${actionResult.message}`
        }]);

        if (actionResult.success) {
          toast.success("Action completed successfully");
        } else {
          toast.error("Action failed");
        }
      } else {
        const assistantMessage: ConversationMessage = {
          role: "assistant",
          content: aiResponse.response || "I'm sorry, I couldn't process that request.",
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      const err = error as Error & { response?: { status?: number }; message?: string };
      logger.error("AI Assistant Error", err);
      
      let errorMessage = "I'm sorry, I encountered an error processing your request.";
      
      if (err.response?.status === 429) {
        errorMessage = "I'm currently at capacity. Please try again in a moment.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication error. Please check your API configuration.";
      } else if (err.message?.includes("API key")) {
        errorMessage = "OpenAI API key is not configured. Please add your API key to continue.";
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      const errorResponse: ConversationMessage = {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorResponse]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = useCallback(() => {
    setMessages([messages[0]]);
    setConversationContext([]);
  }, [messages]);

  const retryLastAction = useCallback(async () => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    if (lastUserMessage) {
      await handleUserMessage(lastUserMessage.content);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    handleUserMessage,
    clearConversation,
    retryLastAction,
    actionRegistry
  };
}
