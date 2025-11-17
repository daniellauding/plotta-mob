import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useProjects } from '../../hooks/useProjects';
import { useTheme } from '../../hooks/useTheme';
import { Project } from '../../lib/types';

export default function ProjectsScreen() {
  const { projects, loading, createProject, deleteProject, refetch } = useProjects();
  const { theme, isDark } = useTheme();
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Auto-navigate to Drafts project if it exists and user hasn't manually navigated
  useEffect(() => {
    if (!loading && projects.length > 0 && !hasNavigated) {
      const draftsProject = projects.find(p => p.name === 'Drafts');
      if (draftsProject) {
        console.log('Auto-navigating to Drafts project');
        setHasNavigated(true);
        router.push(`/canvas/${draftsProject.id}`);
      }
    }
  }, [projects, loading, hasNavigated]);

  async function handleCreateProject() {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      setCreating(true);
      const newProject = await createProject(projectName, projectDescription);
      setProjectName('');
      setProjectDescription('');
      setShowNewProject(false);
      if (newProject) {
        router.push(`/canvas/${newProject.id}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(id: string, name: string) {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function renderProject({ item }: { item: Project }) {
    return (
      <TouchableOpacity
        style={[styles.projectCard, { backgroundColor: theme.colors.card, ...theme.shadows.md }]}
        onPress={() => router.push(`/canvas/${item.id}`)}
      >
        <View style={styles.projectInfo}>
          <Text style={[styles.projectName, { color: theme.colors.foreground }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.projectDescription, { color: theme.colors.mutedForeground }]}>{item.description}</Text>
          )}
          <Text style={[styles.projectDate, { color: theme.colors.mutedForeground }]}>
            Updated {new Date(item.updated_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProject(item.id, item.name)}
        >
          <FontAwesome name="trash" size={20} color={theme.colors.destructive} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="folder-open-o" size={64} color={theme.colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>No projects yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.mutedForeground }]}>
              Create your first project to get started
            </Text>
          </View>
        }
      />

      {showNewProject && (
        <View style={[styles.newProjectCard, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.muted, color: theme.colors.foreground }]}
            placeholder="Project name"
            placeholderTextColor={theme.colors.mutedForeground}
            value={projectName}
            onChangeText={setProjectName}
            editable={!creating}
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.muted, color: theme.colors.foreground }]}
            placeholder="Description (optional)"
            placeholderTextColor={theme.colors.mutedForeground}
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={3}
            editable={!creating}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.muted }]}
              onPress={() => {
                setShowNewProject(false);
                setProjectName('');
                setProjectDescription('');
              }}
              disabled={creating}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton, { backgroundColor: theme.colors.primary }, creating && styles.buttonDisabled]}
              onPress={handleCreateProject}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={theme.colors.primaryForeground} />
              ) : (
                <Text style={[styles.createButtonText, { color: theme.colors.primaryForeground }]}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary, ...theme.shadows.lg }]}
        onPress={() => setShowNewProject(true)}
      >
        <FontAwesome name="plus" size={24} color={theme.colors.primaryForeground} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  newProjectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
