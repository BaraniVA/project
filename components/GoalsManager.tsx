import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/attention-calculator';
import { Target, Plus, Calendar, TrendingUp, X, DollarSign, Wallet } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_saved: number;
  estimated_days_delayed: number;
}

interface WalletData {
  money_saved: number;
}

export function GoalsManager() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [walletData, setWalletData] = useState<WalletData>({ money_saved: 0 });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [amountToAddToGoal, setAmountToAddToGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingGoal, setUpdatingGoal] = useState(false);

  const styles = createStyles(colors);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attention_wallet')
        .select('money_saved')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setWalletData({ money_saved: data?.money_saved || 0 });
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    }
  };

  // Use useFocusEffect to refresh data when component comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchGoals();
      fetchWalletData();
    }, [user])
  );

  const addGoal = async () => {
    if (!user || !newGoalTitle || !newGoalAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: newGoalTitle,
          target_amount: parseFloat(newGoalAmount),
          current_saved: 0,
          estimated_days_delayed: 0,
        });

      if (error) throw error;

      setNewGoalTitle('');
      setNewGoalAmount('');
      setShowAddGoal(false);
      fetchGoals();
      Alert.alert('Success', 'Goal added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add goal');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGoalSaved = async () => {
    if (!user || !selectedGoal || !amountToAddToGoal) {
      Alert.alert('Error', 'Please enter an amount to add');
      return;
    }

    const amountToAdd = parseFloat(amountToAddToGoal);
    
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    if (amountToAdd > walletData.money_saved) {
      Alert.alert(
        'Insufficient Funds', 
        `You only have ${formatCurrency(walletData.money_saved)} available in your attention wallet.`
      );
      return;
    }

    setUpdatingGoal(true);
    try {
      // Calculate new values
      const newCurrentSaved = selectedGoal.current_saved + amountToAdd;
      const newMoneySaved = walletData.money_saved - amountToAdd;
      
      // Calculate new estimated days delayed
      const remaining = selectedGoal.target_amount - newCurrentSaved;
      const dailySavingsRate = 187.5; // ₹187.5 per hour of attention value
      const newEstimatedDays = remaining > 0 ? Math.ceil(remaining / dailySavingsRate) : 0;

      // Update goal in database
      const { error: goalError } = await supabase
        .from('goals')
        .update({
          current_saved: newCurrentSaved,
          estimated_days_delayed: newEstimatedDays,
        })
        .eq('id', selectedGoal.id);

      if (goalError) throw goalError;

      // Update wallet in database
      const { error: walletError } = await supabase
        .from('attention_wallet')
        .update({
          money_saved: newMoneySaved,
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Update local state
      setWalletData({ money_saved: newMoneySaved });
      
      // Reset form and close modal
      setAmountToAddToGoal('');
      setSelectedGoal(null);
      setShowUpdateModal(false);
      
      // Refresh goals
      fetchGoals();
      
      Alert.alert(
        'Success', 
        `Added ${formatCurrency(amountToAdd)} to "${selectedGoal.title}". ${
          newCurrentSaved >= selectedGoal.target_amount 
            ? 'Congratulations! You\'ve reached your goal!' 
            : `${formatCurrency(selectedGoal.target_amount - newCurrentSaved)} remaining.`
        }`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal. Please try again.');
      console.error('Update goal error:', error);
    } finally {
      setUpdatingGoal(false);
    }
  };

  const deleteGoal = async (id: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchGoals();
    fetchWalletData();
  }, [user]);

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current_saved / goal.target_amount) * 100, 100);
  };

  const calculateDaysToGoal = (goal: Goal) => {
    const remaining = goal.target_amount - goal.current_saved;
    if (remaining <= 0) return 0;
    
    const dailySavingsRate = 187.5;
    return Math.ceil(remaining / dailySavingsRate);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddGoal(true)}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Wallet Balance Display */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Wallet size={20} color={colors.success} />
          <Text style={styles.walletTitle}>Available to Allocate</Text>
        </View>
        <Text style={styles.walletAmount}>
          {formatCurrency(walletData.money_saved)}
        </Text>
        <Text style={styles.walletSubtext}>
          From your attention savings
        </Text>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Goals Yet</Text>
          <Text style={styles.emptyText}>
            Set a financial goal and see how reducing screen time can help you achieve it faster
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <TouchableOpacity 
                  onPress={() => deleteGoal(goal.id)}
                  style={styles.deleteButton}
                >
                  <X size={16} color={colors.error} />
                </TouchableOpacity>
              </View>

              <Text style={styles.goalAmount}>
                {formatCurrency(goal.target_amount)}
              </Text>

              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${calculateProgress(goal)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {calculateProgress(goal).toFixed(1)}% complete
                </Text>
              </View>

              <View style={styles.goalStats}>
                <View style={styles.stat}>
                  <Calendar size={16} color={colors.primary} />
                  <Text style={styles.statLabel}>Days to Goal</Text>
                  <Text style={styles.statValue}>{calculateDaysToGoal(goal)}</Text>
                </View>

                <View style={styles.stat}>
                  <TrendingUp size={16} color={colors.success} />
                  <Text style={styles.statLabel}>Saved</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(goal.current_saved)}
                  </Text>
                </View>
              </View>

              {/* Add Money Button */}
              <TouchableOpacity 
                style={[
                  styles.addMoneyButton,
                  walletData.money_saved === 0 && styles.addMoneyButtonDisabled
                ]}
                onPress={() => {
                  setSelectedGoal(goal);
                  setShowUpdateModal(true);
                }}
                disabled={walletData.money_saved === 0}
              >
                <DollarSign size={16} color="#ffffff" />
                <Text style={styles.addMoneyButtonText}>
                  {walletData.money_saved === 0 ? 'No Funds Available' : 'Add Saved Amount'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal for adding goal */}
      <Modal visible={showAddGoal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Goal</Text>
              <TouchableOpacity onPress={() => setShowAddGoal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Goal title (e.g., New iPhone)"
                placeholderTextColor={colors.textSecondary}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />

              <TextInput
                style={styles.input}
                placeholder="Target amount (₹)"
                placeholderTextColor={colors.textSecondary}
                value={newGoalAmount}
                onChangeText={setNewGoalAmount}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddGoal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveGoalButton, saving && styles.saveGoalButtonDisabled]}
                  onPress={addGoal}
                  disabled={saving}
                >
                  <Text style={styles.saveGoalButtonText}>
                    {saving ? 'Adding...' : 'Add Goal'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for updating goal saved amount */}
      <Modal visible={showUpdateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Goal</Text>
              <TouchableOpacity onPress={() => {
                setShowUpdateModal(false);
                setSelectedGoal(null);
                setAmountToAddToGoal('');
              }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedGoal && (
                <View style={styles.goalSummary}>
                  <Text style={styles.goalSummaryTitle}>{selectedGoal.title}</Text>
                  <Text style={styles.goalSummaryProgress}>
                    {formatCurrency(selectedGoal.current_saved)} of {formatCurrency(selectedGoal.target_amount)}
                  </Text>
                </View>
              )}

              <View style={styles.availableFunds}>
                <Text style={styles.availableFundsLabel}>Available to allocate:</Text>
                <Text style={styles.availableFundsAmount}>
                  {formatCurrency(walletData.money_saved)}
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Amount to add (₹)"
                placeholderTextColor={colors.textSecondary}
                value={amountToAddToGoal}
                onChangeText={setAmountToAddToGoal}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowUpdateModal(false);
                    setSelectedGoal(null);
                    setAmountToAddToGoal('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveGoalButton, updatingGoal && styles.saveGoalButtonDisabled]}
                  onPress={handleUpdateGoalSaved}
                  disabled={updatingGoal}
                >
                  <Text style={styles.saveGoalButtonText}>
                    {updatingGoal ? 'Adding...' : 'Add Amount'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCard: {
    backgroundColor: `${colors.success}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  walletSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  goalsList: {
    flex: 1,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
  goalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: `${colors.surface}80`,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addMoneyButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addMoneyButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  addMoneyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
  },
  goalSummary: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  goalSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  goalSummaryProgress: {
    fontSize: 14,
    color: colors.primary,
  },
  availableFunds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  availableFundsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  availableFundsAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  input: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  saveGoalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveGoalButtonDisabled: {
    opacity: 0.6,
  },
  saveGoalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});