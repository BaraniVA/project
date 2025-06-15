import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '@/lib/attention-calculator';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface AttentionCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  type?: 'loss' | 'gain' | 'neutral';
  onPress?: () => void;
}

export function AttentionCard({ 
  title, 
  amount, 
  subtitle, 
  type = 'neutral',
  onPress 
}: AttentionCardProps) {
  const { colors } = useTheme();

  const gradientColors = {
    loss: [colors.error, '#dc2626'],
    gain: [colors.success, '#059669'],
    neutral: [colors.primary, '#4f46e5'],
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={gradientColors[type]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
});