import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type ViewMode = 'all' | 'today' | 'week' | 'snoozed' | 'later';

interface ViewModeSelectorProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

interface ViewModeOption {
  id: ViewMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  {
    id: 'all',
    label: 'All Notes',
    icon: 'albums-outline',
    description: 'Show all notes in this project',
  },
  {
    id: 'today',
    label: 'Today',
    icon: 'today-outline',
    description: 'Notes due today + notes with no due date',
  },
  {
    id: 'week',
    label: 'This Week',
    icon: 'calendar-outline',
    description: 'Notes due this week + notes with no due date',
  },
  {
    id: 'snoozed',
    label: 'Snoozed',
    icon: 'time-outline',
    description: 'Notes with future due dates only',
  },
  {
    id: 'later',
    label: 'Later',
    icon: 'hourglass-outline',
    description: 'Notes due 7+ days from now',
  },
];

export default function ViewModeSelector({ mode, onChange }: ViewModeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const currentOption = VIEW_MODE_OPTIONS.find((opt) => opt.id === mode);

  const handleSelect = (newMode: ViewMode) => {
    onChange(newMode);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.card }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons
          name={currentOption?.icon || 'albums-outline'}
          size={18}
          color={theme.colors.primary}
        />
        <Text style={[styles.buttonText, { color: theme.colors.foreground }]}>
          {currentOption?.label}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.foreground} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.foreground }]}>
                View Mode
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {VIEW_MODE_OPTIONS.map((option) => {
                const isSelected = option.id === mode;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionItem,
                      { borderBottomColor: theme.colors.border },
                      isSelected && {
                        backgroundColor: theme.colors.primary + '15',
                      },
                    ]}
                    onPress={() => handleSelect(option.id)}
                  >
                    <View style={styles.optionIcon}>
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={isSelected ? theme.colors.primary : theme.colors.foreground}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected
                              ? theme.colors.primary
                              : theme.colors.foreground,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}
                      >
                        {option.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  optionIcon: {
    width: 32,
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
});
