import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../lib/types';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ProjectSettingsProps {
  visible: boolean;
  onClose: () => void;
  project: Project;
}

type TabType = 'settings' | 'activity' | 'share';

const THEME_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f5f5f5' },
  { name: 'Mint', value: '#dcfce7' },
  { name: 'Blue', value: '#dbeafe' },
  { name: 'Yellow', value: '#fef9c3' },
  { name: 'Pink', value: '#fce7f3' },
  { name: 'Purple', value: '#ede9fe' },
];

export default function ProjectSettings({ visible, onClose, project }: ProjectSettingsProps) {
  const { theme } = useTheme();
  const { updateProject, deleteProject } = useProjects();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [name, setName] = useState(project.name);
  const [themeColor, setThemeColor] = useState(project.theme_color || '#ffffff');
  const [customColor, setCustomColor] = useState(project.theme_color || '#ffffff');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Activity tab
  const [activityLoading, setActivityLoading] = useState(false);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState({
    totalNotes: 0,
    todoCount: 0,
    inProgressCount: 0,
    doneCount: 0,
  });

  // Share tab
  const [visibility, setVisibility] = useState<'private' | 'invite_only' | 'public'>(
    (project.visibility as any) || 'private'
  );
  const [accessPassword, setAccessPassword] = useState(project.access_password || '');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (visible && activeTab === 'activity') {
      loadProjectActivity();
    }
  }, [visible, activeTab]);

  useEffect(() => {
    const link = `https://plotta.app/project/${project.id}`;
    setShareLink(link);
  }, [project.id]);

  const loadProjectActivity = async () => {
    setActivityLoading(true);
    try {
      const { data: notes } = await supabase
        .from('stickies')
        .select('id, title, content, created_at, updated_at, status')
        .eq('project_id', project.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      const { data: allNotes } = await supabase
        .from('stickies')
        .select('status')
        .eq('project_id', project.id);

      const stats = {
        totalNotes: allNotes?.length || 0,
        todoCount: allNotes?.filter(n => n.status === 'todo').length || 0,
        inProgressCount: allNotes?.filter(n => n.status === 'in_progress').length || 0,
        doneCount: allNotes?.filter(n => n.status === 'done').length || 0,
      };

      setRecentNotes(notes || []);
      setProjectStats(stats);
    } catch (error) {
      console.error('Failed to load project activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await updateProject(project.id, {
        name: name.trim(),
        theme_color: themeColor,
      });
      Alert.alert('Success', 'Project updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project');
    } finally {
      setSaving(false);
    }
  }

  async function handleThemeChange(color: string) {
    setThemeColor(color);
  }

  async function handleFileUpload(type: 'logo' | 'background') {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Photo library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const uri = result.assets[0].uri;

        const response = await fetch(uri);
        const blob = await response.blob();

        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${project.id}/${type}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-assets')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(fileName);

        const updates = type === 'logo'
          ? { logo_url: publicUrl }
          : { background_url: publicUrl };

        await updateProject(project.id, updates);
        Alert.alert('Success', `${type === 'logo' ? 'Logo' : 'Background'} uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  async function handleVisibilityChange(newVisibility: 'private' | 'invite_only' | 'public') {
    try {
      await updateProject(project.id, { visibility: newVisibility });
      setVisibility(newVisibility);
      Alert.alert('Success', `Project is now ${newVisibility.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating visibility:', error);
      Alert.alert('Error', 'Failed to update visibility');
    }
  }

  async function handlePasswordChange() {
    try {
      await updateProject(project.id, { access_password: accessPassword || null });
      Alert.alert('Success', accessPassword ? 'Password set' : 'Password removed');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    }
  }

  function handleCopyLink() {
    Clipboard.setString(shareLink);
    Alert.alert('Copied!', 'Share link copied to clipboard');
  }

  function getStatusColor(status: string, theme: any) {
    switch (status) {
      case 'done':
        return '#22c55e';
      case 'in_progress':
        return '#3b82f6';
      case 'todo':
        return '#f59e0b';
      default:
        return theme.colors.mutedForeground;
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This will delete all notes in this project.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProject(project.id);
              Alert.alert('Success', 'Project deleted successfully');
              onClose();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: theme.colors.mutedForeground }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            Project Settings
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

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'settings' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={activeTab === 'settings' ? theme.colors.primary : theme.colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'settings' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'activity' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons
              name="pulse-outline"
              size={20}
              color={activeTab === 'activity' ? theme.colors.primary : theme.colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'activity' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'share' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('share')}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={activeTab === 'share' ? theme.colors.primary : theme.colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'share' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              {/* Project Name */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.foreground }]}>
                  Project Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.foreground,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter project name"
                  placeholderTextColor={theme.colors.mutedForeground}
                  editable={!saving}
                />
              </View>

              {/* Theme Color */}
              <View style={[styles.section, { marginTop: 24 }]}>
                <Text style={[styles.label, { color: theme.colors.foreground }]}>
                  Theme Color
                </Text>
                <View style={styles.colorGrid}>
                  {THEME_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color.value}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.value },
                        themeColor === color.value && {
                          borderColor: theme.colors.primary,
                          borderWidth: 3,
                        },
                      ]}
                      onPress={() => handleThemeChange(color.value)}
                    >
                      {themeColor === color.value && (
                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Logo Upload */}
              <View style={[styles.section, { marginTop: 24 }]}>
                <Text style={[styles.label, { color: theme.colors.foreground }]}>
                  Project Logo
                </Text>
                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: theme.colors.border }]}
                  onPress={() => handleFileUpload('logo')}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.primary} />
                      <Text style={[styles.uploadButtonText, { color: theme.colors.foreground }]}>
                        Upload Logo
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {project.logo_url && (
                  <Image source={{ uri: project.logo_url }} style={styles.logoPreview} />
                )}
              </View>

              {/* Background Upload */}
              <View style={[styles.section, { marginTop: 24 }]}>
                <Text style={[styles.label, { color: theme.colors.foreground }]}>
                  Background Image
                </Text>
                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: theme.colors.border }]}
                  onPress={() => handleFileUpload('background')}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.primary} />
                      <Text style={[styles.uploadButtonText, { color: theme.colors.foreground }]}>
                        Upload Background
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {project.background_url && (
                  <Image source={{ uri: project.background_url }} style={styles.backgroundPreview} />
                )}
              </View>

              {/* Project Info */}
              <View style={[styles.section, { marginTop: 24 }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
                  INFORMATION
                </Text>
                <View style={[styles.infoItem, { borderBottomColor: theme.colors.border }]}>
                  <FontAwesome name="calendar" size={16} color={theme.colors.mutedForeground} style={styles.infoIcon} />
                  <Text style={[styles.infoLabel, { color: theme.colors.foreground }]}>
                    Created
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.mutedForeground }]}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.infoItem, { borderBottomColor: theme.colors.border }]}>
                  <FontAwesome name="pencil" size={16} color={theme.colors.mutedForeground} style={styles.infoIcon} />
                  <Text style={[styles.infoLabel, { color: theme.colors.foreground }]}>
                    Last Modified
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.mutedForeground }]}>
                    {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Danger Zone */}
              {project.name !== 'Drafts' && (
                <View style={[styles.section, { marginTop: 32 }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.destructive }]}>
                    DANGER ZONE
                  </Text>
                  <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: theme.colors.destructive }]}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color={theme.colors.destructive} />
                    ) : (
                      <>
                        <FontAwesome name="trash" size={18} color={theme.colors.destructive} />
                        <Text style={[styles.deleteButtonText, { color: theme.colors.destructive }]}>
                          Delete Project
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.deleteWarning, { color: theme.colors.mutedForeground }]}>
                    This action cannot be undone. All notes in this project will be permanently deleted.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <>
              {activityLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : (
                <>
                  {/* Stats Cards */}
                  <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                        {projectStats.totalNotes}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
                        Total Notes
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                        {projectStats.doneCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
                        Completed
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                        {projectStats.inProgressCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
                        In Progress
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <Text style={[styles.statValue, { color: theme.colors.foreground }]}>
                        {projectStats.todoCount}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
                        To Do
                      </Text>
                    </View>
                  </View>

                  {/* Recent Activity */}
                  <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}>
                      RECENT ACTIVITY
                    </Text>
                    {recentNotes.length === 0 ? (
                      <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
                        No notes yet. Create your first note to get started!
                      </Text>
                    ) : (
                      recentNotes.map((note) => (
                        <View
                          key={note.id}
                          style={[styles.activityItem, { borderBottomColor: theme.colors.border }]}
                        >
                          <View style={styles.activityContent}>
                            <Text style={[styles.activityTitle, { color: theme.colors.foreground }]} numberOfLines={1}>
                              {note.title || 'Untitled'}
                            </Text>
                            <Text style={[styles.activityTime, { color: theme.colors.mutedForeground }]}>
                              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                            </Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(note.status, theme) }]}>
                            <Text style={[styles.statusText, { color: theme.colors.primaryForeground }]}>
                              {note.status?.replace('_', ' ') || 'none'}
                            </Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </>
              )}
            </>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <>
              {/* Visibility */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.foreground }]}>
                  Visibility
                </Text>
                <View style={styles.visibilityOptions}>
                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { borderColor: theme.colors.border },
                      visibility === 'private' && {
                        backgroundColor: theme.colors.primary + '15',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => handleVisibilityChange('private')}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color={visibility === 'private' ? theme.colors.primary : theme.colors.mutedForeground}
                    />
                    <View style={styles.visibilityContent}>
                      <Text style={[styles.visibilityLabel, { color: theme.colors.foreground }]}>
                        Private
                      </Text>
                      <Text style={[styles.visibilityDescription, { color: theme.colors.mutedForeground }]}>
                        Only you can access
                      </Text>
                    </View>
                    {visibility === 'private' && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { borderColor: theme.colors.border },
                      visibility === 'invite_only' && {
                        backgroundColor: theme.colors.primary + '15',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => handleVisibilityChange('invite_only')}
                  >
                    <Ionicons
                      name="people"
                      size={24}
                      color={visibility === 'invite_only' ? theme.colors.primary : theme.colors.mutedForeground}
                    />
                    <View style={styles.visibilityContent}>
                      <Text style={[styles.visibilityLabel, { color: theme.colors.foreground }]}>
                        Invite Only
                      </Text>
                      <Text style={[styles.visibilityDescription, { color: theme.colors.mutedForeground }]}>
                        Anyone with the link
                      </Text>
                    </View>
                    {visibility === 'invite_only' && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.visibilityOption,
                      { borderColor: theme.colors.border },
                      visibility === 'public' && {
                        backgroundColor: theme.colors.primary + '15',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => handleVisibilityChange('public')}
                  >
                    <Ionicons
                      name="globe"
                      size={24}
                      color={visibility === 'public' ? theme.colors.primary : theme.colors.mutedForeground}
                    />
                    <View style={styles.visibilityContent}>
                      <Text style={[styles.visibilityLabel, { color: theme.colors.foreground }]}>
                        Public
                      </Text>
                      <Text style={[styles.visibilityDescription, { color: theme.colors.mutedForeground }]}>
                        Anyone on the internet
                      </Text>
                    </View>
                    {visibility === 'public' && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Protection */}
              {visibility !== 'private' && (
                <View style={[styles.section, { marginTop: 24 }]}>
                  <Text style={[styles.label, { color: theme.colors.foreground }]}>
                    Password Protection (Optional)
                  </Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: theme.colors.card,
                          color: theme.colors.foreground,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={accessPassword}
                      onChangeText={setAccessPassword}
                      placeholder="Enter password"
                      placeholderTextColor={theme.colors.mutedForeground}
                      secureTextEntry
                    />
                    <TouchableOpacity
                      style={[styles.setPasswordButton, { backgroundColor: theme.colors.primary }]}
                      onPress={handlePasswordChange}
                    >
                      <Text style={[styles.setPasswordButtonText, { color: theme.colors.primaryForeground }]}>
                        Set
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Share Link */}
              <View style={[styles.section, { marginTop: 24 }]}>
                <Text style={[styles.label, { color: theme.colors.foreground }]}>
                  Share Link
                </Text>
                <View style={styles.shareLinkContainer}>
                  <View style={[styles.shareLinkBox, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border }]}>
                    <Text style={[styles.shareLinkText, { color: theme.colors.foreground }]} numberOfLines={1}>
                      {shareLink}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleCopyLink}
                  >
                    <Ionicons name="copy-outline" size={20} color={theme.colors.primaryForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
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
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 12,
  },
  backgroundPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 24,
    marginRight: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 15,
  },
  infoValue: {
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 10,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteWarning: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
    fontStyle: 'italic',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  visibilityOptions: {
    gap: 12,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 12,
  },
  visibilityContent: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  visibilityDescription: {
    fontSize: 13,
  },
  passwordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  setPasswordButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setPasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareLinkContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  shareLinkBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  shareLinkText: {
    fontSize: 14,
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
