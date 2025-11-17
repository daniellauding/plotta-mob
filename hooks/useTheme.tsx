import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme, ColorScheme, lightTheme, darkTheme } from '../lib/theme';

type Theme = ReturnType<typeof createTheme>;

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@plotta_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setColorSchemeState(savedTheme);
        } else if (systemColorScheme) {
          setColorSchemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  // Update theme when system preference changes (only if no saved preference)
  useEffect(() => {
    async function checkSavedTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!savedTheme && systemColorScheme) {
          setColorSchemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to check saved theme:', error);
      }
    }
    if (isLoaded) {
      checkSavedTheme();
    }
  }, [systemColorScheme, isLoaded]);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isDark = colorScheme === 'dark';

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
      setColorSchemeState(scheme);
    }
  };

  const toggleTheme = async () => {
    const newScheme = isDark ? 'light' : 'dark';
    await setColorScheme(newScheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        isDark,
        toggleTheme,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
