
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Share2, Send, Trash2, Zap, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

const AIAssistant = () => {
  const [input, setInput] = useState("");
  const { 
    messages, 
    isLoading, 
    handleUserMessage, 
    clearConversation, 
    retryLastAction 
  } = useAIAssistant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    await handleUserMessage(userMessage);
  };

  const getActionBadge = (actionResult: any) => {
    if (!actionResult) return null;

    const variant = actionResult.success ? "default" : "destructive";
    const icon = actionResult.success ? 
      <CheckCircle className="h-3 w-3" /> : 
      <AlertCircle className="h-3 w-3" />;

    return (
      <Badge variant={variant} className="ml-2 text-xs">
        {icon}
        {actionResult.success ? "Completed" : "Failed"}
      </Badge>
    );
  };

  const quickActions = [
    { label: "Show upcoming events", command: "Show me my upcoming events this week" },
    { label: "Compliance summary", command: "Get me a summary of all my compliance items" },
    { label: "Dashboard metrics", command: "Show me my dashboard metrics" },
    { label: "Search documents", command: "Search for tax documents" },
    { label: "Workflow templates", command: "Show me available workflow templates" },
    { label: "Execute compliance workflow", command: "Execute the compliance reminder workflow" },
    // Phase 4: Smart Automation
    { label: "Setup notifications", command: "Set up automated compliance deadline notifications" },
    { label: "Client onboarding", command: "Create workflow for new client onboarding" },
    { label: "Recurring tasks", command: "Generate recurring task template for monthly tax review" },
    // Phase 4: Data Analysis
    { label: "Compliance trends", command: "Analyze compliance performance trends" },
    { label: "Tax opportunities", command: "Identify tax optimization opportunities" },
    { label: "Risk assessment", command: "Generate comprehensive risk assessment report" },
    // Phase 4: Integration & Export
    { label: "Export to Excel", command: "Export compliance data to Excel" },
    { label: "Sync calendar", command: "Sync calendar events with external systems" },
    { label: "API report", command: "Generate API usage report for third-party tools" }
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Enhanced AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Your intelligent assistant for tax, compliance, and workflow management
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={retryLastAction}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={clearConversation}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(action.command)}
                  className="text-xs h-auto py-2 px-3"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex h-[calc(100vh-16rem)] flex-col rounded-lg border bg-white">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.role === "assistant"
                        ? "bg-gray-50 border"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {getActionBadge(message.actionResult)}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      {format(new Date(message.timestamp), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border rounded-lg p-4 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600">Processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Share conversation"
                type="button"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white">
                <Input
                  className="border-0 focus-visible:ring-0"
                  placeholder="Ask me to create events, manage compliance, get summaries, search documents, or navigate..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="mr-2 shrink-0"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="mt-2 text-xs text-muted-foreground">
              💡 Try: "Create a tax deadline reminder for March 31st" or "Show me overdue compliance items" or "Get dashboard metrics"
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
