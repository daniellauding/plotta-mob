import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../lib/types';

interface ProjectDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentProjectId?: string;
}

export default function ProjectDrawer({ visible, onClose, currentProjectId }: ProjectDrawerProps) {
  const { theme } = useTheme();
  const { projects, createProject } = useProjects();
  const [creatingProject, setCreatingProject] = React.useState(false);

  async function handleSelectProject(projectId: string) {
    onClose();
    router.push(`/canvas/${projectId}`);
  }

  async function handleCreateProject() {
    try {
      setCreatingProject(true);
      const newProject = await createProject(`Project ${projects.length + 1}`);
      if (newProject) {
        onClose();
        router.push(`/canvas/${newProject.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreatingProject(false);
    }
  }

  function renderProject({ item }: { item: Project }) {
    const isActive = item.id === currentProjectId;
    return (
      <TouchableOpacity
        style={[
          styles.projectItem,
          {
            backgroundColor: isActive ? theme.colors.secondary : 'transparent',
            borderLeftWidth: isActive ? 4 : 0,
            borderLeftColor: theme.colors.primary,
          },
        ]}
        onPress={() => handleSelectProject(item.id)}
      >
        <FontAwesome
          name="folder"
          size={20}
          color={isActive ? theme.colors.primary : theme.colors.mutedForeground}
          style={styles.projectIcon}
        />
        <View style={styles.projectInfo}>
          <Text
            style={[
              styles.projectName,
              {
                color: isActive ? theme.colors.foreground : theme.colors.mutedForeground,
                fontWeight: isActive ? '600' : '400',
              },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.description && (
            <Text
              style={[styles.projectDescription, { color: theme.colors.mutedForeground }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.drawer, { backgroundColor: theme.colors.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'bottom']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>
                Projects
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Projects List */}
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.projectsList}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <FontAwesome name="folder-open-o" size={48} color={theme.colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                    No projects yet
                  </Text>
                </View>
              }
            />

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateProject}
                disabled={creatingProject}
              >
                <FontAwesome name="plus" size={16} color={theme.colors.primaryForeground} />
                <Text style={[styles.createButtonText, { color: theme.colors.primaryForeground }]}>
                  New Project
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileButton, { backgroundColor: theme.colors.secondary }]}
                onPress={() => {
                  onClose();
                  router.push('/(tabs)/profile');
                }}
              >
                <FontAwesome name="user" size={16} color={theme.colors.foreground} />
                <Text style={[styles.profileButtonText, { color: theme.colors.foreground }]}>
                  Profile
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  drawer: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  projectsList: {
    paddingVertical: 8,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 12,
  },
  projectIcon: {
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 12,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
