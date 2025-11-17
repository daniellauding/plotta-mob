import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Comment {
  id: string;
  sticky_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
}

export const useComments = (stickyId: string, userId: string | undefined) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if stickyId is a valid UUID
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stickyId);

  useEffect(() => {
    if (!isValidUUID) return;

    const loadComments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sticky_comments')
          .select('*')
          .eq('sticky_id', stickyId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Get usernames for all comments
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(c => c.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);

          const commentsWithUsernames = data.map(comment => ({
            ...comment,
            username: profiles?.find(p => p.id === comment.user_id)?.username || 'Anonymous',
          }));

          setComments(commentsWithUsernames);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    loadComments();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`comments-${stickyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sticky_comments',
          filter: `sticky_id=eq.${stickyId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stickyId, isValidUUID]);

  const addComment = async (content: string, parentId: string | null = null) => {
    if (!userId || !isValidUUID) return;

    try {
      const { error } = await supabase
        .from('sticky_comments')
        .insert({
          sticky_id: stickyId,
          user_id: userId,
          parent_id: parentId,
          content,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('sticky_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
  };
};
