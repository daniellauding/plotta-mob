import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { theme } = useTheme();

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Welcome to Plotta</Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>Sign in to continue</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.foreground, borderColor: theme.colors.border }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.mutedForeground}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.foreground, borderColor: theme.colors.border }]}
          placeholder="Password"
          placeholderTextColor={theme.colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.primaryForeground }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.links}>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { color: theme.colors.primary }]}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/reset-password" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { color: theme.colors.primary }]}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  links: {
    marginTop: 24,
    gap: 12,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
  },
});
