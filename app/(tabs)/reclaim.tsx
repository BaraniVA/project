import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { LessonsContent } from '@/components/LessonsContent';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency, APP_PROFIT_WEIGHTS } from '@/lib/attention-calculator';
import { 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Lightbulb, 
  Target,
  Clock,
  DollarSign,
  Zap,
  Brain
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface Recommendation {
  id: string;
  type: 'switch' | 'reduce' | 'replace' | 'invest';
  title: string;
  description: string;
  currentApp?: string;
  suggestedApp?: string;
  currentCost: number;
  potentialSaving: number;
  timeframe: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CutBackPlan {
  id: string;
  title: string;
  description: string;
  dailyTimeSaving: number;
  monthlySaving: number;
  steps: string[];
}

export default function ReclaimScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'lessons'>('recommendations');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [cutBackPlans, setCutBackPlans] = useState<CutBackPlan[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState(0);
  const [loading, setLoading] = useState(true);

  const styles = createStyles(colors);

  const generateRecommendations = async () => {
    if (!user) return;

    try {
      const { data: screenTimeData } = await supabase
        .from('screen_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (!screenTimeData || screenTimeData.length === 0) {
        setLoading(false);
        return;
      }

      const appUsage = screenTimeData.reduce((acc, entry) => {
        acc[entry.app_name] = (acc[entry.app_name] || 0) + entry.hours;
        return acc;
      }, {} as Record<string, number>);

      const recommendations: Recommendation[] = [];

      // Generate switch recommendations for high-cost apps
      Object.entries(appUsage).forEach(([app, hours]) => {
        const profitWeight = APP_PROFIT_WEIGHTS[app as keyof typeof APP_PROFIT_WEIGHTS];
        if (profitWeight && profitWeight > 1.5 && hours > 5) {
          const currentCost = hours * 187.5 * profitWeight;
          const potentialSaving = currentCost * 0.6;

          recommendations.push({
            id: `switch-${app}`,
            type: 'switch',
            title: `Switch from ${app}`,
            description: `${app} has high attention extraction. Consider alternatives with lower profit margins.`,
            currentApp: app,
            suggestedApp: getSuggestedAlternative(app),
            currentCost,
            potentialSaving,
            timeframe: 'weekly',
            difficulty: app === 'TikTok' ? 'hard' : 'medium',
          });
        }
      });

      // Generate reduction recommendations
      const topApps = Object.entries(appUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      topApps.forEach(([app, hours]) => {
        if (hours > 10) {
          const currentCost = hours * 187.5;
          const potentialSaving = currentCost * 0.3;

          recommendations.push({
            id: `reduce-${app}`,
            type: 'reduce',
            title: `Reduce ${app} Usage`,
            description: `Cut your ${app} time by 30% to reclaim valuable attention.`,
            currentApp: app,
            currentCost,
            potentialSaving,
            timeframe: 'weekly',
            difficulty: 'medium',
          });
        }
      });

      // Generate investment recommendations
      const totalWeeklyLoss = screenTimeData.reduce((sum, entry) => sum + entry.est_value_lost, 0);
      if (totalWeeklyLoss > 1000) {
        recommendations.push({
          id: 'invest-learning',
          type: 'invest',
          title: 'Invest in Learning',
          description: 'Redirect 2 hours daily from social media to skill-building courses.',
          currentCost: totalWeeklyLoss,
          potentialSaving: 2 * 7 * 187.5,
          timeframe: 'weekly',
          difficulty: 'medium',
        });
      }

      setRecommendations(recommendations);

      // Generate cut-back plans
      const plans: CutBackPlan[] = [
        {
          id: 'morning-routine',
          title: 'Morning Phone-Free Hour',
          description: 'Start your day without checking your phone for the first hour after waking up.',
          dailyTimeSaving: 1,
          monthlySaving: 1 * 30 * 187.5,
          steps: [
            'Place phone in another room before sleep',
            'Use a physical alarm clock',
            'Create a morning routine: exercise, meditation, or reading',
            'Check phone only after breakfast'
          ],
        },
        {
          id: 'notification-diet',
          title: 'Notification Diet',
          description: 'Reduce interruptions by turning off non-essential notifications.',
          dailyTimeSaving: 0.5,
          monthlySaving: 0.5 * 30 * 187.5,
          steps: [
            'Turn off notifications for social media apps',
            'Keep only calls, messages, and calendar alerts',
            'Use Do Not Disturb during focus hours',
            'Check apps intentionally, not reactively'
          ],
        },
        {
          id: 'evening-cutoff',
          title: 'Evening Digital Sunset',
          description: 'Stop using devices 2 hours before bedtime for better sleep and focus.',
          dailyTimeSaving: 2,
          monthlySaving: 2 * 30 * 187.5,
          steps: [
            'Set a daily phone curfew at 8 PM',
            'Use blue light filters after sunset',
            'Replace screen time with reading or journaling',
            'Charge phone outside the bedroom'
          ],
        },
      ];

      setCutBackPlans(plans);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedAlternative = (app: string): string => {
    const alternatives: Record<string, string> = {
      'TikTok': 'YouTube (educational channels)',
      'Instagram': 'Pinterest (inspiration boards)',
      'Facebook': 'LinkedIn (professional networking)',
      'Twitter': 'Newsletter subscriptions',
      'Snapchat': 'Direct messaging apps',
      'YouTube': 'Skillshare or Coursera',
    };
    return alternatives[app] || 'Productive alternatives';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      default: return colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'switch': return ArrowRight;
      case 'reduce': return TrendingDown;
      case 'replace': return ArrowRight;
      case 'invest': return TrendingUp;
      default: return Lightbulb;
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [user]);

  const nextRecommendation = () => {
    setCurrentRecommendation((prev) => (prev + 1) % recommendations.length);
  };

  const previousRecommendation = () => {
    setCurrentRecommendation((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  const renderRecommendations = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your habits...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {recommendations.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.sectionTitle}>Switch & Save</Text>
            
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={styles.typeIndicator}>
                  {(() => {
                    const IconComponent = getTypeIcon(recommendations[currentRecommendation].type);
                    return <IconComponent size={16} color="#ffffff" />;
                  })()}
                  <Text style={styles.typeText}>
                    {recommendations[currentRecommendation].type.toUpperCase()}
                  </Text>
                </View>
                
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(recommendations[currentRecommendation].difficulty) + '20' }
                ]}>
                  <Text style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(recommendations[currentRecommendation].difficulty) }
                  ]}>
                    {recommendations[currentRecommendation].difficulty}
                  </Text>
                </View>
              </View>

              <Text style={styles.recommendationTitle}>
                {recommendations[currentRecommendation].title}
              </Text>
              
              <Text style={styles.recommendationDescription}>
                {recommendations[currentRecommendation].description}
              </Text>

              {recommendations[currentRecommendation].suggestedApp && (
                <View style={styles.switchSuggestion}>
                  <Text style={styles.switchFrom}>
                    {recommendations[currentRecommendation].currentApp}
                  </Text>
                  <ArrowRight size={16} color={colors.primary} />
                  <Text style={styles.switchTo}>
                    {recommendations[currentRecommendation].suggestedApp}
                  </Text>
                </View>
              )}

              <View style={styles.savingsInfo}>
                <View style={styles.savingItem}>
                  <DollarSign size={16} color={colors.error} />
                  <Text style={styles.savingLabel}>Current Cost</Text>
                  <Text style={styles.savingValue}>
                    {formatCurrency(recommendations[currentRecommendation].currentCost)}
                  </Text>
                </View>

                <View style={styles.savingItem}>
                  <TrendingUp size={16} color={colors.success} />
                  <Text style={styles.savingLabel}>Potential Saving</Text>
                  <Text style={[styles.savingValue, styles.savingPositive]}>
                    {formatCurrency(recommendations[currentRecommendation].potentialSaving)}
                  </Text>
                </View>
              </View>

              <View style={styles.recommendationActions}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={previousRecommendation}
                  disabled={recommendations.length <= 1}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>

                <Text style={styles.recommendationCounter}>
                  {currentRecommendation + 1} of {recommendations.length}
                </Text>

                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={nextRecommendation}
                  disabled={recommendations.length <= 1}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.cutBackSection}>
          <Text style={styles.sectionTitle}>Your Cut Back Plans</Text>
          
          {cutBackPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.planSaving}>
                  <Text style={styles.planSavingAmount}>
                    {formatCurrency(plan.monthlySaving)}
                  </Text>
                  <Text style={styles.planSavingPeriod}>per month</Text>
                </View>
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              <View style={styles.planStats}>
                <View style={styles.planStat}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.planStatText}>
                    {plan.dailyTimeSaving}h daily
                  </Text>
                </View>
              </View>

              <View style={styles.planSteps}>
                <Text style={styles.planStepsTitle}>Action Steps:</Text>
                {plan.steps.map((step, index) => (
                  <View key={index} style={styles.planStep}>
                    <Text style={styles.planStepNumber}>{index + 1}</Text>
                    <Text style={styles.planStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 Pro Tip</Text>
          <Text style={styles.insightText}>
            Start with the easiest recommendation first. Small changes compound over time. 
            Even reducing your top app by 30 minutes daily can save you ₹2,800+ per month!
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Lightbulb size={32} color={colors.warning} />
          <Text style={styles.title}>Reclaim Your Attention</Text>
          <Text style={styles.subtitle}>
            Smart recommendations and insights to take back control
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
            onPress={() => setActiveTab('recommendations')}
          >
            <Target size={16} color={activeTab === 'recommendations' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>
              Recommendations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
            onPress={() => setActiveTab('lessons')}
          >
            <Brain size={16} color={activeTab === 'lessons' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
              How They Profit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'recommendations' ? renderRecommendations() : <LessonsContent />}
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
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  recommendationSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}40`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  switchSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  switchFrom: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  switchTo: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  savingsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  savingItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  savingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  savingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  savingPositive: {
    color: colors.success,
  },
  recommendationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  navButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  recommendationCounter: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cutBackSection: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  planSaving: {
    alignItems: 'flex-end',
  },
  planSavingAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  planSavingPeriod: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  planStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planStatText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  planSteps: {
    marginTop: 8,
  },
  planStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  planStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  planStepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: `${colors.primary}40`,
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  planStepText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  insightCard: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: colors.warning,
    lineHeight: 20,
  },
});