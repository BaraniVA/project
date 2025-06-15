import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { AttentionCard } from '@/components/AttentionCard';
import { DistractionStatsSummary } from '@/components/DistractionStatsSummary';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { formatCurrency, calculateTimeLoss, calculateCorporateProfit } from '@/lib/attention-calculator';
import { Eye, TrendingDown, Building, Clock, Brain } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';

interface DashboardData {
  todayLoss: number;
  weekLoss: number;
  corporateProfit: number;
  topApp: string;
  topAppHours: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todayLoss: 0,
    weekLoss: 0,
    corporateProfit: 0,
    topApp: 'TikTok',
    topAppHours: 0,
  });
  const [loading, setLoading] = useState(true);

  const styles = createStyles(colors);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get today's screen time
      const { data: todayData } = await supabase
        .from('screen_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      // Get week's screen time
      const { data: weekData } = await supabase
        .from('screen_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo);

      let todayLoss = 0;
      let weekLoss = 0;
      let corporateProfit = 0;
      let topApp = 'TikTok';
      let topAppHours = 0;

      if (todayData) {
        todayLoss = todayData.reduce((sum, entry) => sum + entry.est_value_lost, 0);
      }

      if (weekData) {
        weekLoss = weekData.reduce((sum, entry) => sum + entry.est_value_lost, 0);
        corporateProfit = weekData.reduce((sum, entry) => 
          sum + calculateCorporateProfit(entry.app_name, entry.hours), 0);

        // Find most used app
        const appUsage = weekData.reduce((acc, entry) => {
          acc[entry.app_name] = (acc[entry.app_name] || 0) + entry.hours;
          return acc;
        }, {} as Record<string, number>);

        const topAppEntry = Object.entries(appUsage).sort(([,a], [,b]) => b - a)[0];
        if (topAppEntry) {
          topApp = topAppEntry[0];
          topAppHours = topAppEntry[1];
        }
      }

      setDashboardData({
        todayLoss,
        weekLoss,
        corporateProfit,
        topApp,
        topAppHours,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [user])
  );

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const handleExploreLessons = () => {
    // Navigate to reclaim tab and set it to lessons
    router.push('/(tabs)/reclaim');
  };

  return (
    <GradientBackground>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Attention Receipt</Text>
          <Text style={styles.subtitle}>How much did you spend today?</Text>
        </View>

        <View style={styles.cards}>
          <AttentionCard
            title="Today's Loss"
            amount={dashboardData.todayLoss}
            subtitle="Value given to tech companies"
            type="loss"
          />

          <AttentionCard
            title="Weekly Loss"
            amount={dashboardData.weekLoss}
            subtitle="Total attention value lost"
            type="loss"
          />

          <AttentionCard
            title="Corporate Profit"
            amount={dashboardData.corporateProfit}
            subtitle="What they earned from you"
            type="neutral"
          />
        </View>

        <View style={styles.insights}>
          <Text style={styles.sectionTitle}>Today's Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Eye size={24} color={colors.primary} />
              <Text style={styles.insightTitle}>Top Attention Drain</Text>
            </View>
            <Text style={styles.insightText}>
              {dashboardData.topApp} consumed {dashboardData.topAppHours.toFixed(1)} hours this week
            </Text>
            <Text style={styles.insightValue}>
              Cost: {formatCurrency(calculateTimeLoss(dashboardData.topApp, dashboardData.topAppHours))}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingDown size={24} color={colors.error} />
              <Text style={styles.insightTitle}>Extraction Rate</Text>
            </View>
            <Text style={styles.insightText}>
              Tech companies extracted {formatCurrency(dashboardData.corporateProfit)} from your attention this week
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Clock size={24} color={colors.success} />
              <Text style={styles.insightTitle}>Reclaim Opportunity</Text>
            </View>
            <Text style={styles.insightText}>
              Reducing daily screen time by 1 hour could save you {formatCurrency(187.5)} per day
            </Text>
          </View>
        </View>

        <DistractionStatsSummary />

        <SubscriptionManager showSummaryOnly={true} />

        <View style={styles.lessonsPreview}>
          <View style={styles.lessonsHeader}>
            <Brain size={24} color={colors.warning} />
            <Text style={styles.lessonsTitle}>How They Profit</Text>
          </View>
          <Text style={styles.lessonsSubtitle}>
            Learn the psychology behind digital manipulation
          </Text>
          <TouchableOpacity style={styles.lessonsButton} onPress={handleExploreLessons}>
            <Text style={styles.lessonsButtonText}>Explore Lessons</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  cards: {
    marginBottom: 32,
  },
  insights: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  insightText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  lessonsPreview: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  lessonsSubtitle: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: 16,
  },
  lessonsButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  lessonsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});