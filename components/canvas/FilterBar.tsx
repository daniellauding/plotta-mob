import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Tag } from '@/lib/types';

interface FilterBarProps {
  tags: Tag[];
  selectedTagIds: string[];
  selectedPriorities: string[];
  selectedDueDates: string[];
  onTagsChange: (tagIds: string[]) => void;
  onPrioritiesChange: (priorities: string[]) => void;
  onDueDatesChange: (dates: string[]) => void;
  onClearAll: () => void;
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
];

const DUE_DATES = [
  { value: 'overdue', label: 'Overdue', color: '#ef4444' },
  { value: 'today', label: 'Today', color: '#f97316' },
  { value: 'week', label: 'This Week', color: '#f59e0b' },
  { value: 'later', label: 'Later', color: '#10b981' },
  { value: 'none', label: 'No Due Date', color: '#6b7280' },
];

export function FilterBar({
  tags,
  selectedTagIds,
  selectedPriorities,
  selectedDueDates,
  onTagsChange,
  onPrioritiesChange,
  onDueDatesChange,
  onClearAll,
}: FilterBarProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'tags' | 'priority' | 'date'>('tags');

  const totalFilters = selectedTagIds.length + selectedPriorities.length + selectedDueDates.length;

  // Safety check - return null if theme is not loaded yet
  if (!theme || !theme.colors) {
    return null;
  }

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onPrioritiesChange(selectedPriorities.filter(p => p !== priority));
    } else {
      onPrioritiesChange([...selectedPriorities, priority]);
    }
  };

  const toggleDueDate = (date: string) => {
    if (selectedDueDates.includes(date)) {
      onDueDatesChange(selectedDueDates.filter(d => d !== date));
    } else {
      onDueDatesChange([...selectedDueDates, date]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: theme.colors.background }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="filter" size={20} color={theme.colors.foreground} />
        <Text style={[styles.filterText, { color: theme.colors.foreground }]}>
          Filters
          {totalFilters > 0 && ` (${totalFilters})`}
        </Text>
      </TouchableOpacity>

      {/* Active filter chips */}
      {totalFilters > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          {selectedTagIds.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <View
                key={tagId}
                style={[styles.chip, { backgroundColor: tag.color }]}
              >
                <Text style={styles.chipText}>{tag.name}</Text>
              </View>
            ) : null;
          })}
          {selectedPriorities.map(priority => {
            const p = PRIORITIES.find(pr => pr.value === priority);
            return (
              <View
                key={priority}
                style={[styles.chip, { backgroundColor: p?.color }]}
              >
                <Text style={styles.chipText}>{priority}</Text>
              </View>
            );
          })}
          {selectedDueDates.map(date => (
            <View
              key={date}
              style={[styles.chip, { backgroundColor: theme.colors.muted }]}
            >
              <Text style={[styles.chipText, { color: theme.colors.mutedForeground }]}>
                {date.startsWith('custom:') ? date.replace('custom:', '') : date}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.foreground }]}>Filters</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'tags' && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab('tags')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'tags' ? theme.colors.primary : theme.colors.mutedForeground }
                ]}>
                  Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'priority' && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab('priority')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'priority' ? theme.colors.primary : theme.colors.mutedForeground }
                ]}>
                  Priority {selectedPriorities.length > 0 && `(${selectedPriorities.length})`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'date' && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab('date')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'date' ? theme.colors.primary : theme.colors.mutedForeground }
                ]}>
                  Date {selectedDueDates.length > 0 && `(${selectedDueDates.length})`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.tabContent}>
              {activeTab === 'tags' && (
                <View style={styles.filterGrid}>
                  {tags.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                      No tags yet
                    </Text>
                  ) : (
                    tags.map(tag => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                            borderColor: tag.color,
                          }
                        ]}
                        onPress={() => toggleTag(tag.id)}
                      >
                        <Text style={[
                          styles.filterChipText,
                          { color: selectedTagIds.includes(tag.id) ? '#fff' : tag.color }
                        ]}>
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {activeTab === 'priority' && (
                <View style={styles.filterGrid}>
                  {PRIORITIES.map(priority => (
                    <TouchableOpacity
                      key={priority.value}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: selectedPriorities.includes(priority.value) ? priority.color : 'transparent',
                          borderColor: priority.color,
                        }
                      ]}
                      onPress={() => togglePriority(priority.value)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: selectedPriorities.includes(priority.value) ? '#fff' : priority.color }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeTab === 'date' && (
                <View style={styles.filterGrid}>
                  {DUE_DATES.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: selectedDueDates.includes(option.value) ? option.color : 'transparent',
                          borderColor: option.color,
                        }
                      ]}
                      onPress={() => toggleDueDate(option.value)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: selectedDueDates.includes(option.value) ? '#fff' : option.color }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Clear All Button */}
            {totalFilters > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.clearButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    onClearAll();
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.clearButtonText, { color: theme.colors.foreground }]}>
                    Clear All Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipsContainer: {
    flex: 1,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    padding: 20,
    minHeight: 200,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
