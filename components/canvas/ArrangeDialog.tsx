import React, { useState } from 'react';
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
import { Sticky } from '../../lib/types';

interface ArrangeDialogProps {
  visible: boolean;
  onClose: () => void;
  stickies: Sticky[];
  onArrange: (stickies: Sticky[]) => void;
}

type TabType = 'layout' | 'sort' | 'cleanup';

export default function ArrangeDialog({
  visible,
  onClose,
  stickies,
  onArrange,
}: ArrangeDialogProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  const arrangeGrid = (strict: boolean = false) => {
    if (stickies.length === 0) return;

    const padding = 50;
    const noteWidth = strict ? 300 : stickies[0]?.width || 300;
    const noteHeight = strict ? 250 : stickies[0]?.height || 250;
    const cols = Math.ceil(Math.sqrt(stickies.length));

    const arranged = stickies.map((sticky, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...sticky,
        position_x: 100 + col * (noteWidth + padding),
        position_y: 100 + row * (noteHeight + padding),
        ...(strict ? { width: noteWidth, height: noteHeight } : {}),
      };
    });

    onArrange(arranged);
    onClose();
  };

  const arrangeRows = () => {
    if (stickies.length === 0) return;

    const padding = 40;
    const noteHeight = stickies[0]?.height || 250;

    const arranged = stickies.map((sticky, index) => ({
      ...sticky,
      position_x: 100,
      position_y: 100 + index * (noteHeight + padding),
    }));

    onArrange(arranged);
    onClose();
  };

  const arrangeColumns = () => {
    if (stickies.length === 0) return;

    const padding = 40;
    const noteWidth = stickies[0]?.width || 300;

    const arranged = stickies.map((sticky, index) => ({
      ...sticky,
      position_x: 100 + index * (noteWidth + padding),
      position_y: 100,
    }));

    onArrange(arranged);
    onClose();
  };

  const arrangeCircle = () => {
    if (stickies.length === 0) return;

    const centerX = 500;
    const centerY = 400;
    const radius = 300;

    const arranged = stickies.map((sticky, index) => {
      const angle = (2 * Math.PI * index) / stickies.length;
      return {
        ...sticky,
        position_x: Math.round(centerX + radius * Math.cos(angle)),
        position_y: Math.round(centerY + radius * Math.sin(angle)),
      };
    });

    onArrange(arranged);
    onClose();
  };

  const sortByDate = () => {
    if (stickies.length === 0) return;

    const sorted = [...stickies].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const padding = 40;
    const cols = Math.ceil(Math.sqrt(sorted.length));

    const arranged = sorted.map((sticky, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...sticky,
        position_x: 100 + col * (sticky.width + padding),
        position_y: 100 + row * (sticky.height + padding),
      };
    });

    onArrange(arranged);
    onClose();
  };

  const sortByColor = () => {
    if (stickies.length === 0) return;

    const colorOrder = ['yellow', 'red', 'blue', 'green', 'purple', 'orange', 'pink', 'default'];
    const sorted = [...stickies].sort((a, b) => {
      const aIndex = colorOrder.indexOf(a.color);
      const bIndex = colorOrder.indexOf(b.color);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    const padding = 40;
    const cols = Math.ceil(Math.sqrt(sorted.length));

    const arranged = sorted.map((sticky, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...sticky,
        position_x: 100 + col * (sticky.width + padding),
        position_y: 100 + row * (sticky.height + padding),
      };
    });

    onArrange(arranged);
    onClose();
  };

  const shuffleNotes = () => {
    if (stickies.length === 0) return;

    const shuffled = [...stickies].sort(() => Math.random() - 0.5);

    const padding = 40;
    const cols = Math.ceil(Math.sqrt(shuffled.length));

    const arranged = shuffled.map((sticky, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...sticky,
        position_x: 100 + col * (sticky.width + padding),
        position_y: 100 + row * (sticky.height + padding),
      };
    });

    onArrange(arranged);
    onClose();
  };

  const arrangeTidy = () => {
    if (stickies.length === 0) return;

    const sorted = [...stickies].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const padding = 30;
    const cols = Math.ceil(Math.sqrt(sorted.length));

    const arranged = sorted.map((sticky, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...sticky,
        position_x: 100 + col * (sticky.width + padding),
        position_y: 100 + row * (sticky.height + padding),
      };
    });

    onArrange(arranged);
    onClose();
  };

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
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            Arrange & Sort Notes
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
          Organize {stickies.length} notes on the canvas
        </Text>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'layout' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('layout')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'layout' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Layouts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'sort' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('sort')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'sort' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Sort By
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'cleanup' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('cleanup')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'cleanup' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Cleanup
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <View style={styles.grid}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => arrangeGrid(false)}
              >
                <Ionicons name="grid-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Grid Layout
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Keep note sizes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => arrangeGrid(true)}
              >
                <Ionicons name="apps-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Strict Grid
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Uniform sizes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={arrangeRows}
              >
                <Ionicons name="reorder-three-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Single Column
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Vertical stack
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={arrangeColumns}
              >
                <Ionicons name="menu-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Single Row
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Horizontal line
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={arrangeCircle}
              >
                <Ionicons name="radio-button-off-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Circle
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Radial layout
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sort Tab */}
          {activeTab === 'sort' && (
            <View style={styles.grid}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={sortByDate}
              >
                <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  By Date
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Newest first
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={sortByColor}
              >
                <Ionicons name="color-palette-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  By Color
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Group colors
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={shuffleNotes}
              >
                <Ionicons name="shuffle-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Shuffle
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Random order
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cleanup Tab */}
          {activeTab === 'cleanup' && (
            <View style={styles.grid}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={arrangeTidy}
              >
                <Ionicons name="sparkles-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Tidy Up
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Sort by date & clean
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => arrangeGrid(false)}
              >
                <Ionicons name="grid-outline" size={32} color={theme.colors.primary} />
                <Text style={[styles.optionTitle, { color: theme.colors.foreground }]}>
                  Auto-Organize
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.mutedForeground }]}>
                  Smart grid
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
});
