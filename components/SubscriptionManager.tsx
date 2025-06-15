import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatCurrency, calculateSubscriptionROI } from '@/lib/attention-calculator';
import { CreditCard, Plus, X, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';

interface Subscription {
  id: string;
  name: string;
  cost: number;
  usage_hours: number;
}

interface SubscriptionManagerProps {
  showSummaryOnly?: boolean;
}

export function SubscriptionManager({ showSummaryOnly = false }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  const [newSubUsage, setNewSubUsage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const styles = createStyles(colors);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when component comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchSubscriptions();
    }, [user])
  );

  const addSubscription = async () => {
    if (!user || !newSubName || !newSubCost) {
      Alert.alert('Error', 'Please fill in subscription name and cost');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          name: newSubName,
          cost: parseFloat(newSubCost),
          usage_hours: parseFloat(newSubUsage) || 0,
        });

      if (error) throw error;

      setNewSubName('');
      setNewSubCost('');
      setNewSubUsage('');
      setShowAddForm(false);
      fetchSubscriptions();
      Alert.alert('Success', 'Subscription added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add subscription');
    } finally {
      setSaving(false);
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete subscription');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const getTotalMonthlyCost = () => {
    return subscriptions.reduce((sum, sub) => sum + sub.cost, 0);
  };

  const getROIAnalysis = (subscription: Subscription) => {
    return calculateSubscriptionROI(subscription.cost, subscription.usage_hours);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  if (showSummaryOnly) {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Monthly Subscriptions</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(getTotalMonthlyCost())}</Text>
        <Text style={styles.summarySubtext}>
          Across {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription ROI</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Total</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(getTotalMonthlyCost())}</Text>
        <Text style={styles.summarySubtext}>
          Across {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <CreditCard size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Subscriptions Yet</Text>
          <Text style={styles.emptyText}>
            Add your subscriptions to see how much value you're getting per hour
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.subscriptionsList} showsVerticalScrollIndicator={false}>
          {subscriptions.map((subscription) => {
            const roi = getROIAnalysis(subscription);
            return (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <Text style={styles.subscriptionName}>{subscription.name}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteSubscription(subscription.id)}
                    style={styles.deleteButton}
                  >
                    <X size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.subscriptionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Monthly Cost</Text>
                    <Text style={styles.detailValue}>{formatCurrency(subscription.cost)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Usage Hours</Text>
                    <Text style={styles.detailValue}>{subscription.usage_hours}h</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cost per Hour</Text>
                    <Text style={[
                      styles.detailValue,
                      roi.isWorthwhile ? styles.goodValue : styles.badValue
                    ]}>
                      {formatCurrency(roi.costPerHour)}
                    </Text>
                  </View>
                </View>

                <View style={[
                  styles.roiIndicator,
                  roi.isWorthwhile ? styles.roiGood : styles.roiBad
                ]}>
                  {roi.isWorthwhile ? (
                    <TrendingUp size={16} color={colors.success} />
                  ) : (
                    <TrendingDown size={16} color={colors.error} />
                  )}
                  <Text style={[
                    styles.roiText,
                    roi.isWorthwhile ? styles.roiTextGood : styles.roiTextBad
                  ]}>
                    {roi.isWorthwhile ? 'Good Value' : 'Expensive'}
                  </Text>
                </View>

                <Text style={styles.suggestion}>{roi.suggestion}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal for adding subscription */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Subscription</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Subscription name (e.g., Netflix)"
                placeholderTextColor={colors.textSecondary}
                value={newSubName}
                onChangeText={setNewSubName}
              />

              <TextInput
                style={styles.input}
                placeholder="Monthly cost (₹)"
                placeholderTextColor={colors.textSecondary}
                value={newSubCost}
                onChangeText={setNewSubCost}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Hours used per month (optional)"
                placeholderTextColor={colors.textSecondary}
                value={newSubUsage}
                onChangeText={setNewSubUsage}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={addSubscription}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Adding...' : 'Add'}
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
  summaryContainer: {
    backgroundColor: `${colors.primary}40`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
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
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  summaryCard: {
    backgroundColor: `${colors.primary}40`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
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
  subscriptionsList: {
    flex: 1,
  },
  subscriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  subscriptionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  goodValue: {
    color: colors.success,
  },
  badValue: {
    color: colors.error,
  },
  roiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  roiGood: {
    backgroundColor: `${colors.success}40`,
  },
  roiBad: {
    backgroundColor: `${colors.error}40`,
  },
  roiText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roiTextGood: {
    color: colors.success,
  },
  roiTextBad: {
    color: colors.error,
  },
  suggestion: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    fontStyle: 'italic',
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
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});