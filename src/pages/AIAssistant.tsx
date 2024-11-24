import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Share2, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const AIAssistant = () => {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold">AI Tax Assistant</h1>
        </div>

        <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border bg-white">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="mx-auto max-w-3xl rounded-lg bg-gray-50 p-4">
              <div className="space-y-2">
                <p className="font-medium">
                  Hello! I'm your AI tax assistant. I can help you with:
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Creating transfer pricing documentation</li>
                  <li>Analyzing tax reports</li>
                  <li>Providing compliance guidance</li>
                  <li>Answering tax-related questions</li>
                </ul>
                <p className="font-medium">How can I assist you today?</p>
              </div>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Share conversation"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white">
                <Input
                  className="border-0 focus-visible:ring-0"
                  placeholder="Type your message..."
                />
                <Button size="icon" className="mr-2 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;