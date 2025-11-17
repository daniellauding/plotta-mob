import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tag } from './useTags';

export function useStickyTags(stickyId: string, userId: string | undefined) {
  const [stickyTags, setStickyTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip if no valid stickyId (local stickies)
    if (!stickyId || !stickyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      setLoading(false);
      return;
    }

    loadStickyTags();

    // Subscribe to real-time tag assignment changes
    const channel = supabase
      .channel(`sticky-tags-${stickyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sticky_tags',
          filter: `sticky_id=eq.${stickyId}`,
        },
        () => {
          loadStickyTags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stickyId, userId]);

  const loadStickyTags = async () => {
    try {
      // Join sticky_tags with tags to get full tag details
      const { data, error } = await supabase
        .from('sticky_tags')
        .select('tag_id, tags(*)')
        .eq('sticky_id', stickyId);

      if (error) throw error;

      // Extract tag objects from join result
      const tags = (data || [])
        .map((item: any) => item.tags)
        .filter(Boolean);

      setStickyTags(tags);
    } catch (error) {
      console.error('Error loading sticky tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (tagId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('sticky_tags')
        .insert({
          sticky_id: stickyId,
          tag_id: tagId,
        });

      // Ignore duplicate key error (23505)
      if (error && error.code !== '23505') {
        throw error;
      }
    } catch (error: any) {
      console.error('Error adding tag to sticky:', error);
    }
  };

  const removeTag = async (tagId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('sticky_tags')
        .delete()
        .eq('sticky_id', stickyId)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing tag from sticky:', error);
    }
  };

  return {
    stickyTags,
    loading,
    addTag,
    removeTag,
  };
}
