```typescript
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/types";

interface MessageListProps {
  teamId: number;
}

export const MessageList: React.FC<MessageListProps> = ({ teamId }) => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:user_profiles(full_name)
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
  });

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      {messages?.map((message) => (
        <div key={message.id} className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback>
              {message.sender?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {message.sender?.full_name || "Unknown User"}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="mt-1 text-gray-700">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
```
