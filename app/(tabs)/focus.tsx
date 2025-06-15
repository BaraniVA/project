import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { FocusActivityManager } from '@/components/FocusActivityManager';
import { GoalsManager } from '@/components/GoalsManager';
import { Brain, Target } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function FocusScreen() {
  const [activeTab, setActiveTab] = useState<'activities' | 'goals'>('activities');
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={32} color={colors.success} />
          <Text style={styles.title}>Focus & Goals</Text>
          <Text style={styles.subtitle}>
            Build your personal capital and track your achievements
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
            onPress={() => setActiveTab('activities')}
          >
            <Brain size={16} color={activeTab === 'activities' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
              Focus Activities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
            onPress={() => setActiveTab('goals')}
          >
            <Target size={16} color={activeTab === 'goals' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
              Goals
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'activities' ? (
            <FocusActivityManager />
          ) : (
            <GoalsManager />
          )}
        </View>
      </View>
    </GradientBackground>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
});