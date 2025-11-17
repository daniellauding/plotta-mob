import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.muted }]}>
            <FontAwesome name="user" size={48} color={theme.colors.primary} />
          </View>
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

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} onPress={toggleTheme}>
            <FontAwesome name={isDark ? "sun-o" : "moon-o"} size={20} color={theme.colors.mutedForeground} style={styles.icon} />
            <Text style={[styles.menuText, { color: theme.colors.foreground }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
            <FontAwesome
              name={isDark ? "toggle-on" : "toggle-off"}
              size={24}
              color={isDark ? theme.colors.primary : theme.colors.mutedForeground}
            />
          </TouchableOpacity>

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
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
