import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useTags } from '../../hooks/useTags';
import { useAuth } from '../../hooks/useAuth';

interface TagManagerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
];

export default function TagManager({ projectId, isOpen, onClose }: TagManagerProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { tags, createTag, deleteTag, loading } = useTags(projectId, user?.id);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      setCreating(true);
      const tagId = await createTag(newTagName.trim(), selectedColor);
      if (tagId) {
        setNewTagName('');
        setSelectedColor(TAG_COLORS[0]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = (tagId: string, tagName: string) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tagName}"? This will remove it from all sticky notes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTag(tagId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

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
            Manage Tags
          </Text>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="times" size={20} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Create New Tag Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
              Create New Tag
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.muted,
                  color: theme.colors.foreground,
                },
              ]}
              placeholder="Tag name"
              placeholderTextColor={theme.colors.mutedForeground}
              value={newTagName}
              onChangeText={setNewTagName}
              editable={!creating}
            />

            <Text style={[styles.label, { color: theme.colors.foreground }]}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {TAG_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedColor(color);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={creating}
                >
                  {selectedColor === color && (
                    <FontAwesome name="check" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: !newTagName.trim() || creating ? 0.5 : 1,
                },
              ]}
              onPress={handleCreateTag}
              disabled={!newTagName.trim() || creating}
            >
              <FontAwesome name="plus" size={16} color={theme.colors.primaryForeground} />
              <Text style={[styles.createButtonText, { color: theme.colors.primaryForeground }]}>
                {creating ? 'Creating...' : 'Create Tag'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Existing Tags Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
              Existing Tags ({tags.length})
            </Text>

            {tags.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome name="tag" size={48} color={theme.colors.muted} />
                <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                  No tags yet
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.mutedForeground }]}>
                  Create your first tag above
                </Text>
              </View>
            ) : (
              <View style={styles.tagsList}>
                {tags.map((tag) => (
                  <View
                    key={tag.id}
                    style={[styles.tagItem, { borderBottomColor: theme.colors.border }]}
                  >
                    <View style={[styles.tagBadge, { backgroundColor: tag.color }]}>
                      <Text style={styles.tagName}>{tag.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteTag(tag.id, tag.name)}
                      style={styles.deleteButton}
                    >
                      <FontAwesome name="trash" size={14} color={theme.colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  tagsList: {
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
});
