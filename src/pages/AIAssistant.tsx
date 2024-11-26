import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Share2, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import OpenAI from "openai";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI tax assistant. I can help you with:\n\n- Creating transfer pricing documentation\n- Analyzing tax reports\n- Providing compliance guidance\n- Answering tax-related questions\n\nHow can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error("OpenAI API key is not configured");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable tax assistant. Focus on providing accurate, helpful information about tax-related matters, transfer pricing, compliance, and financial reporting.",
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: userMessage },
        ],
      });

      const assistantMessage = completion.choices[0]?.message?.content;
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantMessage },
        ]);
      }
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      toast.error(
        `Failed to get response from AI: ${error.message || "Please try again"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold">AI Tax Assistant</h1>
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
                        ? "bg-gray-50"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
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
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="mr-2 shrink-0"
                  type="submit"
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;