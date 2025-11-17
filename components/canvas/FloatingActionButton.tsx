import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../hooks/useTheme';
import { Sticky } from '../../lib/types';

interface FloatingActionButtonProps {
  onNewNote: () => void;
  onImageSelected?: (uri: string) => void;
  stickies: Sticky[];
}

export default function FloatingActionButton({
  onNewNote,
  onImageSelected,
  stickies,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  function toggleMenu() {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  }

  async function handleUploadImage() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected?.(result.assets[0].uri);
        toggleMenu();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  }

  async function handleImportNotes() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', 'text/markdown'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        console.log('Imported content:', content);
        // TODO: Parse and create notes from imported data
        alert('Import functionality coming soon!');
        toggleMenu();
      }
    } catch (error) {
      console.error('Error importing notes:', error);
      alert('Failed to import notes');
    }
  }

  async function handleExportNotes() {
    try {
      if (stickies.length === 0) {
        alert('No notes to export');
        return;
      }

      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        notes: stickies.map(sticky => ({
          title: sticky.title,
          content: sticky.content,
          color: sticky.color,
          priority: sticky.priority,
          due_date: sticky.due_date,
          tags: sticky.tags,
          created_at: sticky.created_at,
        })),
      };

      const fileName = `plotta_export_${Date.now()}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Notes',
        });
      } else {
        alert('Sharing is not available on this device');
      }

      toggleMenu();
    } catch (error) {
      console.error('Error exporting notes:', error);
      alert('Failed to export notes');
    }
  }

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const buttonScale = (index: number) => {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
  };

  const buttonTranslateY = (index: number) => {
    return animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(index + 1) * 68],
    });
  };

  const menuItems = [
    {
      icon: 'image',
      label: 'Upload Image',
      onPress: handleUploadImage,
      color: theme.colors.primary,
    },
    {
      icon: 'download',
      label: 'Import',
      onPress: handleImportNotes,
      color: theme.colors.primary,
    },
    {
      icon: 'share',
      label: 'Export',
      onPress: handleExportNotes,
      color: theme.colors.primary,
    },
    {
      icon: 'sticky-note',
      label: 'New Note',
      onPress: () => {
        onNewNote();
        toggleMenu();
      },
      color: theme.colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      {expanded && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {menuItems.map((item, index) => (
        <Animated.View
          key={item.label}
          style={[
            styles.menuItem,
            {
              transform: [
                { scale: buttonScale(index) },
                { translateY: buttonTranslateY(index) },
              ],
              opacity: animation,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: item.color, ...theme.shadows.md }]}
            onPress={item.onPress}
          >
            <FontAwesome name={item.icon as any} size={20} color={theme.colors.primaryForeground} />
          </TouchableOpacity>
          <Text style={[styles.menuLabel, { color: theme.colors.foreground }]}>
            {item.label}
          </Text>
        </Animated.View>
      ))}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary, ...theme.shadows.lg }]}
        onPress={toggleMenu}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <FontAwesome name="plus" size={24} color={theme.colors.primaryForeground} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
