import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Reply, ThumbsUp, ThumbsDown, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  comment_type: 'comment' | 'suggestion' | 'approval' | 'rejection';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_email?: string;
  replies?: DocumentComment[];
}

interface DocumentCommentsProps {
  documentId: string;
  canComment?: boolean;
}

export function DocumentComments({ documentId, canComment = true }: DocumentCommentsProps) {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<DocumentComment['comment_type']>('comment');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (documentId) {
      fetchComments();
    }
  }, [documentId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tp_document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentsWithReplies = organizeComments(data || []);
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = (allComments: DocumentComment[]): DocumentComment[] => {
    const commentMap = new Map<string, DocumentComment>();
    const rootComments: DocumentComment[] = [];

    // First pass: create map and add user emails (simplified)
    allComments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        user_email: 'user@example.com', // In real implementation, join with user data
        comment_type: comment.comment_type as 'comment' | 'suggestion' | 'approval' | 'rejection',
        replies: []
      });
    });

    // Second pass: organize into threads
    allComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const { error } = await supabase
        .from('tp_document_comments')
        .insert({
          document_id: documentId,
          user_id: 'current-user-id', // Replace with actual user ID
          content: newComment,
          comment_type: commentType,
          metadata: {}
        });

      if (error) throw error;

      toast.success('Comment added successfully');
      setNewComment('');
      setCommentType('comment');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const addReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const { error } = await supabase
        .from('tp_document_comments')
        .insert({
          document_id: documentId,
          user_id: 'current-user-id', // Replace with actual user ID
          parent_comment_id: parentId,
          content: replyContent,
          comment_type: 'comment',
          metadata: {}
        });

      if (error) throw error;

      toast.success('Reply added successfully');
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const getCommentTypeColor = (type: DocumentComment['comment_type']) => {
    const colors = {
      comment: 'bg-blue-100 text-blue-800',
      suggestion: 'bg-yellow-100 text-yellow-800',
      approval: 'bg-green-100 text-green-800',
      rejection: 'bg-red-100 text-red-800'
    };
    return colors[type];
  };

  const getCommentTypeIcon = (type: DocumentComment['comment_type']) => {
    switch (type) {
      case 'approval': return <ThumbsUp className="h-3 w-3" />;
      case 'rejection': return <ThumbsDown className="h-3 w-3" />;
      case 'suggestion': return <MessageSquare className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const renderComment = (comment: DocumentComment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''} space-y-3`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{comment.user_email}</span>
            <Badge className={`${getCommentTypeColor(comment.comment_type)} flex items-center gap-1`}>
              {getCommentTypeIcon(comment.comment_type)}
              {comment.comment_type}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm bg-muted p-3 rounded-lg">{comment.content}</p>
          
          {canComment && !isReply && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}

          {replyingTo === comment.id && (
            <div className="space-y-2 mt-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => addReply(comment.id)}>
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Reviews
          <Badge variant="outline">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canComment && (
          <div className="space-y-4 p-4 border border-dashed border-muted-foreground rounded-lg">
            <div className="flex items-center space-x-4">
              <Select value={commentType} onValueChange={(value) => setCommentType(value as DocumentComment['comment_type'])}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="rejection">Rejection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or review..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button onClick={addComment}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
}