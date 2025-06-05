
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { actionRegistry } from "@/services/aiActionRegistry";
import { ConversationMessage, AIActionResult } from "@/types/aiAssistant";
import { toast } from "sonner";
import OpenAI from "openai";

export function useAIAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      content: `Hello! I'm your enhanced AI assistant. I can help you with:

• **Calendar Management** - Create events, schedule meetings
• **Compliance Tracking** - Create items, update statuses, get summaries  
• **Navigation** - Move between different sections of the app
• **Information Retrieval** - Get summaries and insights from your data

Try natural language commands like:
- "Create a calendar event for quarterly review on March 31st"
- "Add a compliance item for VAT filing in Germany"
- "Show me a summary of overdue compliance items"
- "Navigate to the compliance page"`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    actionName: string;
    params: any;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const executeAction = async (functionCall: any): Promise<AIActionResult> => {
    const actionName = functionCall.name;
    const params = JSON.parse(functionCall.arguments || "{}");

    console.log(`Executing action: ${actionName}`, params);

    return await actionRegistry.executeAction(actionName, params, {
      user,
      queryClient,
      currentRoute: window.location.pathname
    });
  };

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
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured");
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a tax and compliance management application. You can perform actions using the provided functions. 

Key capabilities:
- Calendar management (creating events)
- Compliance tracking (creating items, updating statuses)
- Information retrieval (getting summaries)
- Navigation assistance

Always try to use the appropriate function when the user requests an action. If no function matches, provide helpful information or suggestions.

Current user context: ${user?.email || 'Anonymous user'}
Current page: ${window.location.pathname}`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: userMessage }
        ],
        functions: actionRegistry.getFunctionDefinitions(),
        function_call: "auto",
        temperature: 0.7,
        max_tokens: 1000
      });

      const choice = response.choices[0];
      
      if (choice.message.function_call) {
        // Execute the function
        const actionResult = await executeAction(choice.message.function_call);
        
        const assistantMessage: ConversationMessage = {
          role: "assistant",
          content: actionResult.message,
          timestamp: new Date().toISOString(),
          actionResult
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (actionResult.success) {
          toast.success("Action completed successfully");
        } else {
          toast.error("Action failed");
        }
      } else {
        // Regular response
        const assistantMessage: ConversationMessage = {
          role: "assistant",
          content: choice.message.content || "I'm sorry, I couldn't process that request.",
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      
      let errorMessage = "I'm sorry, I encountered an error processing your request.";
      
      if (error.response?.status === 429) {
        errorMessage = "I'm currently at capacity. Please try again in a moment.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
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

  const clearConversation = () => {
    setMessages([messages[0]]); // Keep the initial greeting
    setPendingConfirmation(null);
  };

  return {
    messages,
    isLoading,
    pendingConfirmation,
    handleUserMessage,
    clearConversation,
    actionRegistry
  };
}
