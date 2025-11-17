import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  stickyId: string;
  userId: string | undefined;
  visible: boolean;
  onClose: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ stickyId, userId, visible, onClose }) => {
  const { comments, addComment, deleteComment } = useComments(stickyId, userId);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  if (!visible) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(newComment, replyTo);
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Organize comments into threads
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter(c => c.parent_id === parentId);

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <View style={styles.commentHeader}>
        <Text style={styles.username}>{comment.username}</Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </Text>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <View style={styles.commentActions}>
        {!isReply && (
          <TouchableOpacity onPress={() => setReplyTo(comment.id)}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        )}
        {comment.user_id === userId && (
          <TouchableOpacity onPress={() => handleDelete(comment.id)}>
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Render replies */}
      {!isReply && getReplies(comment.id).map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}

      {/* Reply input */}
      {replyTo === comment.id && (
        <View style={styles.replyInput}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a reply..."
            multiline
          />
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.button} onPress={handleAddComment}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setReplyTo(null);
                setNewComment('');
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments ({comments.length})</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.commentsList}>
        {topLevelComments.length === 0 ? (
          <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
        ) : (
          topLevelComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </ScrollView>

      {/* New comment input (only show if not replying) */}
      {!replyTo && (
        <View style={styles.newCommentContainer}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            multiline
          />
          <TouchableOpacity
            style={[styles.button, !newComment.trim() && styles.buttonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  replyItem: {
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
  },
  deleteText: {
    color: '#FF3B30',
  },
  replyInput: {
    marginTop: 12,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  newCommentContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
