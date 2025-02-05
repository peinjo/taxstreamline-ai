
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Comment } from "@/types";

interface CommentListProps {
  documentId: string;
}

export const CommentList: React.FC<CommentListProps> = ({ documentId }) => {
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_comments")
        .select("*, user:user_profiles(full_name)")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comment[];
    }
  });

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {comments?.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback>
              {comment.user?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {comment.user?.full_name || "Unknown User"}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="mt-1 text-gray-700">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
