import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface Comment {
  id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user_email?: string;
}

interface CommentsSheetProps {
  stickyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsSheet({
  stickyId,
  isOpen,
  onClose,
}: CommentsSheetProps) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadComments();

      // Subscribe to real-time comments
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
    }
  }, [isOpen, stickyId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('sticky_comments')
        .select('*')
        .eq('sticky_id', stickyId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user emails for each comment
      if (data) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: users } = await supabase.auth.admin.listUsers();

        const commentsWithEmails = data.map(comment => ({
          ...comment,
          user_email: users?.users.find(u => u.id === comment.user_id)?.email || 'Anonymous',
        }));

        setComments(commentsWithEmails);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id || loading) return;

    try {
      setLoading(true);

      const { error } = await supabase.from('sticky_comments').insert({
        sticky_id: stickyId,
        user_id: user.id,
        parent_id: replyTo,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('sticky_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwnComment = item.user_id === user?.id;
    const replies = comments.filter(c => c.parent_id === item.id);
    const isReply = !!item.parent_id;

    return (
      <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: theme.colors.foreground }]}>
            {item.user_email?.split('@')[0] || 'Anonymous'}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.mutedForeground }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={[styles.commentContent, { color: theme.colors.foreground }]}>
          {item.content}
        </Text>

        <View style={styles.commentActions}>
          {!isReply && (
            <TouchableOpacity
              onPress={() => setReplyTo(item.id)}
              style={styles.actionButton}
            >
              <FontAwesome
                name="reply"
                size={12}
                color={theme.colors.mutedForeground}
              />
              <Text
                style={[styles.actionText, { color: theme.colors.mutedForeground }]}
              >
                Reply
              </Text>
            </TouchableOpacity>
          )}

          {isOwnComment && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id)}
              style={styles.actionButton}
            >
              <FontAwesome
                name="trash"
                size={12}
                color={theme.colors.destructive}
              />
              <Text style={[styles.actionText, { color: theme.colors.destructive }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map(reply => (
              <View key={reply.id}>{renderComment({ item: reply })}</View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            Comments ({comments.length})
          </Text>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="times" size={20} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={topLevelComments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome
                name="comments-o"
                size={48}
                color={theme.colors.muted}
              />
              <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                No comments yet
              </Text>
            </View>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View style={[styles.inputContainer, { borderTopColor: theme.colors.border }]}>
            {replyTo && (
              <View style={[styles.replyingTo, { backgroundColor: theme.colors.muted }]}>
                <Text style={[styles.replyingToText, { color: theme.colors.foreground }]}>
                  Replying to{' '}
                  {comments.find(c => c.id === replyTo)?.user_email?.split('@')[0]}
                </Text>
                <TouchableOpacity onPress={() => setReplyTo(null)}>
                  <FontAwesome
                    name="times"
                    size={14}
                    color={theme.colors.foreground}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.muted,
                    color: theme.colors.foreground,
                  },
                ]}
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.mutedForeground}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newComment.trim() || loading}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: newComment.trim()
                      ? theme.colors.primary
                      : theme.colors.muted,
                  },
                ]}
              >
                <FontAwesome
                  name="send"
                  size={16}
                  color={
                    newComment.trim()
                      ? theme.colors.primaryForeground
                      : theme.colors.mutedForeground
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  replyContainer: {
    marginLeft: 24,
    marginTop: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  repliesContainer: {
    marginTop: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 16,
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
