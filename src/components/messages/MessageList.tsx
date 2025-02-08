
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageWithProfile {
  id: number;
  content: string;
  created_at: string;
  team_id: number;
  sender_id: string;
  profiles: {
    full_name: string;
    user_id: string;
  } | null;
}

export const MessageList = ({ teamId }: { teamId: number }) => {
  const { data: messages } = useQuery({
    queryKey: ["messages", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles:user_profiles!messages_sender_id_fkey (
            full_name,
            user_id
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MessageWithProfile[];
    },
  });

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {messages?.map((message) => (
          <div key={message.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                  message.profiles?.full_name || ""
                }`}
              />
              <AvatarFallback>
                {(message.profiles?.full_name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {message.profiles?.full_name || "Anonymous"}
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
