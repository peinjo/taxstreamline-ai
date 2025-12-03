import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { logger } from "@/lib/logging/logger";
import { messageSchema, validateInput } from "@/lib/validation/schemas";

export const MessageInput = ({ teamId }: { teamId: number }) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!content.trim()) return;

    // Validate input using schema
    const validation = validateInput(messageSchema, {
      content: content.trim(),
      team_id: teamId,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert([
        {
          content: validation.data.content,
          team_id: validation.data.team_id,
          sender_id: user?.id,
        },
      ]);

      if (error) throw error;

      setContent("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      logger.error("Error sending message", error as Error, { component: 'MessageInput', teamId });
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[80px]"
        maxLength={1000}
      />
      <Button onClick={handleSendMessage} className="self-end">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
