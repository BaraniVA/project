import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/attention-calculator';
import { Smartphone, Bell, Zap, Award } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';

interface DistractionLog {
  id: string;
  date: string;
  pickup_count: number;
  notification_count: number;
}

export function DistractionStatsSummary() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [distractionLogs, setDistractionLogs] = useState<DistractionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = createStyles(colors);

  const fetchDistractionLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('distraction_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      setDistractionLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch distraction logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when component comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchDistractionLogs();
    }, [user])
  );

  useEffect(() => {
    fetchDistractionLogs();
  }, [user]);

  const calculateDistractionDebt = (pickups: number, notifications: number) => {
    const pickupCost = pickups * 3; // minutes
    const notificationCost = notifications * 0.5; // minutes
    const totalMinutes = pickupCost + notificationCost;
    const hourlyValue = 187.5;
    const debtValue = (totalMinutes / 60) * hourlyValue;
    
    return {
      totalMinutes,
      debtValue,
    };
  };

  const getWeeklyStats = () => {
    const totalPickups = distractionLogs.reduce((sum, log) => sum + log.pickup_count, 0);
    const totalNotifications = distractionLogs.reduce((sum, log) => sum + log.notification_count, 0);
    const debt = calculateDistractionDebt(totalPickups, totalNotifications);
    
    return {
      totalPickups,
      totalNotifications,
      totalDebt: debt.debtValue,
    };
  };

  const getCurrentStreak = () => {
    let streak = 0;
    const threshold = 50;
    
    for (const log of distractionLogs) {
      if (log.pickup_count < threshold) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const weeklyStats = getWeeklyStats();
  const currentStreak = getCurrentStreak();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading distraction data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distraction Debt</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Smartphone size={20} color={colors.error} />
          <Text style={styles.statValue}>{weeklyStats.totalPickups}</Text>
          <Text style={styles.statLabel}>Weekly Pickups</Text>
        </View>

        <View style={styles.statCard}>
          <Bell size={20} color={colors.warning} />
          <Text style={styles.statValue}>{weeklyStats.totalNotifications}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </View>

        <View style={styles.statCard}>
          <Zap size={20} color={colors.primary} />
          <Text style={styles.statValue}>{formatCurrency(weeklyStats.totalDebt)}</Text>
          <Text style={styles.statLabel}>Total Debt</Text>
        </View>

        <View style={styles.statCard}>
          <Award size={20} color={colors.success} />
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Focus Streak</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});