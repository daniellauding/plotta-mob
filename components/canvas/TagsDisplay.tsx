import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useStickyTags } from '../../hooks/useStickyTags';
import { useTags } from '../../hooks/useTags';
import { useAuth } from '../../hooks/useAuth';

interface TagsDisplayProps {
  stickyId: string;
  projectId: string;
}

export default function TagsDisplay({ stickyId, projectId }: TagsDisplayProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { stickyTags, addTag, removeTag } = useStickyTags(stickyId, user?.id);
  const { tags: allTags } = useTags(projectId, user?.id);
  const [showTagPicker, setShowTagPicker] = useState(false);

  // Get tags that are not yet assigned to this sticky
  const availableTags = allTags.filter(
    (tag) => !stickyTags.find((st) => st.id === tag.id)
  );

  const handleRemoveTag = async (tagId: string) => {
    await removeTag(tagId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddTag = async (tagId: string) => {
    await addTag(tagId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (availableTags.length === 1) {
      setShowTagPicker(false);
    }
  };

  if (stickyTags.length === 0 && availableTags.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        {/* Display assigned tags */}
        {stickyTags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[styles.tag, { backgroundColor: tag.color }]}
            onPress={() => handleRemoveTag(tag.id)}
          >
            <Text style={styles.tagText}>{tag.name}</Text>
            <FontAwesome name="times" size={10} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ))}

        {/* Add tag button */}
        {availableTags.length > 0 && (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowTagPicker(true)}
          >
            <FontAwesome name="plus" size={10} color={theme.colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tag Picker Modal */}
      <Modal
        visible={showTagPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTagPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTagPicker(false)}
        >
          <View
            style={[styles.pickerContainer, { backgroundColor: theme.colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.pickerHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.pickerTitle, { color: theme.colors.foreground }]}>
                Add Tag
              </Text>
              <TouchableOpacity onPress={() => setShowTagPicker(false)}>
                <FontAwesome name="times" size={18} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerContent}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.pickerTag, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handleAddTag(tag.id)}
                >
                  <View style={[styles.tagBadge, { backgroundColor: tag.color }]}>
                    <Text style={styles.tagText}>{tag.name}</Text>
                  </View>
                  <FontAwesome name="plus" size={14} color={theme.colors.mutedForeground} />
                </TouchableOpacity>
              ))}
              {availableTags.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                  All tags are already assigned
                </Text>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContent: {
    padding: 16,
  },
  pickerTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
});
