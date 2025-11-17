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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { theme } = useTheme();

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up');
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
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>Sign up to get started</Text>

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

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.foreground, borderColor: theme.colors.border }]}
          placeholder="Confirm Password"
          placeholderTextColor={theme.colors.mutedForeground}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.primaryForeground }]}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.links}>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { color: theme.colors.primary }]}>Already have an account? Sign in</Text>
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
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
  },
});
