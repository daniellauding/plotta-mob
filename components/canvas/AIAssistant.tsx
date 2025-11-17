import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { Sticky } from '../../lib/types';
import Constants from 'expo-constants';

interface AIAssistantProps {
  visible: boolean;
  onClose: () => void;
  stickies: Sticky[];
  projectId: string;
  onCreateSticky: (content: { title: string; content: string }) => void;
}

type AIAction = 'search' | 'insights' | 'generate';
type AIProvider = 'lovable' | 'openai' | 'anthropic';

export default function AIAssistant({
  visible,
  onClose,
  stickies,
  projectId,
  onCreateSticky,
}: AIAssistantProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AIAction>('search');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>(
    (Constants.expoConfig?.extra?.defaultAiProvider as AIProvider) || 'openai'
  );
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Load API key from environment or AsyncStorage on mount
  useEffect(() => {
    loadApiKey();
  }, []);

  async function loadApiKey() {
    try {
      // First, try to load from environment variables
      const envOpenAI = Constants.expoConfig?.extra?.openaiApiKey;
      const envAnthropic = Constants.expoConfig?.extra?.anthropicApiKey;

      // Then check AsyncStorage for user overrides
      const savedProvider = await AsyncStorage.getItem('ai_provider');
      const savedKey = await AsyncStorage.getItem('ai_api_key');

      if (savedProvider) {
        setProvider(savedProvider as AIProvider);
      }

      if (savedKey) {
        // User has saved their own key - use it
        setApiKey(savedKey);
      } else if (provider === 'openai' && envOpenAI) {
        // Use environment variable
        setApiKey(envOpenAI);
      } else if (provider === 'anthropic' && envAnthropic) {
        // Use environment variable
        setApiKey(envAnthropic);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  }

  async function saveApiKey(key: string, prov: AIProvider) {
    try {
      await AsyncStorage.setItem('ai_api_key', key);
      await AsyncStorage.setItem('ai_provider', prov);
      setApiKey(key);
      setProvider(prov);
      Alert.alert('Saved!', 'API key saved successfully');
    } catch (error) {
      console.error('Failed to save API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  }

  const handleAIAction = async (action: AIAction) => {
    if (!prompt.trim() && action !== 'insights') {
      Alert.alert('Input required', 'Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const projectStickies = stickies
        .filter((s) => s.project_id === projectId)
        .map((s) => ({
          title: s.title,
          content: s.content,
        }));

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action,
          prompt: prompt.trim(),
          provider,
          apiKey: provider !== 'lovable' ? apiKey : undefined,
          stickies: projectStickies,
        },
      });

      if (error) throw error;

      setResponse(data.response);

      if (action === 'generate' && data.response) {
        Alert.alert(
          'Note generated!',
          "Click 'Create Sticky' button to add it to your canvas"
        );
      }
    } catch (error) {
      console.error('AI error:', error);
      Alert.alert(
        'AI Error',
        error instanceof Error ? error.message : 'Failed to process request'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createStickyFromResponse = () => {
    if (!response) return;

    const lines = response.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').substring(0, 50);
    const content = lines.slice(1).join('\n').trim();

    onCreateSticky({ title, content });
    Alert.alert(
      'Sticky created!',
      'Your AI-generated note has been added to the canvas'
    );
    setResponse('');
    setPrompt('');
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
              Search your notes using natural language. AI will find relevant notes based on
              meaning, not just keywords.
            </Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.foreground,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="What are you looking for? (e.g., 'notes about marketing ideas')"
              placeholderTextColor={theme.colors.mutedForeground}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={() => handleAIAction('search')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="search" size={20} color={theme.colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: theme.colors.primaryForeground }]}>
                    Search with AI
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'insights':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
              Get AI-powered insights, summaries, and patterns from all your notes in this
              project.
            </Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.foreground,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="What insights would you like? (e.g., 'summarize all tasks', 'find common themes')"
              placeholderTextColor={theme.colors.mutedForeground}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={() => handleAIAction('insights')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="bulb" size={20} color={theme.colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: theme.colors.primaryForeground }]}>
                    Generate Insights
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'generate':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
              Generate new notes based on your existing notes and a prompt. AI will create
              contextually relevant content.
            </Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.foreground,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="What should I create? (e.g., 'create action items from my meeting notes')"
              placeholderTextColor={theme.colors.mutedForeground}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={() => handleAIAction('generate')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={theme.colors.primaryForeground} />
                  <Text style={[styles.buttonText, { color: theme.colors.primaryForeground }]}>
                    Generate Note
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
    }
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
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.foreground }]}>AI Assistant</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowSettings(!showSettings)}
            >
              <Ionicons name="settings-outline" size={20} color={theme.colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Panel */}
        {showSettings && (
          <View style={[styles.settingsPanel, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingsTitle, { color: theme.colors.foreground }]}>
              API Key Settings
            </Text>

            {/* Provider Selection */}
            <Text style={[styles.settingsLabel, { color: theme.colors.foreground }]}>
              AI Provider
            </Text>
            <View style={styles.providerButtons}>
              <TouchableOpacity
                style={[
                  styles.providerButton,
                  { borderColor: theme.colors.border },
                  provider === 'openai' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => setProvider('openai')}
              >
                <Text style={[
                  styles.providerButtonText,
                  { color: provider === 'openai' ? theme.colors.primaryForeground : theme.colors.foreground }
                ]}>
                  OpenAI
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.providerButton,
                  { borderColor: theme.colors.border },
                  provider === 'anthropic' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => setProvider('anthropic')}
              >
                <Text style={[
                  styles.providerButtonText,
                  { color: provider === 'anthropic' ? theme.colors.primaryForeground : theme.colors.foreground }
                ]}>
                  Anthropic
                </Text>
              </TouchableOpacity>
            </View>

            {/* API Key Input */}
            <Text style={[styles.settingsLabel, { color: theme.colors.foreground, marginTop: 16 }]}>
              API Key {apiKey ? '(saved)' : ''}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.foreground,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={`Enter ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`}
              placeholderTextColor={theme.colors.mutedForeground}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => saveApiKey(apiKey, provider)}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.primaryForeground }]}>
                Save API Key
              </Text>
            </TouchableOpacity>

            <Text style={[styles.settingsHint, { color: theme.colors.mutedForeground }]}>
              {apiKey
                ? `Using ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} with your saved key`
                : 'Add your API key in .env file or enter it here'}
            </Text>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'search' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('search')}
          >
            <Ionicons
              name="search"
              size={18}
              color={activeTab === 'search' ? theme.colors.primary : theme.colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'search' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'insights' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('insights')}
          >
            <Ionicons
              name="bulb"
              size={18}
              color={
                activeTab === 'insights' ? theme.colors.primary : theme.colors.mutedForeground
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'insights' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'generate' && { borderBottomColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('generate')}
          >
            <Ionicons
              name="sparkles"
              size={18}
              color={
                activeTab === 'generate' ? theme.colors.primary : theme.colors.mutedForeground
              }
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'generate' ? theme.colors.primary : theme.colors.mutedForeground,
                },
              ]}
            >
              Generate
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderTabContent()}

          {/* Response Section */}
          {response && (
            <View style={styles.responseSection}>
              <View style={styles.responseHeader}>
                <Text style={[styles.responseTitle, { color: theme.colors.foreground }]}>
                  AI Response:
                </Text>
                {!isLoading && (
                  <TouchableOpacity
                    style={[styles.createButton, { borderColor: theme.colors.primary }]}
                    onPress={createStickyFromResponse}
                  >
                    <Text style={[styles.createButtonText, { color: theme.colors.primary }]}>
                      Create Sticky
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={[
                  styles.responseBox,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
              >
                <ScrollView style={styles.responseScroll}>
                  <Text style={[styles.responseText, { color: theme.colors.foreground }]}>
                    {response}
                  </Text>
                </ScrollView>
              </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsPanel: {
    padding: 16,
    borderBottomWidth: 1,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingsHint: {
    fontSize: 12,
    marginTop: 8,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  providerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  providerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  tabContent: {
    gap: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  textarea: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 100,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  responseSection: {
    marginTop: 24,
    gap: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  responseBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    maxHeight: 300,
  },
  responseScroll: {
    flex: 1,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
