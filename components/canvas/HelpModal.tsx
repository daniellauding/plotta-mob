import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

interface HelpItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const HELP_ITEMS: HelpItem[] = [
  {
    icon: 'add-circle-outline',
    title: 'Create a Note',
    description: 'Tap the + button to create a new sticky note, take a photo, upload an image, or import notes.',
  },
  {
    icon: 'move-outline',
    title: 'Move Notes',
    description: 'Tap and drag any note to reposition it on the canvas. Pinch to zoom in and out.',
  },
  {
    icon: 'color-palette-outline',
    title: 'Change Colors',
    description: 'Tap a note to select it, then use the color picker to change its color and visual style.',
  },
  {
    icon: 'pricetags-outline',
    title: 'Organize with Tags',
    description: 'Add tags to notes to categorize and filter them. Use the tag manager to create and organize tags.',
  },
  {
    icon: 'funnel-outline',
    title: 'Filter Notes',
    description: 'Use the filter button in the header to filter notes by tags, priority, or due date.',
  },
  {
    icon: 'grid-outline',
    title: 'Arrange Layout',
    description: 'Tap the + button and select "Arrange Notes" to automatically organize notes in grids, rows, circles, or sort them.',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI Assistant',
    description: 'Use the magic wand icon to access AI features: search notes semantically, get insights, or generate new content.',
  },
  {
    icon: 'eye-outline',
    title: 'View Modes',
    description: 'Switch between All Notes, Today, This Week, Snoozed, or Later views to focus on specific notes.',
  },
  {
    icon: 'share-outline',
    title: 'Export & Share',
    description: 'Export your notes as JSON to backup or share with others. Import notes from exported files.',
  },
  {
    icon: 'settings-outline',
    title: 'Project Settings',
    description: 'Tap the settings icon to configure project theme, upload logo, view activity, and manage sharing.',
  },
];

export default function HelpModal({ visible, onClose }: HelpModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top']}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerLeft}>
            <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.foreground }]}>
              Help & Tips
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.introText, { color: theme.colors.mutedForeground }]}>
            Learn how to use Plotta Mobile to organize your thoughts, tasks, and ideas with visual sticky notes.
          </Text>

          {HELP_ITEMS.map((item, index) => (
            <View
              key={index}
              style={[
                styles.helpItem,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}
              >
                <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.helpTitle, { color: theme.colors.foreground }]}>
                  {item.title}
                </Text>
                <Text style={[styles.helpDescription, { color: theme.colors.mutedForeground }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
              Need more help? Visit our documentation at plotta.app/docs
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  helpItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
