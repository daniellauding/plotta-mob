import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sticky, StickyColor } from '../lib/types';
import { useAuth } from './useAuth';

export function useStickies(projectId: string | null) {
  const { user } = useAuth();
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !user) {
      setStickies([]);
      setLoading(false);
      return;
    }

    fetchStickies();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`stickies_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stickies',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('📡 Realtime update:', payload.eventType, payload.new?.id);
          if (payload.eventType === 'INSERT') {
            setStickies((prev) => [...prev, payload.new as Sticky]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ Updating sticky:', payload.new?.title);
            setStickies((prev) =>
              prev.map((sticky) =>
                sticky.id === payload.new.id ? (payload.new as Sticky) : sticky
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setStickies((prev) =>
              prev.filter((sticky) => sticky.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId, user]);

  async function fetchStickies() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stickies')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Filter out welcome notes if user has dismissed them
      if (user?.id) {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const welcomeDismissed = await AsyncStorage.getItem(`welcome_dismissed_${user.id}`);

          if (welcomeDismissed) {
            const filteredData = (data || []).filter(s => !s.title?.includes('Welcome to'));
            console.log('🚫 Filtered out dismissed welcome notes from database');
            setStickies(filteredData);
          } else {
            setStickies(data || []);
          }
        } catch (error) {
          console.error('Failed to check welcome dismissed flag:', error);
          setStickies(data || []);
        }
      } else {
        setStickies(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function createSticky(data: {
    title?: string;
    content?: string;
    color?: StickyColor;
    position_x?: number;
    position_y?: number;
    width?: number;
    height?: number;
    priority?: string | null;
    due_date?: string | null;
    status?: string | null;
  }) {
    if (!user || !projectId) return;

    try {
      const { data: newSticky, error } = await supabase
        .from('stickies')
        .insert({
          project_id: projectId,
          user_id: user.id,           // Required for RLS delete policy
          created_by: user.id,        // Additional tracking field
          title: data.title || '',
          content: data.content || '',
          color: data.color || 'yellow',
          position_x: data.position_x ?? 0,
          position_y: data.position_y ?? 0,
          width: data.width || 300,
          height: data.height || 250,
          z_index: 0,
          is_locked: false,
          is_pinned: false,
          is_hidden: false,
          priority: data.priority || null,
          due_date: data.due_date || null,
          status: data.status || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newSticky;
    } catch (err) {
      throw err;
    }
  }

  async function updateSticky(id: string, updates: Partial<Sticky>) {
    try {
      const { data, error } = await supabase
        .from('stickies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function deleteSticky(id: string) {
    if (!user) return;

    // Optimistically remove from UI immediately
    const deletedSticky = stickies.find(s => s.id === id);
    console.log('🗑️ Deleting sticky:', deletedSticky?.title);

    // If deleting a welcome note, mark it as dismissed
    if (deletedSticky?.title?.includes('Welcome to')) {
      try {
        // Use AsyncStorage for React Native (equivalent to localStorage)
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(`welcome_dismissed_${user.id}`, 'true');
        console.log('✅ Marked welcome note as dismissed for user:', user.id);
      } catch (error) {
        console.error('Failed to save welcome dismissed flag:', error);
      }
    }

    setStickies(prev => {
      const filtered = prev.filter(s => s.id !== id);
      console.log('✂️ Optimistically removed from UI, remaining:', filtered.length);
      return filtered;
    });

    try {
      console.log('🔄 Sending delete request to database...');
      const { error } = await supabase
        .from('stickies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Database delete error:', error);
        throw error;
      }

      console.log('✅ Successfully deleted from database');

      // If it's a welcome note, clean up ALL welcome notes
      if (deletedSticky?.title?.includes('Welcome to')) {
        console.log('🧹 Cleaning up all welcome notes from database...');
        const { error: cleanupError } = await supabase
          .from('stickies')
          .delete()
          .eq('created_by', user.id)
          .ilike('title', '%Welcome to%');

        if (cleanupError) {
          console.error('Failed to cleanup welcome notes:', cleanupError);
        } else {
          console.log('✅ Cleaned up all welcome notes');
        }
      }
    } catch (err) {
      console.error('❌ Error deleting sticky:', err);
      // Revert optimistic update on error
      if (deletedSticky) {
        console.log('↩️ Reverting optimistic update');
        setStickies(prev => [...prev, deletedSticky]);
      }
      throw err;
    }
  }

  return {
    stickies,
    loading,
    error,
    createSticky,
    updateSticky,
    deleteSticky,
    refetch: fetchStickies,
  };
}
