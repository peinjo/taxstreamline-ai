```typescript
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquarePlus } from "lucide-react";

export const CommentInput = ({ documentId }: { documentId: string }) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddComment = async () => {
    if (!content.trim()) return;

    try {
      const { error } = await supabase.from("document_comments").insert([
        {
          content,
          document_id: documentId,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setContent("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="min-h-[80px]"
      />
      <Button onClick={handleAddComment} className="self-end">
        <MessageSquarePlus className="h-4 w-4" />
      </Button>
    </div>
  );
};
```
