import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Eye, DollarSign, Target, Brain, Smartphone, TrendingUp, Clock, Users, Zap, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface Lesson {
  id: string;
  title: string;
  content: string;
  icon: any;
  color: string;
  stats?: string;
  actionable?: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'attention-economy',
    title: 'The Attention Economy',
    content: 'Your attention is literally money. Tech companies sell your focus to advertisers. Every second you spend on their platforms generates revenue for them, not you.',
    icon: Eye,
    color: '#6366f1',
    stats: '1 hour on TikTok = ₹145 profit for ByteDance',
    actionable: 'Ask yourself: "Am I the customer or the product?"'
  },
  {
    id: 'dopamine-hijacking',
    title: 'Dopamine Hijacking',
    content: 'Apps are designed to trigger dopamine releases, creating addiction-like patterns. Variable reward schedules (like slot machines) keep you scrolling.',
    icon: Brain,
    color: '#8b5cf6',
    stats: 'Average person checks phone 96 times daily',
    actionable: 'Turn off notifications for non-essential apps'
  },
  {
    id: 'data-harvesting',
    title: 'Your Data = Their Gold',
    content: 'Every tap, scroll, and pause is tracked. This behavioral data is worth billions and helps companies predict and influence your future actions.',
    icon: Target,
    color: '#ef4444',
    stats: 'Facebook makes ₹125/hour from your attention',
    actionable: 'Review your privacy settings monthly'
  },
  {
    id: 'infinite-scroll',
    title: 'The Infinite Scroll Trap',
    content: 'Endless feeds eliminate natural stopping points. Without clear endings, your brain never gets the satisfaction of completion.',
    icon: Smartphone,
    color: '#f59e0b',
    stats: 'Users scroll 300 feet daily on average',
    actionable: 'Set specific time limits for social apps'
  },
  {
    id: 'fomo-creation',
    title: 'Manufacturing FOMO',
    content: 'Platforms create artificial urgency and fear of missing out. Stories disappear, posts get buried, keeping you constantly checking.',
    icon: Clock,
    color: '#10b981',
    stats: '70% of millennials experience social media FOMO',
    actionable: 'Practice digital minimalism - curate your feeds'
  },
  {
    id: 'social-validation',
    title: 'The Validation Loop',
    content: 'Likes, comments, and shares trigger social validation circuits in your brain. This creates dependency on external approval for self-worth.',
    icon: Users,
    color: '#06b6d4',
    stats: 'Average post gets checked 15+ times for engagement',
    actionable: 'Find validation through real-world achievements'
  },
  {
    id: 'attention-residue',
    title: 'Attention Residue',
    content: 'Even after closing an app, part of your mind stays thinking about it. This "attention residue" reduces focus on important tasks.',
    icon: Zap,
    color: '#ec4899',
    stats: 'Takes 23 minutes to fully refocus after interruption',
    actionable: 'Use phone-free zones during deep work'
  },
  {
    id: 'algorithmic-manipulation',
    title: 'Algorithm Manipulation',
    content: 'AI algorithms learn your weaknesses and exploit them. They show content designed to keep you engaged, not to make you happy.',
    icon: AlertTriangle,
    color: '#f97316',
    stats: 'TikTok algorithm updates every 13 milliseconds',
    actionable: 'Actively seek diverse, educational content'
  }
];

export function LessonsContent() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const { colors } = useTheme();

  const styles = createStyles(colors);

  const nextLesson = () => {
    setCurrentLesson((prev) => (prev + 1) % LESSONS.length);
  };

  const previousLesson = () => {
    setCurrentLesson((prev) => (prev - 1 + LESSONS.length) % LESSONS.length);
  };

  const lesson = LESSONS[currentLesson];
  const IconComponent = lesson.icon;

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>How They Profit</Text>
      <Text style={styles.subtitle}>
        Understand the psychology behind digital manipulation
      </Text>

      <View style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={[styles.iconContainer, { backgroundColor: lesson.color + '20' }]}>
            <IconComponent size={32} color={lesson.color} />
          </View>
          
          <View style={styles.lessonMeta}>
            <Text style={styles.lessonNumber}>
              Lesson {currentLesson + 1} of {LESSONS.length}
            </Text>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.lessonContentContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <Text style={styles.lessonContent}>{lesson.content}</Text>

          {lesson.stats && (
            <View style={styles.statsBox}>
              <DollarSign size={16} color={lesson.color} />
              <Text style={[styles.statsText, { color: lesson.color }]}>
                {lesson.stats}
              </Text>
            </View>
          )}

          {lesson.actionable && (
            <View style={styles.actionableBox}>
              <View style={styles.actionableHeader}>
                <TrendingUp size={16} color={colors.success} />
                <Text style={styles.actionableTitle}>Take Action:</Text>
              </View>
              <Text style={styles.actionableText}>{lesson.actionable}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.lessonNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={previousLesson}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <View style={styles.progressIndicator}>
            {LESSONS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentLesson && styles.progressDotActive
                ]}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={nextLesson}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickFactsSection}>
        <Text style={styles.sectionTitle}>Quick Facts</Text>
        
        <View style={styles.factsGrid}>
          <View style={styles.factCard}>
            <Eye size={20} color={colors.primary} />
            <Text style={styles.factValue}>₹2.3T</Text>
            <Text style={styles.factLabel}>Global ad revenue (2023)</Text>
          </View>

          <View style={styles.factCard}>
            <Clock size={20} color={colors.warning} />
            <Text style={styles.factValue}>7h 4m</Text>
            <Text style={styles.factLabel}>Daily screen time average</Text>
          </View>

          <View style={styles.factCard}>
            <Brain size={20} color="#8b5cf6" />
            <Text style={styles.factValue}>8 sec</Text>
            <Text style={styles.factLabel}>Human attention span</Text>
          </View>

          <View style={styles.factCard}>
            <DollarSign size={20} color={colors.success} />
            <Text style={styles.factValue}>₹15,000</Text>
            <Text style={styles.factLabel}>Annual value per user</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Remember</Text>
        <Text style={styles.tipText}>
          Knowledge is power. Understanding these tactics helps you make conscious choices 
          about your digital consumption. You're not powerless - you're just learning the rules of the game.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    minHeight: height * 0.65, // Increased height for better readability
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  lessonMeta: {
    flex: 1,
  },
  lessonNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  lessonContentContainer: {
    flex: 1,
    maxHeight: height * 0.45, // Increased height to reduce internal scrolling
  },
  lessonContent: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  statsBox: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  actionableBox: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  actionableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  actionableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  actionableText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  lessonNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.surface}60`,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  quickFactsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  factCard: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  factValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  factLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.warning,
    lineHeight: 20,
  },
});