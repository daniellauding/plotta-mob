import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  TextInput,
  Alert,
  PanResponder,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Sticky, StickyColor } from '../../lib/types';
import { useStickies } from '../../hooks/useStickies';
import { useTheme } from '../../hooks/useTheme';
import { STICKY_COLORS, getStickyColor, StickyColorValue } from '../../lib/theme';
import VotingButton from './VotingButton';
import CommentsSheet from './CommentsSheet';
import TagsDisplay from './TagsDisplay';
import MediaEmbed from './MediaEmbed';
import LinkPreview from './LinkPreview';

interface StickyNoteProps {
  sticky: Sticky;
  maxZIndex: number;
  onBringToFront: (newZIndex: number) => void;
}

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export default function StickyNote({ sticky, maxZIndex, onBringToFront }: StickyNoteProps) {
  const { updateSticky, deleteSticky } = useStickies(sticky.project_id);
  const { theme, colorScheme } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editTitle, setEditTitle] = useState(sticky.title);
  const [editContent, setEditContent] = useState(sticky.content);
  const [editColor, setEditColor] = useState<StickyColor>(sticky.color as StickyColor);
  const [editPriority, setEditPriority] = useState<string | null>(sticky.priority || null);
  const [editDueDate, setEditDueDate] = useState<Date | null>(
    sticky.due_date ? new Date(sticky.due_date) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const pan = useRef(
    new Animated.ValueXY({
      x: sticky.position_x || 0,
      y: sticky.position_y || 0,
    })
  ).current;

  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Helper functions for date formatting
  const isOverdue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDueDate = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due.getTime() === today.getTime()) return 'Today';
    if (due.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return due.toLocaleDateString();
  };

  const getQuickDate = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Don't allow dragging if sticky is locked
        if (sticky.is_locked) return false;
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        if (tapTimer.current) clearTimeout(tapTimer.current);
        if (longPressTimer.current) clearTimeout(longPressTimer.current);

        longPressTimer.current = setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowEditModal(true);
        }, 500);

        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(_, gestureState);
      },
      onPanResponderRelease: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        pan.flattenOffset();

        setTimeout(() => {
          updateSticky(sticky.id, {
            position_x: (pan.x as any)._value,
            position_y: (pan.y as any)._value,
          }).catch(() => {});
        }, 100);
      },
    })
  ).current;

  const handlePress = () => {
    tapCount.current += 1;

    if (tapCount.current === 1) {
      // Single tap: bring to front (auto-increment z-index)
      if (!sticky.is_pinned) {
        const newZIndex = maxZIndex + 1;
        onBringToFront(newZIndex);
        updateSticky(sticky.id, { z_index: newZIndex }).catch(() => {});
      }

      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 300);
    } else if (tapCount.current === 2) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowEditModal(true);
    }
  };

  // Handle checkbox toggle in markdown
  const handleCheckboxToggle = async (index: number) => {
    const lines = sticky.content.split('\n');
    let checkboxIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match both "- [ ]" and "- [x]" (case insensitive)
      const uncheckedMatch = line.match(/^(\s*)-\s*\[\s*\]\s*(.*)$/);
      const checkedMatch = line.match(/^(\s*)-\s*\[x\]\s*(.*)$/i);

      if (uncheckedMatch || checkedMatch) {
        if (checkboxIndex === index) {
          if (uncheckedMatch) {
            // Replace [ ] with [x]
            lines[i] = line.replace(/\[\s*\]/, '[x]');
          } else {
            // Replace [x] with [ ]
            lines[i] = line.replace(/\[x\]/i, '[ ]');
          }
          break;
        }
        checkboxIndex++;
      }
    }

    const newContent = lines.join('\n');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Update database - the real-time subscription will update the UI
      await updateSticky(sticky.id, { content: newContent });
    } catch (error) {
      console.error('Failed to update checkbox:', error);
    }
  };

  async function handleSave() {
    try {
      setSaving(true);
      await updateSticky(sticky.id, {
        title: editTitle,
        content: editContent,
        color: editColor,
        priority: editPriority,
        due_date: editDueDate ? editDueDate.toISOString() : null,
      });
      setShowEditModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to update note');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleLock() {
    try {
      await updateSticky(sticky.id, { is_locked: !sticky.is_locked });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle lock');
    }
  }

  async function handleTogglePin() {
    try {
      await updateSticky(sticky.id, {
        is_pinned: !sticky.is_pinned,
        z_index: !sticky.is_pinned ? 999 : 0,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle pin');
    }
  }

  async function handleToggleHide() {
    try {
      await updateSticky(sticky.id, { is_hidden: !sticky.is_hidden });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle hide');
    }
  }

  async function handleDelete() {
    // Immediate delete with optimistic UI (no confirmation like web app)
    try {
      setShowEditModal(false);
      setShowOptionsMenu(false);
      await deleteSticky(sticky.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to delete note:', error);
      // Error handling is done in the deleteSticky hook
    }
  }

  const backgroundColor = getStickyColor(sticky.color as StickyColorValue, colorScheme);

  // Use black text on colored stickies, theme foreground on default
  const textColor = sticky.color !== 'default' ? '#000000' : theme.colors.foreground;

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.note,
          {
            backgroundColor,
            width: sticky.width || 300,
            minHeight: sticky.height || 250,
            borderColor: theme.colors.border,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            zIndex: sticky.is_pinned ? 999 : (sticky.z_index || 0),
          },
          (sticky.z_index || 0) >= 100 ? theme.shadows.lg : theme.shadows.md,
        ]}
      >
        <View style={styles.noteContent}>
          {/* Tags Display */}
          <TagsDisplay stickyId={sticky.id} projectId={sticky.project_id} />

          {/* Priority and Due Date Badges */}
          <View style={styles.badgesContainer}>
            {sticky.priority && (
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: PRIORITY_COLORS[sticky.priority as keyof typeof PRIORITY_COLORS] },
                ]}
              >
                <Ionicons name="flag" size={10} color="#fff" />
                <Text style={styles.badgeText}>{sticky.priority}</Text>
              </View>
            )}
            {sticky.due_date && (
              <View
                style={[
                  styles.dueDateBadge,
                  {
                    backgroundColor: isOverdue(new Date(sticky.due_date))
                      ? '#ef4444'
                      : '#6b7280',
                  },
                ]}
              >
                <Ionicons name="calendar-outline" size={10} color="#fff" />
                <Text style={styles.badgeText}>{formatDueDate(new Date(sticky.due_date))}</Text>
              </View>
            )}
          </View>

          {sticky.title && (
            <Text
              style={[
                styles.title,
                { color: textColor },
              ]}
              numberOfLines={2}
            >
              {sticky.title}
            </Text>
          )}
          {sticky.content && (
            <View>
              {sticky.content.split('\n').map((line, lineIndex) => {
                const uncheckedMatch = line.match(/^(\s*)-\s*\[\s*\]\s*(.*)$/);
                const checkedMatch = line.match(/^(\s*)-\s*\[x\]\s*(.*)$/i);

                if (uncheckedMatch || checkedMatch) {
                  const isChecked = !!checkedMatch;
                  const text = (uncheckedMatch || checkedMatch)![2];
                  const checkboxIndex = sticky.content
                    .split('\n')
                    .slice(0, lineIndex)
                    .filter(l => l.match(/^(\s*)-\s*\[\s*[x\s]*\]\s*/i)).length;

                  return (
                    <TouchableOpacity
                      key={lineIndex}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCheckboxToggle(checkboxIndex);
                      }}
                      activeOpacity={0.7}
                      style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}
                    >
                      <FontAwesome
                        name={isChecked ? 'check-square-o' : 'square-o'}
                        size={16}
                        color={textColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: textColor,
                          fontSize: 14,
                          textDecorationLine: isChecked ? 'line-through' : 'none',
                          opacity: isChecked ? 0.6 : 1,
                        }}
                      >
                        {text}
                      </Text>
                    </TouchableOpacity>
                  );
                }

                // Check for standalone URLs (not markdown links)
                const urlMatch = line.match(/^(https?:\/\/[^\s]+)$/);
                if (urlMatch) {
                  const url = urlMatch[1];
                  // Check if it's a media/embed URL
                  const isMediaUrl = /youtube\.com|youtu\.be|spotify\.com|soundcloud\.com|vimeo\.com|instagram\.com|facebook\.com\/.*\/videos|twitter\.com\/\w+\/status|x\.com\/\w+\/status|maps\.google\.com|google\.com\/maps/i.test(url);

                  if (isMediaUrl) {
                    return <MediaEmbed key={lineIndex} url={url} />;
                  } else {
                    return <LinkPreview key={lineIndex} url={url} />;
                  }
                }

                // For non-checkbox lines, render as markdown
                return line ? (
                  <Markdown
                    key={lineIndex}
                    style={{
                      body: {
                        color: textColor,
                        fontSize: 14,
                      },
                      heading1: {
                        color: textColor,
                        fontSize: 20,
                        fontWeight: 'bold',
                      },
                      heading2: {
                        color: textColor,
                        fontSize: 18,
                        fontWeight: 'bold',
                      },
                      heading3: {
                        color: textColor,
                        fontSize: 16,
                        fontWeight: 'bold',
                      },
                      code_inline: {
                        backgroundColor: theme.colors.muted,
                        color: textColor,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        borderRadius: 3,
                        fontFamily: 'Courier',
                      },
                      fence: {
                        backgroundColor: theme.colors.muted,
                        color: textColor,
                        padding: 8,
                        borderRadius: 4,
                        fontFamily: 'Courier',
                      },
                      link: {
                        color: theme.colors.primary,
                        textDecorationLine: 'underline',
                      },
                      blockquote: {
                        backgroundColor: theme.colors.muted,
                        borderLeftWidth: 4,
                        borderLeftColor: theme.colors.border,
                        paddingLeft: 12,
                        paddingVertical: 8,
                      },
                    }}
                  >
                    {line}
                  </Markdown>
                ) : null;
              })}
            </View>
          )}

          {/* Action Buttons */}
          <View style={[styles.actionButtons, { borderTopColor: theme.colors.border }]}>
            <VotingButton stickyId={sticky.id} />
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowCommentsSheet(true);
              }}
              style={styles.commentButton}
            >
              <FontAwesome
                name="comment-o"
                size={14}
                color={textColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowOptionsMenu(true);
              }}
              style={styles.commentButton}
            >
              <FontAwesome
                name="ellipsis-v"
                size={14}
                color={textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Invisible tap handler for double-tap to edit */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          style={styles.tapOverlay}
        />
      </Animated.View>

      {/* Comments Sheet */}
      <CommentsSheet
        stickyId={sticky.id}
        isOpen={showCommentsSheet}
        onClose={() => setShowCommentsSheet(false)}
      />

      {/* Options Menu */}
      <Modal
        visible={showOptionsMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View
            style={[styles.optionsMenu, { backgroundColor: theme.colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                setShowOptionsMenu(false);
                setShowEditModal(true);
              }}
            >
              <FontAwesome name="edit" size={16} color={theme.colors.foreground} />
              <Text style={[styles.menuText, { color: theme.colors.foreground }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                setShowOptionsMenu(false);
                handleTogglePin();
              }}
            >
              <FontAwesome
                name="thumb-tack"
                size={16}
                color={sticky.is_pinned ? theme.colors.primary : theme.colors.foreground}
              />
              <Text style={[styles.menuText, { color: theme.colors.foreground }]}>
                {sticky.is_pinned ? 'Unpin' : 'Pin to Top'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                setShowOptionsMenu(false);
                handleToggleLock();
              }}
            >
              <FontAwesome
                name={sticky.is_locked ? 'lock' : 'unlock'}
                size={16}
                color={sticky.is_locked ? theme.colors.primary : theme.colors.foreground}
              />
              <Text style={[styles.menuText, { color: theme.colors.foreground }]}>
                {sticky.is_locked ? 'Unlock' : 'Lock Position'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                setShowOptionsMenu(false);
                handleToggleHide();
              }}
            >
              <FontAwesome
                name={sticky.is_hidden ? 'eye' : 'eye-slash'}
                size={16}
                color={sticky.is_hidden ? theme.colors.primary : theme.colors.foreground}
              />
              <Text style={[styles.menuText, { color: theme.colors.foreground }]}>
                {sticky.is_hidden ? 'Show' : 'Hide'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowOptionsMenu(false);
                handleDelete();
              }}
            >
              <FontAwesome name="trash" size={16} color={theme.colors.destructive} />
              <Text style={[styles.menuText, { color: theme.colors.destructive }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.cancelButton, { color: theme.colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.foreground }]}>
              Edit Note
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text
                style={[
                  styles.saveButton,
                  { color: theme.colors.primary },
                  saving && styles.buttonDisabled,
                ]}
              >
                {saving ? 'Saving...' : 'Save'}
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
              value={editTitle}
              onChangeText={setEditTitle}
              editable={!saving}
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
              value={editContent}
              onChangeText={setEditContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!saving}
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
                      borderWidth: editColor === color.value ? 2 : 0,
                      borderColor: theme.colors.primary,
                    },
                    theme.shadows.sm,
                  ]}
                  onPress={() => setEditColor(color.value as StickyColor)}
                  disabled={saving}
                >
                  {editColor === color.value && (
                    <FontAwesome
                      name="check"
                      size={16}
                      color={theme.colors.foreground}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.colorLabel, { color: theme.colors.foreground }]}>
              Priority
            </Text>
            <View style={styles.priorityPicker}>
              {PRIORITIES.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor:
                        editPriority === priority
                          ? PRIORITY_COLORS[priority]
                          : 'transparent',
                      borderColor: PRIORITY_COLORS[priority],
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() =>
                    setEditPriority(editPriority === priority ? null : priority)
                  }
                  disabled={saving}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      {
                        color:
                          editPriority === priority
                            ? '#fff'
                            : PRIORITY_COLORS[priority],
                      },
                    ]}
                  >
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.colorLabel, { color: theme.colors.foreground }]}>
              Due Date
            </Text>
            <View style={styles.datePickerSection}>
              <View style={styles.quickDates}>
                <TouchableOpacity
                  style={[
                    styles.quickDateButton,
                    { backgroundColor: theme.colors.muted },
                  ]}
                  onPress={() => setEditDueDate(getQuickDate(0))}
                  disabled={saving}
                >
                  <Text style={[styles.quickDateText, { color: theme.colors.foreground }]}>
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.quickDateButton,
                    { backgroundColor: theme.colors.muted },
                  ]}
                  onPress={() => setEditDueDate(getQuickDate(1))}
                  disabled={saving}
                >
                  <Text style={[styles.quickDateText, { color: theme.colors.foreground }]}>
                    Tomorrow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.quickDateButton,
                    { backgroundColor: theme.colors.muted },
                  ]}
                  onPress={() => setEditDueDate(getQuickDate(7))}
                  disabled={saving}
                >
                  <Text style={[styles.quickDateText, { color: theme.colors.foreground }]}>
                    Next Week
                  </Text>
                </TouchableOpacity>
              </View>

              {editDueDate && (
                <View style={styles.selectedDateContainer}>
                  <View
                    style={[
                      styles.selectedDateBadge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.selectedDateText}>
                      {formatDueDate(editDueDate)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.clearDateButton,
                      { backgroundColor: theme.colors.destructive },
                    ]}
                    onPress={() => setEditDueDate(null)}
                    disabled={saving}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.customDateButton,
                  {
                    backgroundColor: theme.colors.muted,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
                disabled={saving}
              >
                <Ionicons
                  name="calendar"
                  size={16}
                  color={theme.colors.foreground}
                />
                <Text style={[styles.customDateText, { color: theme.colors.foreground }]}>
                  Pick Custom Date
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={editDueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setEditDueDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            <Text style={[styles.colorLabel, { color: theme.colors.foreground }]}>
              Options
            </Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: sticky.is_locked
                      ? theme.colors.primary
                      : theme.colors.muted,
                  },
                ]}
                onPress={handleToggleLock}
                disabled={saving}
              >
                <FontAwesome
                  name={sticky.is_locked ? 'lock' : 'unlock'}
                  size={16}
                  color={
                    sticky.is_locked
                      ? theme.colors.primaryForeground
                      : theme.colors.foreground
                  }
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    {
                      color: sticky.is_locked
                        ? theme.colors.primaryForeground
                        : theme.colors.foreground,
                    },
                  ]}
                >
                  {sticky.is_locked ? 'Locked' : 'Lock'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: sticky.is_pinned
                      ? theme.colors.primary
                      : theme.colors.muted,
                  },
                ]}
                onPress={handleTogglePin}
                disabled={saving}
              >
                <FontAwesome
                  name={sticky.is_pinned ? 'thumb-tack' : 'thumb-tack'}
                  size={16}
                  color={
                    sticky.is_pinned
                      ? theme.colors.primaryForeground
                      : theme.colors.foreground
                  }
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    {
                      color: sticky.is_pinned
                        ? theme.colors.primaryForeground
                        : theme.colors.foreground,
                    },
                  ]}
                >
                  {sticky.is_pinned ? 'Pinned' : 'Pin'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: sticky.is_hidden
                      ? theme.colors.primary
                      : theme.colors.muted,
                  },
                ]}
                onPress={handleToggleHide}
                disabled={saving}
              >
                <FontAwesome
                  name={sticky.is_hidden ? 'eye-slash' : 'eye'}
                  size={16}
                  color={
                    sticky.is_hidden
                      ? theme.colors.primaryForeground
                      : theme.colors.foreground
                  }
                />
                <Text
                  style={[
                    styles.optionButtonText,
                    {
                      color: sticky.is_hidden
                        ? theme.colors.primaryForeground
                        : theme.colors.foreground,
                    },
                  ]}
                >
                  {sticky.is_hidden ? 'Hidden' : 'Hide'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor: `${theme.colors.destructive}20`,
                  borderColor: theme.colors.destructive,
                },
              ]}
              onPress={handleDelete}
              disabled={saving}
            >
              <FontAwesome name="trash" size={18} color={theme.colors.destructive} />
              <Text style={[styles.deleteButtonText, { color: theme.colors.destructive }]}>
                Delete Note
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  noteContent: {
    padding: 12,
    width: '100%',
    height: '100%',
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  commentButton: {
    padding: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
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
  saveButton: {
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
    marginBottom: 32,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 32,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenu: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  priorityPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  priorityChip: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  datePickerSection: {
    marginBottom: 24,
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  selectedDateBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  clearDateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  customDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
