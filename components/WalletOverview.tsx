import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/attention-calculator';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  Award,
  Calendar,
  Target
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';

interface WalletData {
  total_saved_time: number;
  total_points: number;
  money_saved: number;
  streak_days: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface WalletOverviewProps {
  showAchievements?: boolean;
}

export function WalletOverview({ showAchievements = false }: WalletOverviewProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [walletData, setWalletData] = useState<WalletData>({
    total_saved_time: 0,
    total_points: 0,
    money_saved: 0,
    streak_days: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = createStyles(colors);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      let { data: walletInfo, error } = await supabase
        .from('attention_wallet')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No wallet exists, create one
        const { data: newWallet, error: createError } = await supabase
          .from('attention_wallet')
          .insert({
            user_id: user.id,
            total_saved_time: 0,
            total_points: 0,
            money_saved: 0,
            streak_days: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        walletInfo = newWallet;
      } else if (error) {
        throw error;
      }

      if (walletInfo) {
        setWalletData(walletInfo);
        console.log('Wallet data fetched:', walletInfo);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when component comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchWalletData();
    }, [user])
  );

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  useEffect(() => {
    // Update achievements based on wallet data
    setAchievements([
      {
        id: '1',
        title: 'First Steps',
        description: 'Track your first day of screen time',
        icon: 'star',
        unlocked: walletData.total_saved_time > 0 || walletData.total_points > 0,
      },
      {
        id: '2',
        title: 'Week Warrior',
        description: 'Track screen time for 7 consecutive days',
        icon: 'calendar',
        unlocked: walletData.streak_days >= 7,
      },
      {
        id: '3',
        title: 'Money Saver',
        description: 'Save ₹1,000 worth of attention value',
        icon: 'target',
        unlocked: walletData.money_saved >= 1000,
      },
      {
        id: '4',
        title: 'Time Master',
        description: 'Reclaim 24+ hours of attention',
        icon: 'clock',
        unlocked: walletData.total_saved_time >= 24,
      },
      {
        id: '5',
        title: 'Focus Champion',
        description: 'Earn 1,000+ focus points',
        icon: 'star',
        unlocked: walletData.total_points >= 1000,
      },
    ]);
  }, [walletData]);

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return Star;
      case 'calendar': return Calendar;
      case 'target': return Target;
      case 'clock': return Clock;
      default: return Award;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading wallet data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Wallet size={28} color={colors.primary} />
        <Text style={styles.title}>Attention Wallet</Text>
      </View>

      <View style={styles.walletCards}>
        <View style={styles.walletCard}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.cardTitle}>Total Saved</Text>
          </View>
          <Text style={styles.cardValue}>
            {formatCurrency(walletData.money_saved)}
          </Text>
          <Text style={styles.cardSubtext}>
            Attention value reclaimed
          </Text>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.cardHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Time Reclaimed</Text>
          </View>
          <Text style={styles.cardValue}>
            {walletData.total_saved_time.toFixed(1)}h
          </Text>
          <Text style={styles.cardSubtext}>
            Hours of focused attention
          </Text>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.cardHeader}>
            <Zap size={20} color={colors.warning} />
            <Text style={styles.cardTitle}>Focus Points</Text>
          </View>
          <Text style={styles.cardValue}>
            {walletData.total_points.toLocaleString()}
          </Text>
          <Text style={styles.cardSubtext}>
            Points from productive activities
          </Text>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.cardHeader}>
            <Award size={20} color={colors.error} />
            <Text style={styles.cardTitle}>Current Streak</Text>
          </View>
          <Text style={styles.cardValue}>
            {walletData.streak_days}
          </Text>
          <Text style={styles.cardSubtext}>
            Days of mindful tracking
          </Text>
        </View>
      </View>

      {showAchievements && (
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.icon);
              return (
                <View 
                  key={achievement.id} 
                  style={[
                    styles.achievementCard,
                    achievement.unlocked && styles.achievementUnlocked
                  ]}
                >
                  <View style={[
                    styles.achievementIcon,
                    achievement.unlocked && styles.achievementIconUnlocked
                  ]}>
                    <IconComponent 
                      size={20} 
                      color={achievement.unlocked ? colors.warning : colors.textSecondary} 
                    />
                  </View>
                  
                  <View style={styles.achievementContent}>
                    <Text style={[
                      styles.achievementTitle,
                      achievement.unlocked && styles.achievementTitleUnlocked
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                  </View>

                  {achievement.unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>💡 Your Attention Portfolio</Text>
        <Text style={styles.insightText}>
          You've reclaimed {walletData.total_saved_time.toFixed(1)} hours of your life! 
          That's equivalent to {formatCurrency(walletData.money_saved)} in attention value. 
          {walletData.streak_days > 0 && `Keep up your ${walletData.streak_days}-day streak!`}
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  walletCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  walletCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementUnlocked: {
    backgroundColor: `${colors.warning}20`,
    borderWidth: 1,
    borderColor: `${colors.warning}60`,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: `${colors.warning}40`,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  achievementTitleUnlocked: {
    color: colors.text,
  },
  achievementDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  unlockedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  insightCard: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});