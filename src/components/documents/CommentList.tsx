import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CommentList = ({ documentId }: { documentId: string }) => {
  const { data: comments } = useQuery({
    queryKey: ["document-comments", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_comments")
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `)
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.email}`} />
              <AvatarFallback>
                {comment.user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {comment.user?.email}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(comment.created_at), "PPp")}
              </p>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
