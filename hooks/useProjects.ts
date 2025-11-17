import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../lib/types';
import { useAuth } from './useAuth';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    fetchProjects();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  async function fetchProjects() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: true }); // Order by created_at to show Drafts first

      if (fetchError) throw fetchError;

      // If user has no projects, create a default "Drafts" project
      if (!data || data.length === 0) {
        console.log('No projects found, creating Drafts project...');
        const draftsProject = await createProject('Drafts');
        if (draftsProject) {
          setProjects([draftsProject]);
        } else {
          setProjects([]);
        }
      } else {
        setProjects(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function createProject(name: string, description?: string) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description: description || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    try {
      const { data, error } = await supabase
        .from('projects')
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

  async function deleteProject(id: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
