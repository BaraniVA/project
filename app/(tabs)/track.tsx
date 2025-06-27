import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { AppIcon } from '@/components/AppIcon';
import { SimpleSlider } from '@/components/SimpleSlider';
import { DistractionInputForm } from '@/components/DistractionInputForm';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { calculateTimeLoss } from '@/lib/attention-calculator';
import { Save, Smartphone, CreditCard, Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const POPULAR_APPS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'Netflix',
  'Twitter',
  'WhatsApp',
  'Snapchat',
  'Reddit',
];

interface AppUsage {
  [key: string]: number;
}

export default function TrackScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'screen' | 'distractions' | 'subscriptions'>('screen');
  const [appUsage, setAppUsage] = useState<AppUsage>({});
  const [saving, setSaving] = useState(false);

  const styles = createStyles(colors);

  const updateAppUsage = (appName: string, hours: number) => {
    setAppUsage(prev => ({ ...prev, [appName]: hours }));
  };

  const getTotalHours = () => {
    return Object.values(appUsage).reduce((sum, hours) => sum + hours, 0);
  };

  const getTotalLoss = () => {
    return Object.entries(appUsage).reduce((sum, [app, hours]) => {
      return sum + calculateTimeLoss(app, hours);
    }, 0);
  };

  const saveScreenTime = async () => {
    if (!user) return;

    const entries = Object.entries(appUsage).filter(([, hours]) => hours > 0);
    
    if (entries.length === 0) {
      alert('Please track at least one app before saving.');
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('screen_time_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today);

      const entriesData = entries.map(([appName, hours]) => ({
        user_id: user.id,
        date: today,
        app_name: appName,
        hours,
        est_value_lost: calculateTimeLoss(appName, hours),
      }));

      const { error } = await supabase
        .from('screen_time_entries')
        .insert(entriesData);

      if (error) throw error;

      alert('Screen time saved successfully!');
      setAppUsage({});
    } catch (error) {
      alert('Failed to save screen time data.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'screen':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Track Screen Time</Text>
            <Text style={styles.tabSubtitle}>
              How much time did you spend on each app today?
            </Text>

            <View style={styles.trackingSection}>
              {POPULAR_APPS.map((appName) => (
                <View key={appName} style={styles.appTracker}>
                  <View style={styles.appInfo}>
                    <AppIcon appName={appName} size={28} />
                    <Text style={styles.appName}>{appName}</Text>
                  </View>
                  <SimpleSlider
                    value={appUsage[appName] || 0}
                    onValueChange={(value) => updateAppUsage(appName, value)}
                    maximumValue={12}
                  />
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Time</Text>
                <Text style={styles.summaryValue}>{getTotalHours().toFixed(1)} hours</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Loss</Text>
                <Text style={[styles.summaryValue, styles.lossValue]}>
                  ₹{getTotalLoss().toFixed(0)}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveScreenTime}
              disabled={saving}
            >
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Screen Time'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'distractions':
        return (
          <View style={styles.tabContent}>
            <DistractionInputForm onDataSaved={() => {}} />
          </View>
        );

      case 'subscriptions':
        return (
          <View style={styles.tabContent}>
            <SubscriptionManager />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Plus size={32} color={colors.primary} />
          <Text style={styles.title}>Track & Input</Text>
          <Text style={styles.subtitle}>
            Log your digital habits and activities
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'screen' && styles.activeTab]}
            onPress={() => setActiveTab('screen')}
          >
            <Smartphone size={16} color={activeTab === 'screen' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'screen' && styles.activeTabText]}>
              Screen Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'distractions' && styles.activeTab]}
            onPress={() => setActiveTab('distractions')}
          >
            <Smartphone size={16} color={activeTab === 'distractions' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'distractions' && styles.activeTabText]}>
              Distractions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'subscriptions' && styles.activeTab]}
            onPress={() => setActiveTab('subscriptions')}
          >
            <CreditCard size={16} color={activeTab === 'subscriptions' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'subscriptions' && styles.activeTabText]}>
              Subscriptions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
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
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  trackingSection: {
    marginBottom: 24,
  },
  appTracker: {
    marginBottom: 24,
    backgroundColor: `${colors.surface}80`,
    borderRadius: 16,
    padding: 20,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  lossValue: {
    color: colors.error,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    gap: 8,
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