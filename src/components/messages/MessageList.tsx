import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  email: string;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender: User | null;
}

export const MessageList = ({ teamId }: { teamId: number }) => {
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["messages", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            email
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {messages?.map((message) => (
          <div key={message.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender?.email}`} />
              <AvatarFallback>
                {message.sender?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {message.sender?.email}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(message.created_at), "PPp")}
              </p>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};