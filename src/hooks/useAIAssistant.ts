
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { actionRegistry } from "@/services/aiActionRegistry";
import { ConversationMessage, AIActionResult } from "@/types/aiAssistant";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

  // AI operations now handled via secure edge function

  const executeAction = useCallback(async (functionCall: { name: string; arguments?: string }): Promise<AIActionResult> => {
    const actionName = functionCall.name;
    const params = JSON.parse(functionCall.arguments || "{}");

    // Action execution logging would be handled by proper logging service

    const result = await actionRegistry.executeAction(actionName, params, {
      user,
      queryClient,
      currentRoute: location.pathname
    });

    // Handle navigation requests
    if (result.success && result.data?.navigation) {
      navigate(result.data.navigation);
    }

    return result;
  }, [user, queryClient, location.pathname, navigate]);

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

Phase 4 Advanced Features:
- Smart Automation: Set up intelligent automation for compliance notifications, client onboarding workflows, and recurring task templates
- Data Analysis: Analyze compliance performance trends, identify tax optimization opportunities, generate comprehensive risk assessments
- Integration & Export: Export data to Excel, sync calendar events with external systems, generate API reports for third-party tools

Workflow Features:
- Pre-built templates for common tasks (compliance reminders, tax reporting)
- Custom workflow creation with steps, conditions, and triggers
- Automated execution based on schedules or events
- Real-time execution monitoring and status tracking

Guidelines:
- Always try to use the appropriate function when the user requests an action
- Be proactive in suggesting workflow automation for repetitive tasks
- Recommend data analysis when users mention performance or optimization
- Suggest export/integration options when users need to share or sync data
- For workflow requests, start by showing available templates
- Provide context-aware responses based on the current page
- If multiple actions could help, suggest the most relevant one
- For navigation requests, use the navigate_to_page function
- When creating items, suggest reasonable defaults for optional fields
- Always confirm successful actions and provide next steps
- Suggest workflow automation when users mention repetitive tasks or schedules
- Offer insights and recommendations based on data analysis results`;
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
      // OpenAI operations now handled securely via edge function

      // Build conversation history with context
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

      // Call secure AI edge function instead of direct OpenAI
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-operations', {
        body: {
          action: 'chat',
          payload: {
            messages: conversationHistory,
            context: {
              currentPath: location.pathname,
              userRole: user?.role || 'user'
            }
          }
        }
      });

      if (aiError) {
        throw new Error(`AI service error: ${aiError.message}`);
      }

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI service failed');
      }

      // Mock the OpenAI response format for compatibility
      const response = {
        choices: [{
          message: {
            content: aiResponse.response,
            function_call: null // Functions handled separately in edge function
          }
        }]
      };

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

        // Update conversation context for better continuity
        setConversationContext(prev => [...prev.slice(-5), {
          role: "assistant",
          content: `Executed ${choice.message.function_call.name} with result: ${actionResult.success ? 'success' : 'failure'}`
        }]);

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
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication error. Please check your API configuration.";
      } else if (error.message?.includes("API key")) {
        errorMessage = "OpenAI API key is not configured. Please add your API key to continue.";
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

  const clearConversation = useCallback(() => {
    setMessages([messages[0]]); // Keep the initial greeting
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
