import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  }

  async function uploadAvatar(uri: string) {
    try {
      setUploading(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create file name
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  }

  async function pickImage(fromCamera: boolean) {
    try {
      // Request permissions
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera permission is required to take photos');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Photo library permission is required to select photos');
          return;
        }
      }

      // Launch picker
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }

  function showAvatarOptions() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', avatarUrl ? 'Remove Photo' : ''].filter(Boolean),
          destructiveButtonIndex: avatarUrl ? 3 : undefined,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImage(true); // Camera
          } else if (buttonIndex === 2) {
            pickImage(false); // Library
          } else if (buttonIndex === 3 && avatarUrl) {
            removeAvatar();
          }
        }
      );
    } else {
      Alert.alert(
        'Change Avatar',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: () => pickImage(true) },
          { text: 'Choose from Library', onPress: () => pickImage(false) },
          ...(avatarUrl ? [{ text: 'Remove Photo', onPress: removeAvatar, style: 'destructive' as const }] : []),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }

  async function removeAvatar() {
    try {
      setUploading(true);

      // Update user metadata to remove avatar
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      if (error) throw error;

      setAvatarUrl(null);
      Alert.alert('Success', 'Avatar removed successfully!');
    } catch (error) {
      console.error('Error removing avatar:', error);
      Alert.alert('Error', 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            onPress={showAvatarOptions}
            disabled={uploading}
            style={[styles.avatarContainer]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.colors.muted }]}>
              {uploading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <FontAwesome name="user" size={48} color={theme.colors.primary} />
              )}
            </View>
            <View style={[styles.avatarBadge, { backgroundColor: theme.colors.primary }]}>
              <FontAwesome name="camera" size={14} color={theme.colors.primaryForeground} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.email, { color: theme.colors.foreground }]}>{user?.email}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>Plotta Mobile User</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground, backgroundColor: theme.colors.muted }]}>Account</Text>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
            <FontAwesome name="envelope" size={20} color={theme.colors.mutedForeground} style={styles.icon} />
            <Text style={[styles.menuText, { color: theme.colors.foreground }]}>Email</Text>
            <Text style={[styles.menuValue, { color: theme.colors.mutedForeground }]}>{user?.email}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
            <FontAwesome name="calendar" size={20} color={theme.colors.mutedForeground} style={styles.icon} />
            <Text style={[styles.menuText, { color: theme.colors.foreground }]}>Member Since</Text>
            <Text style={[styles.menuValue, { color: theme.colors.mutedForeground }]}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground, backgroundColor: theme.colors.muted }]}>App</Text>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
            <FontAwesome name="bell-o" size={20} color={theme.colors.mutedForeground} style={styles.icon} />
            <Text style={[styles.menuText, { color: theme.colors.foreground }]}>Notifications</Text>
            <FontAwesome name="toggle-on" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity style={[styles.menuItem, styles.signOutButton]} onPress={handleSignOut}>
            <FontAwesome name="sign-out" size={20} color={theme.colors.destructive} style={styles.icon} />
            <Text style={[styles.menuText, styles.signOutText, { color: theme.colors.destructive }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>Plotta Mobile v1.0.0</Text>
          <Text style={[styles.footerSubtext, { color: theme.colors.mutedForeground }]}>Made with ❤️ by the Plotta team</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  email: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    width: 32,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuValue: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#ccc',
  },
});
