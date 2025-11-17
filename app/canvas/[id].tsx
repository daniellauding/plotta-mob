import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStickies } from '../../hooks/useStickies';
import { useTheme } from '../../hooks/useTheme';
import { useTags } from '../../hooks/useTags';
import StickyNote from '../../components/canvas/StickyNote';
import TagManager from '../../components/canvas/TagManager';
import { FilterBar } from '../../components/canvas/FilterBar';
import ViewModeSelector, { ViewMode } from '../../components/canvas/ViewModeSelector';
import ProjectDrawer from '../../components/canvas/ProjectDrawer';
import FloatingActionButton from '../../components/canvas/FloatingActionButton';
import ProjectSettings from '../../components/canvas/ProjectSettings';
import AIAssistant from '../../components/canvas/AIAssistant';
import ArrangeDialog from '../../components/canvas/ArrangeDialog';
import HelpModal from '../../components/canvas/HelpModal';
import { STICKY_COLORS, getStickyColor, StickyColorValue } from '../../lib/theme';
import { StickyColor } from '../../lib/types';
import { useProjects } from '../../hooks/useProjects';

export default function CanvasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stickies, createSticky, loading } = useStickies(id);
  const { tags } = useTags(id);
  const { theme, colorScheme } = useTheme();
  const { projects } = useProjects();

  const currentProject = projects.find(p => p.id === id);

  const [showNewNote, setShowNewNote] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showArrangeDialog, setShowArrangeDialog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<StickyColorValue>('yellow');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [creating, setCreating] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(0);

  // Filter and View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedDueDates, setSelectedDueDates] = useState<string[]>([]);

  // Load preferences on mount
  useEffect(() => {
    if (!id) return;

    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem(`project_view_${id}`);
        if (saved) {
          const prefs = JSON.parse(saved);
          setViewMode(prefs.viewMode || 'all');
          setSelectedTagIds(prefs.selectedTagIds || []);
          setSelectedPriorities(prefs.selectedPriorities || []);
          setSelectedDueDates(prefs.selectedDueDates || []);
        }
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    };

    loadPreferences();
  }, [id]);

  // Save preferences on change
  useEffect(() => {
    if (!id) return;

    const savePreferences = async () => {
      try {
        const prefs = {
          viewMode,
          selectedTagIds,
          selectedPriorities,
          selectedDueDates,
        };
        await AsyncStorage.setItem(`project_view_${id}`, JSON.stringify(prefs));
      } catch (e) {
        console.error('Failed to save preferences:', e);
      }
    };

    savePreferences();
  }, [id, viewMode, selectedTagIds, selectedPriorities, selectedDueDates]);

  // Update maxZIndex when stickies change
  useEffect(() => {
    if (stickies.length > 0) {
      const max = Math.max(...stickies.map(s => s.z_index || 0));
      setMaxZIndex(max);
    }
  }, [stickies]);

  // Apply view mode filter
  const viewFilteredStickies = useMemo(() => {
    if (viewMode === 'all') return stickies;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return stickies.filter((sticky) => {
      if (!sticky.due_date) {
        // Notes without due date only show in "all", "today", and "week"
        return viewMode === 'today' || viewMode === 'week';
      }

      const dueDate = new Date(sticky.due_date);
      dueDate.setHours(0, 0, 0, 0);

      switch (viewMode) {
        case 'today':
          return dueDate.getTime() === today.getTime();
        case 'week':
          return dueDate >= today && dueDate <= nextWeek;
        case 'snoozed':
          return dueDate > today;
        case 'later':
          return dueDate > sevenDaysLater;
        default:
          return true;
      }
    });
  }, [stickies, viewMode]);

  // Apply tag, priority, and date filters
  const filteredStickies = useMemo(() => {
    let result = viewFilteredStickies;

    // Tag filter
    if (selectedTagIds.length > 0) {
      result = result.filter((sticky) =>
        sticky.sticky_tags?.some((st: any) => selectedTagIds.includes(st.tag_id))
      );
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      result = result.filter(
        (sticky) => sticky.priority && selectedPriorities.includes(sticky.priority)
      );
    }

    // Date filter
    if (selectedDueDates.length > 0) {
      result = result.filter((sticky) => {
        if (!sticky.due_date && selectedDueDates.includes('no_date')) return true;

        if (!sticky.due_date) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(sticky.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (selectedDueDates.includes('overdue') && dueDate < today) return true;
        if (selectedDueDates.includes('today') && dueDate.getTime() === today.getTime())
          return true;
        if (
          selectedDueDates.includes('tomorrow') &&
          dueDate.getTime() === new Date(today.getTime() + 86400000).getTime()
        )
          return true;
        if (
          selectedDueDates.includes('this_week') &&
          dueDate >= today &&
          dueDate <= new Date(today.getTime() + 7 * 86400000)
        )
          return true;

        return false;
      });
    }

    return result;
  }, [viewFilteredStickies, selectedTagIds, selectedPriorities, selectedDueDates]);

  const clearAllFilters = () => {
    setSelectedTagIds([]);
    setSelectedPriorities([]);
    setSelectedDueDates([]);
  };

  // Canvas pan and zoom
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      // Limit zoom between 0.5x and 3x
      if (newScale < 0.5) {
        scale.value = 0.5;
      } else if (newScale > 3) {
        scale.value = 3;
      } else {
        scale.value = newScale;
      }
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      // Reset zoom to 1
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composed = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  async function handleCreateNote() {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) {
      Alert.alert('Error', 'Please enter a title or content');
      return;
    }

    try {
      setCreating(true);
      console.log('🎨 Creating note with:', {
        title: newNoteTitle,
        content: newNoteContent,
        color: selectedColor,
        priority: selectedPriority,
        status: selectedStatus,
        due_date: selectedDueDate?.toISOString()
      });
      await createSticky({
        title: newNoteTitle,
        content: newNoteContent,
        color: selectedColor,
        position_x: Math.round(Math.random() * 300),
        position_y: Math.round(Math.random() * 300),
        width: 300,
        height: 250,
        priority: selectedPriority,
        status: selectedStatus,
        due_date: selectedDueDate?.toISOString() || null,
      });
      console.log('✅ Note created successfully');
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNewNote(false);
      setSelectedColor('yellow');
      setSelectedPriority(null);
      setSelectedStatus(null);
      setSelectedDueDate(null);
    } catch (error) {
      console.error('❌ Failed to create note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
      Alert.alert('Error', `Failed to create note: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleImageSelected(imageUri: string) {
    try {
      // Create a new sticky note with the image embedded in markdown
      await createSticky({
        title: 'Image',
        content: `![Image](${imageUri})`,
        color: 'default',
        position_x: Math.round(Math.random() * 300),
        position_y: Math.round(Math.random() * 300),
        width: 300,
        height: 300,
      });
      Alert.alert('Success', 'Image added to canvas');
    } catch (error) {
      Alert.alert('Error', 'Failed to add image');
    }
  }

  async function handleCreateStickyFromAI(content: { title: string; content: string }) {
    try {
      await createSticky({
        title: content.title,
        content: content.content,
        color: 'default',
        position_x: Math.round(Math.random() * 300),
        position_y: Math.round(Math.random() * 300),
        width: 300,
        height: 300,
      });
    } catch (error) {
      console.error('Error creating AI note:', error);
      Alert.alert('Error', 'Failed to create AI-generated note');
    }
  }

  async function handleArrange(arrangedStickies: any[]) {
    try {
      // Update each sticky's position in the database
      for (const sticky of arrangedStickies) {
        await createSticky({
          ...sticky,
          position_x: Math.round(sticky.position_x),
          position_y: Math.round(sticky.position_y),
        });
      }
      Alert.alert('Success', 'Notes arranged successfully');
    } catch (error) {
      console.error('Error arranging notes:', error);
      Alert.alert('Error', 'Failed to arrange notes');
    }
  }

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.foreground} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Canvas',
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.foreground,
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 16 }}>
              <TouchableOpacity onPress={() => setShowProjectDrawer(true)}>
                <FontAwesome
                  name="bars"
                  size={20}
                  color={theme.colors.foreground}
                />
              </TouchableOpacity>
              <ViewModeSelector mode={viewMode} onChange={setViewMode} />
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 16 }}>
              <FilterBar
                tags={tags}
                selectedTagIds={selectedTagIds}
                selectedPriorities={selectedPriorities}
                selectedDueDates={selectedDueDates}
                onTagsChange={setSelectedTagIds}
                onPrioritiesChange={setSelectedPriorities}
                onDueDatesChange={setSelectedDueDates}
                onClearAll={clearAllFilters}
              />
              <TouchableOpacity onPress={() => setShowTagManager(true)}>
                <FontAwesome
                  name="tags"
                  size={20}
                  color={theme.colors.foreground}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAIAssistant(true)}>
                <FontAwesome
                  name="magic"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowProjectSettings(true)}>
                <FontAwesome
                  name="cog"
                  size={20}
                  color={theme.colors.foreground}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          {filteredStickies
            .filter((sticky) => !sticky.is_hidden)
            .map((sticky) => (
              <StickyNote
                key={sticky.id}
                sticky={sticky}
                maxZIndex={maxZIndex}
                onBringToFront={(newZIndex) => setMaxZIndex(newZIndex)}
              />
            ))}
        </Animated.View>
      </GestureDetector>

      {filteredStickies.length === 0 && stickies.length > 0 && (
        <View style={styles.emptyState}>
          <FontAwesome name="filter" size={64} color={theme.colors.muted} />
          <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
            No notes match filters
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.mutedForeground }]}>
            Try adjusting your filters
          </Text>
        </View>
      )}

      {stickies.length === 0 && (
        <View style={styles.emptyState}>
          <FontAwesome name="sticky-note-o" size={64} color={theme.colors.muted} />
          <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
            No sticky notes yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.mutedForeground }]}>
            Tap + to create your first note
          </Text>
        </View>
      )}

      {/* Tag Manager Modal */}
      <TagManager
        projectId={id}
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
      />

      {/* Project Drawer */}
      <ProjectDrawer
        visible={showProjectDrawer}
        onClose={() => setShowProjectDrawer(false)}
        currentProjectId={id}
      />

      {/* Project Settings */}
      {currentProject && (
        <ProjectSettings
          visible={showProjectSettings}
          onClose={() => setShowProjectSettings(false)}
          project={currentProject}
        />
      )}

      {/* AI Assistant */}
      <AIAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        stickies={stickies}
        projectId={id}
        onCreateSticky={handleCreateStickyFromAI}
      />

      {/* Arrange Dialog */}
      <ArrangeDialog
        visible={showArrangeDialog}
        onClose={() => setShowArrangeDialog(false)}
        stickies={filteredStickies}
        onArrange={handleArrange}
      />

      {/* Help Modal */}
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Floating Action Button Menu */}
      <FloatingActionButton
        onNewNote={() => setShowNewNote(true)}
        onImageSelected={handleImageSelected}
        onManageTags={() => setShowTagManager(true)}
        onArrange={() => setShowArrangeDialog(true)}
        onHelp={() => setShowHelp(true)}
        stickies={filteredStickies}
      />

      {/* Create Note Modal */}
      <Modal
        visible={showNewNote}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewNote(false)}
      >
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setShowNewNote(false)}>
              <Text style={[styles.cancelButton, { color: theme.colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.foreground }]}>
              New Note
            </Text>
            <TouchableOpacity onPress={handleCreateNote} disabled={creating}>
              <Text
                style={[
                  styles.createButton,
                  { color: theme.colors.primary },
                  creating && styles.buttonDisabled,
                ]}
              >
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: theme.colors.muted,
                  color: theme.colors.foreground,
                },
              ]}
              placeholder="Title"
              placeholderTextColor={theme.colors.mutedForeground}
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              editable={!creating}
            />

            <TextInput
              style={[
                styles.contentInput,
                {
                  backgroundColor: theme.colors.muted,
                  color: theme.colors.foreground,
                },
              ]}
              placeholder="Content"
              placeholderTextColor={theme.colors.mutedForeground}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!creating}
            />

            <Text style={[styles.colorLabel, { color: theme.colors.foreground }]}>
              Color
            </Text>
            <View style={styles.colorPicker}>
              {Object.values(STICKY_COLORS).map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: getStickyColor(
                        color.value as StickyColorValue,
                        colorScheme
                      ),
                      borderWidth: selectedColor === color.value ? 2 : 0,
                      borderColor: theme.colors.primary,
                    },
                    theme.shadows.sm,
                  ]}
                  onPress={() => setSelectedColor(color.value as StickyColorValue)}
                  disabled={creating}
                >
                  {selectedColor === color.value && (
                    <FontAwesome
                      name="check"
                      size={16}
                      color={theme.colors.foreground}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.colorLabel, { color: theme.colors.foreground, marginTop: 16 }]}>
              Priority (Optional)
            </Text>
            <View style={styles.colorPicker}>
              {[
                { value: 'low', label: 'Low', color: '#10b981' },
                { value: 'medium', label: 'Medium', color: '#f59e0b' },
                { value: 'high', label: 'High', color: '#f97316' },
                { value: 'critical', label: 'Critical', color: '#ef4444' },
              ].map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: selectedPriority === priority.value ? priority.color : theme.colors.muted,
                      borderWidth: selectedPriority === priority.value ? 2 : 1,
                      borderColor: selectedPriority === priority.value ? priority.color : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPriority(selectedPriority === priority.value ? null : priority.value)}
                  disabled={creating}
                >
                  <Text style={[
                    styles.priorityText,
                    { color: selectedPriority === priority.value ? '#fff' : theme.colors.foreground }
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.colorLabel, { color: theme.colors.foreground, marginTop: 16 }]}>
              Status (Optional)
            </Text>
            <View style={styles.colorPicker}>
              {[
                { value: 'todo', label: 'To Do', color: '#6b7280' },
                { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
                { value: 'done', label: 'Done', color: '#10b981' },
              ].map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: selectedStatus === status.value ? status.color : theme.colors.muted,
                      borderWidth: selectedStatus === status.value ? 2 : 1,
                      borderColor: selectedStatus === status.value ? status.color : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedStatus(selectedStatus === status.value ? null : status.value)}
                  disabled={creating}
                >
                  <Text style={[
                    styles.priorityText,
                    { color: selectedStatus === status.value ? '#fff' : theme.colors.foreground }
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.colorLabel, { color: theme.colors.foreground, marginTop: 16 }]}>
              Due Date (Optional)
            </Text>
            <View style={styles.colorPicker}>
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: 'This Week', days: 7 },
              ].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: selectedDueDate ? theme.colors.primary : theme.colors.muted,
                      borderWidth: selectedDueDate ? 2 : 1,
                      borderColor: selectedDueDate ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + option.days);
                    setSelectedDueDate(date);
                  }}
                  disabled={creating}
                >
                  <Text style={[
                    styles.priorityText,
                    { color: selectedDueDate ? '#fff' : theme.colors.foreground }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {selectedDueDate && (
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: theme.colors.destructive,
                      borderWidth: 1,
                      borderColor: theme.colors.destructive,
                    },
                  ]}
                  onPress={() => setSelectedDueDate(null)}
                  disabled={creating}
                >
                  <FontAwesome name="times" size={14} color={theme.colors.destructiveForeground} />
                </TouchableOpacity>
              )}
            </View>
            {selectedDueDate && (
              <Text style={[styles.dueDateDisplay, { color: theme.colors.mutedForeground }]}>
                Due: {selectedDueDate.toLocaleDateString()}
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  emptyState: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  createButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    minHeight: 120,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dueDateDisplay: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
