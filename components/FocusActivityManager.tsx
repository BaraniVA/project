import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SimpleSlider } from '@/components/SimpleSlider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { calculateFocusPoints } from '@/lib/attention-calculator';
import { 
  Brain, 
  BookOpen, 
  Dumbbell, 
  Briefcase, 
  Palette, 
  Heart, 
  GraduationCap,
  Plus,
  X,
  Star,
  TrendingUp
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface FocusActivity {
  id: string;
  type: string;
  hours: number;
  points: number;
  date: string;
}

const ACTIVITY_TYPES = [
  { key: 'study', label: 'Study', icon: BookOpen, color: '#6366f1', rate: 100 },
  { key: 'exercise', label: 'Exercise', icon: Dumbbell, color: '#10b981', rate: 80 },
  { key: 'work', label: 'Work', icon: Briefcase, color: '#f59e0b', rate: 90 },
  { key: 'creative', label: 'Creative', icon: Palette, color: '#8b5cf6', rate: 85 },
  { key: 'reading', label: 'Reading', icon: BookOpen, color: '#06b6d4', rate: 70 },
  { key: 'meditation', label: 'Meditation', icon: Heart, color: '#ec4899', rate: 60 },
  { key: 'skill_building', label: 'Skill Building', icon: GraduationCap, color: '#ef4444', rate: 95 },
];

interface FocusActivityManagerProps {
  onActivitySaved?: () => void;
}

export function FocusActivityManager({ onActivitySaved }: FocusActivityManagerProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [activities, setActivities] = useState<FocusActivity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITY_TYPES[0]);
  const [hours, setHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const styles = createStyles(colors);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('focus_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Failed to fetch focus activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (!user || hours === 0) {
      Alert.alert('Error', 'Please set hours greater than 0');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const points = calculateFocusPoints(selectedActivity.key, hours);

      const { error } = await supabase
        .from('focus_activities')
        .upsert({
          user_id: user.id,
          type: selectedActivity.key,
          hours,
          points,
          date: today,
        }, {
          onConflict: 'user_id,date,type'
        });

      if (error) throw error;

      // Update attention wallet
      await updateAttentionWallet(hours, points);

      setHours(0);
      setShowAddModal(false);
      fetchActivities();
      onActivitySaved?.();
      Alert.alert('Success', `Added ${hours}h of ${selectedActivity.label} (+${points} points)!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add focus activity');
      console.error('Add activity error:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateStreak = async () => {
    if (!user) return 0;

    try {
      // Get all activities, screen time entries, and distraction logs to calculate streak
      const today = new Date();
      const dates = [];
      
      // Generate last 30 days to check for activity
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Check for any activity on each date
      const activityChecks = await Promise.all(dates.map(async (date) => {
        const [focusData, screenData, distractionData] = await Promise.all([
          supabase.from('focus_activities').select('id').eq('user_id', user.id).eq('date', date).limit(1),
          supabase.from('screen_time_entries').select('id').eq('user_id', user.id).eq('date', date).limit(1),
          supabase.from('distraction_logs').select('id').eq('user_id', user.id).eq('date', date).limit(1)
        ]);

        return {
          date,
          hasActivity: (focusData.data?.length || 0) > 0 || 
                     (screenData.data?.length || 0) > 0 || 
                     (distractionData.data?.length || 0) > 0
        };
      }));

      // Calculate consecutive days from today backwards
      let streak = 0;
      for (const dayCheck of activityChecks) {
        if (dayCheck.hasActivity) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Failed to calculate streak:', error);
      return 0;
    }
  };

  const updateAttentionWallet = async (addedHours: number, addedPoints: number) => {
    if (!user) return;

    try {
      // Get current wallet data
      const { data: wallet, error: fetchError } = await supabase
        .from('attention_wallet')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const currentSavedTime = wallet?.total_saved_time || 0;
      const currentPoints = wallet?.total_points || 0;
      const currentMoneySaved = wallet?.money_saved || 0;

      // Calculate new values
      const newSavedTime = currentSavedTime + addedHours;
      const newPoints = currentPoints + addedPoints;
      const newMoneySaved = currentMoneySaved + (addedHours * 187.5); // ₹187.5/hour value

      // Calculate current streak
      const newStreak = await calculateStreak();

      // Upsert wallet data
      const { error: upsertError } = await supabase
        .from('attention_wallet')
        .upsert({
          user_id: user.id,
          total_saved_time: newSavedTime,
          total_points: newPoints,
          money_saved: newMoneySaved,
          streak_days: newStreak,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      console.log('Wallet updated successfully:', {
        total_saved_time: newSavedTime,
        total_points: newPoints,
        money_saved: newMoneySaved,
        streak_days: newStreak
      });

    } catch (error) {
      console.error('Failed to update attention wallet:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(activity => activity.date === today);
    
    const totalHours = todayActivities.reduce((sum, activity) => sum + activity.hours, 0);
    const totalPoints = todayActivities.reduce((sum, activity) => sum + activity.points, 0);
    
    return { totalHours, totalPoints, activities: todayActivities };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weekActivities = activities.filter(activity => activity.date >= weekAgoStr);
    
    const totalHours = weekActivities.reduce((sum, activity) => sum + activity.hours, 0);
    const totalPoints = weekActivities.reduce((sum, activity) => sum + activity.points, 0);
    
    return { totalHours, totalPoints };
  };

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading focus activities...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus Portfolio</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Star size={20} color={colors.warning} />
          <Text style={styles.statValue}>{todayStats.totalPoints}</Text>
          <Text style={styles.statLabel}>Today's Points</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp size={20} color={colors.success} />
          <Text style={styles.statValue}>{todayStats.totalHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Today's Focus</Text>
        </View>

        <View style={styles.statCard}>
          <Brain size={20} color={colors.primary} />
          <Text style={styles.statValue}>{weeklyStats.totalPoints}</Text>
          <Text style={styles.statLabel}>Weekly Points</Text>
        </View>

        <View style={styles.statCard}>
          <GraduationCap size={20} color="#8b5cf6" />
          <Text style={styles.statValue}>{weeklyStats.totalHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Weekly Focus</Text>
        </View>
      </View>

      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>Today's Activities</Text>
        
        {todayStats.activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No focus activities logged today</Text>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            {todayStats.activities.map((activity) => {
              const activityType = ACTIVITY_TYPES.find(type => type.key === activity.type);
              const IconComponent = activityType?.icon || Brain;
              
              return (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: `${activityType?.color}20` }]}>
                    <IconComponent size={20} color={activityType?.color || colors.primary} />
                  </View>
                  
                  <View style={styles.activityContent}>
                    <Text style={styles.activityName}>{activityType?.label || activity.type}</Text>
                    <Text style={styles.activityDetails}>
                      {activity.hours}h • {activity.points} points
                    </Text>
                  </View>
                  
                  <View style={styles.activityValue}>
                    <Text style={styles.activityValueText}>
                      +{activity.points}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.activityTypesSection}>
        <Text style={styles.sectionTitle}>Activity Types & Rates</Text>
        
        <View style={styles.typesList}>
          {ACTIVITY_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <View key={type.key} style={styles.typeItem}>
                <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                  <IconComponent size={16} color={type.color} />
                </View>
                
                <Text style={styles.typeName}>{type.label}</Text>
                
                <Text style={styles.typeRate}>{type.rate} pts/hr</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>🧠 Focus Insights</Text>
        <Text style={styles.insightText}>
          Every hour of focused activity builds your personal capital. Study and skill-building 
          activities give the highest point returns. Your {weeklyStats.totalHours.toFixed(1)} hours 
          this week are an investment in your future self!
        </Text>
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Focus Activity</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>Activity Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activitySelector}>
                {ACTIVITY_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = selectedActivity.key === type.key;
                  
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.activityOption,
                        isSelected && styles.activityOptionSelected,
                        { borderColor: type.color }
                      ]}
                      onPress={() => setSelectedActivity(type)}
                    >
                      <IconComponent size={24} color={isSelected ? '#ffffff' : type.color} />
                      <Text style={[
                        styles.activityOptionText,
                        isSelected && styles.activityOptionTextSelected
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={[
                        styles.activityOptionRate,
                        isSelected && styles.activityOptionRateSelected
                      ]}>
                        {type.rate} pts/hr
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalSectionTitle}>Hours Spent</Text>
              <View style={styles.sliderContainer}>
                <SimpleSlider
                  value={hours}
                  onValueChange={setHours}
                  maximumValue={8}
                  minimumValue={0}
                  step={0.1}
                />
              </View>

              {hours > 0 && (
                <View style={styles.pointsPreview}>
                  <Text style={styles.pointsPreviewText}>
                    You'll earn {calculateFocusPoints(selectedActivity.key, hours)} points
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={addActivity}
                  disabled={saving || hours === 0}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Adding...' : 'Add Activity'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  todaySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityValue: {
    alignItems: 'flex-end',
  },
  activityValueText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  activityTypesSection: {
    marginBottom: 32,
  },
  typesList: {
    gap: 8,
  },
  typeItem: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  typeRate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  activitySelector: {
    marginBottom: 24,
  },
  activityOption: {
    backgroundColor: `${colors.surface}80`,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  activityOptionSelected: {
    backgroundColor: `${colors.primary}60`,
  },
  activityOptionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  activityOptionTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  activityOptionRate: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityOptionRateSelected: {
    color: colors.textSecondary,
  },
  sliderContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 16,
  },
  pointsPreview: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  pointsPreviewText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.success,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  insightCard: {
    backgroundColor: `${colors.success}20`,
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
    color: colors.textSecondary,
    lineHeight: 20,
  },
});