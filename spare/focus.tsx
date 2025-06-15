import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { AnimatedSlider } from '@/components/AnimatedSlider';
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

export default function FocusScreen() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<FocusActivity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITY_TYPES[0]);
  const [hours, setHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      Alert.alert('Success', `Added ${hours}h of ${selectedActivity.label} (+${points} points)!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add focus activity');
    } finally {
      setSaving(false);
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

      // Upsert wallet data
      await supabase
        .from('attention_wallet')
        .upsert({
          user_id: user.id,
          total_saved_time: newSavedTime,
          total_points: newPoints,
          money_saved: newMoneySaved,
          streak_days: wallet?.streak_days || 0,
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

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Brain size={32} color="#10b981" />
          <Text style={styles.title}>Focus Portfolio</Text>
          <Text style={styles.subtitle}>
            Build your personal capital through focused activities
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Star size={24} color="#fbbf24" />
            <Text style={styles.statValue}>{todayStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Today's Points</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10b981" />
            <Text style={styles.statValue}>{todayStats.totalHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Today's Focus</Text>
          </View>

          <View style={styles.statCard}>
            <Brain size={24} color="#6366f1" />
            <Text style={styles.statValue}>{weeklyStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Weekly Points</Text>
          </View>

          <View style={styles.statCard}>
            <GraduationCap size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{weeklyStats.totalHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Weekly Focus</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Log Focus Activity</Text>
        </TouchableOpacity>

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
                      <IconComponent size={20} color={activityType?.color || '#6366f1'} />
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

        <Modal visible={showAddModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Focus Activity</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
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
                  <AnimatedSlider
                    value={hours}
                    onValueChange={setHours}
                    maximumValue={8}
                    label=""
                    minimumValue={0}
                    step={0.5}
                  />
                  <Text style={styles.sliderValueText}>{hours.toFixed(1)} hours</Text>
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
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🧠 Focus Insights</Text>
          <Text style={styles.insightText}>
            Every hour of focused activity builds your personal capital. Study and skill-building 
            activities give the highest point returns. Your {weeklyStats.totalHours.toFixed(1)} hours 
            this week are an investment in your future self!
          </Text>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  todaySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#ffffff',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 14,
    color: '#9ca3af',
  },
  activityValue: {
    alignItems: 'flex-end',
  },
  activityValueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  activityTypesSection: {
    marginBottom: 32,
  },
  typesList: {
    gap: 8,
  },
  typeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#ffffff',
    flex: 1,
  },
  typeRate: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
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
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  activitySelector: {
    marginBottom: 24,
  },
  activityOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  activityOptionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  activityOptionText: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 8,
    textAlign: 'center',
  },
  activityOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activityOptionRate: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  activityOptionRateSelected: {
    color: '#d1d5db',
  },
  pointsPreview: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  pointsPreviewText: {
    fontSize: 14,
    color: '#10b981',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#10b981',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  sliderContainer: {
  paddingHorizontal: 10,
  paddingVertical: 10,
  marginBottom: 16,
},
sliderValueText: {
  fontSize: 16,
  color: '#ffffff',
  textAlign: 'center',
  marginTop: 8,
  fontWeight: '600',
},
});