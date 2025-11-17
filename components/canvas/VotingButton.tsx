import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface VotingButtonProps {
  stickyId: string;
}

export default function VotingButton({ stickyId }: VotingButtonProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVotes();

    // Subscribe to real-time vote changes
    const channel = supabase
      .channel(`votes-${stickyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sticky_votes',
          filter: `sticky_id=eq.${stickyId}`,
        },
        () => {
          loadVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stickyId, user?.id]);

  const loadVotes = async () => {
    try {
      // Get vote count
      const { count } = await supabase
        .from('sticky_votes')
        .select('*', { count: 'exact', head: true })
        .eq('sticky_id', stickyId);

      setVoteCount(count || 0);

      // Check if current user has voted
      if (user?.id) {
        const { data } = await supabase
          .from('sticky_votes')
          .select('id')
          .eq('sticky_id', stickyId)
          .eq('user_id', user.id)
          .single();

        setHasVoted(!!data);
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleVote = async () => {
    if (!user?.id || loading) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (hasVoted) {
        // Remove vote (optimistic update)
        setVoteCount(prev => Math.max(0, prev - 1));
        setHasVoted(false);

        await supabase
          .from('sticky_votes')
          .delete()
          .eq('sticky_id', stickyId)
          .eq('user_id', user.id);
      } else {
        // Add vote (optimistic update)
        setVoteCount(prev => prev + 1);
        setHasVoted(true);

        await supabase.from('sticky_votes').insert({
          sticky_id: stickyId,
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
      // Revert optimistic update on error
      loadVotes();
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        handleVote();
      }}
      disabled={!user || loading}
      style={[styles.container, { opacity: loading ? 0.5 : 1 }]}
    >
      <FontAwesome
        name={hasVoted ? 'thumbs-up' : 'thumbs-o-up'}
        size={14}
        color={hasVoted ? theme.colors.primary : theme.colors.mutedForeground}
      />
      {voteCount > 0 && (
        <Text
          style={[
            styles.count,
            {
              color: hasVoted ? theme.colors.primary : theme.colors.mutedForeground,
            },
          ]}
        >
          {voteCount}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
  },
});
