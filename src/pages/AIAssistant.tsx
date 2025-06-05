
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Share2, Send, Trash2, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { format } from "date-fns";

const AIAssistant = () => {
  const [input, setInput] = useState("");
  const { messages, isLoading, handleUserMessage, clearConversation } = useAIAssistant();

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
    const icon = actionResult.success ? <Zap className="h-3 w-3" /> : null;

    return (
      <Badge variant={variant} className="ml-2 text-xs">
        {icon}
        Action {actionResult.success ? "Completed" : "Failed"}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
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
          <Button
            variant="outline"
            onClick={clearConversation}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        </div>

        <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border bg-white">
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
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "assistant"
                        ? "bg-gray-50 border"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="whitespace-pre-wrap flex-1">{message.content}</p>
                      {getActionBadge(message.actionResult)}
                    </div>
                    <div className="mt-2 text-xs opacity-70">
                      {format(new Date(message.timestamp), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600">Processing...</span>
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
                  placeholder="Ask me to create events, manage compliance, get summaries, or navigate..."
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
              Tip: Try "Create a compliance item for VAT filing in Germany" or "Show me overdue items"
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
