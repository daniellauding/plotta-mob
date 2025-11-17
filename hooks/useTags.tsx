import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export interface Tag {
  id: string;
  name: string;
  color: string;
  project_id: string;
  created_at: string;
}

export function useTags(projectId: string, userId: string | undefined) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip if no valid projectId (local projects)
    if (!projectId || !projectId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      setLoading(false);
      return;
    }

    loadTags();

    // Subscribe to real-time tag changes
    const channel = supabase
      .channel(`tags-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tags',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          loadTags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, userId]);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('project_id', projectId)
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string, color: string): Promise<string | null> => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create tags');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: name.trim(),
          color,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating tag:', error);
      Alert.alert('Error', error.message || 'Failed to create tag');
      return null;
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to delete tags');
      return;
    }

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      Alert.alert('Error', error.message || 'Failed to delete tag');
    }
  };

  return {
    tags,
    loading,
    createTag,
    deleteTag,
  };
}
