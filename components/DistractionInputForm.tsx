import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Smartphone, Bell } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface DistractionInputFormProps {
  onDataSaved?: () => void;
}

export function DistractionInputForm({ onDataSaved }: DistractionInputFormProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [todayPickups, setTodayPickups] = useState('');
  const [todayNotifications, setTodayNotifications] = useState('');
  const [saving, setSaving] = useState(false);

  const styles = createStyles(colors);

  const saveToday = async () => {
    if (!user) return;

    const pickups = parseInt(todayPickups) || 0;
    const notifications = parseInt(todayNotifications) || 0;

    if (pickups === 0 && notifications === 0) {
      Alert.alert('No Data', 'Please enter at least one value');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('distraction_logs')
        .upsert({
          user_id: user.id,
          date: today,
          pickup_count: pickups,
          notification_count: notifications,
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      Alert.alert('Success', 'Distraction data saved!');
      setTodayPickups('');
      setTodayNotifications('');
      onDataSaved?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to save distraction data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Today's Distractions</Text>
      
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <Smartphone size={20} color={colors.primary} />
          <Text style={styles.inputLabel}>Phone Pickups</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={todayPickups}
            onChangeText={setTodayPickups}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputRow}>
          <Bell size={20} color={colors.warning} />
          <Text style={styles.inputLabel}>Notifications</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={todayNotifications}
            onChangeText={setTodayNotifications}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveToday}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Distractions'}
        </Text>
      </TouchableOpacity>
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
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  input: {
    backgroundColor: `${colors.surface}80`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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