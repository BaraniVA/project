import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
}

export function GradientBackground({ 
  children, 
  colors: customColors
}: GradientBackgroundProps) {
  const { isDarkMode } = useTheme();
  
  const defaultColors = isDarkMode 
    ? ['#1a1a2e', '#16213e', '#0f172a']
    : ['#f8fafc', '#e2e8f0', '#cbd5e1'];
  
  const gradientColors = customColors || defaultColors;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});