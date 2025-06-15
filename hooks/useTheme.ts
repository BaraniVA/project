import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

const lightColors = {
  background: '#ffffff',
  surface: '#f8fafc',
  primary: '#6366f1',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const darkColors = {
  background: '#1f2937',
  surface: 'rgba(255, 255, 255, 0.1)',
  primary: '#6366f1',
  text: '#ffffff',
  textSecondary: '#d1d5db',
  border: '#374151',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeProvider() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return {
    isDarkMode,
    toggleTheme,
    colors,
  };
}

export { ThemeContext };