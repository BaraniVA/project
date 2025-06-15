import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/attention-calculator';
import { 
  User, 
  Settings, 
  Download, 
  CircleHelp as HelpCircle, 
  Shield, 
  LogOut, 
  Moon, 
  Sun, 
  Bell,
  Share2,
  FileText
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const exportData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      // Fetch all user data
      const [screenTimeData, subscriptionsData, distractionsData, goalsData, focusData, walletData] = await Promise.all([
        supabase.from('screen_time_entries').select('*').eq('user_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id),
        supabase.from('distraction_logs').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('focus_activities').select('*').eq('user_id', user.id),
        supabase.from('attention_wallet').select('*').eq('user_id', user.id),
      ]);

      // Calculate summary statistics
      const totalScreenTime = screenTimeData.data?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
      const totalValueLost = screenTimeData.data?.reduce((sum, entry) => sum + entry.est_value_lost, 0) || 0;
      const totalFocusHours = focusData.data?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
      const totalSubscriptionCost = subscriptionsData.data?.reduce((sum, sub) => sum + sub.cost, 0) || 0;

      const exportSummary = {
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        summary: {
          totalScreenTimeHours: totalScreenTime,
          totalValueLost: formatCurrency(totalValueLost),
          totalFocusHours: totalFocusHours,
          totalSubscriptionCost: formatCurrency(totalSubscriptionCost),
          dataPoints: {
            screenTimeEntries: screenTimeData.data?.length || 0,
            subscriptions: subscriptionsData.data?.length || 0,
            distractionLogs: distractionsData.data?.length || 0,
            goals: goalsData.data?.length || 0,
            focusActivities: focusData.data?.length || 0,
          }
        },
        data: {
          screenTime: screenTimeData.data,
          subscriptions: subscriptionsData.data,
          distractions: distractionsData.data,
          goals: goalsData.data,
          focusActivities: focusData.data,
          wallet: walletData.data?.[0],
        }
      };

      // Create a shareable summary
      const shareText = `My PayMind Attention Report 📊

Total Screen Time: ${totalScreenTime.toFixed(1)} hours
Attention Value Lost: ${formatCurrency(totalValueLost)}
Focus Hours Logged: ${totalFocusHours.toFixed(1)} hours
Monthly Subscriptions: ${formatCurrency(totalSubscriptionCost)}

Generated on ${new Date().toLocaleDateString()}

#PayMind #AttentionEconomy #DigitalWellbeing`;

      // Share the summary
      await Share.share({
        message: shareText,
        title: 'My PayMind Attention Report',
      });

      Alert.alert(
        'Data Export Complete',
        'Your attention data summary has been shared. The complete data export would be available as a downloadable file in a production app.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out PayMind - Track your attention value and reclaim your focus! 🧠💰',
        title: 'PayMind - Attention Tracker',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <User size={32} color="#6366f1" />
          </View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Settings size={20} color="#6366f1" />
              <Text style={styles.settingText}>App Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setDarkMode(!darkMode)}
          >
            <View style={styles.settingContent}>
              {darkMode ? (
                <Moon size={20} color="#6366f1" />
              ) : (
                <Sun size={20} color="#f59e0b" />
              )}
              <Text style={styles.settingText}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <View style={[styles.toggle, darkMode && styles.toggleActive]}>
              <View style={[styles.toggleButton, darkMode && styles.toggleButtonActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setNotifications(!notifications)}
          >
            <View style={styles.settingContent}>
              <Bell size={20} color="#6366f1" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <View style={[styles.toggle, notifications && styles.toggleActive]}>
              <View style={[styles.toggleButton, notifications && styles.toggleButtonActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, exporting && styles.settingItemDisabled]} 
            onPress={exportData}
            disabled={exporting}
          >
            <View style={styles.settingContent}>
              <Download size={20} color="#10b981" />
              <Text style={styles.settingText}>
                {exporting ? 'Exporting...' : 'Export My Data'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Shield size={20} color="#6366f1" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <FileText size={20} color="#6366f1" />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share & Support</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={shareApp}>
            <View style={styles.settingContent}>
              <Share2 size={20} color="#10b981" />
              <Text style={styles.settingText}>Share PayMind</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <HelpCircle size={20} color="#6366f1" />
              <Text style={styles.settingText}>Help & FAQ</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About PayMind</Text>
          <Text style={styles.infoText}>
            PayMind helps you understand the true value of your attention and make 
            intentional choices about your digital consumption. Your data is private 
            and secure - we never share your information with third parties.
          </Text>
          <Text style={styles.infoText}>
            By tracking your digital habits, you can reclaim your focus, save money, 
            and invest your attention in activities that truly matter to you.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with focus and intentionality 🧠
          </Text>
          <Text style={styles.footerSubtext}>
            Your attention is valuable. Spend it wisely.
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
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#d1d5db',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleButtonActive: {
    alignSelf: 'flex-end',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});