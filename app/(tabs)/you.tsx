import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { WalletOverview } from '@/components/WalletOverview';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { TermsOfService } from '@/components/TermsOfService';
import { HelpAndFAQ } from '@/components/HelpAndFAQ';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/attention-calculator';
import { exportToPDF, savePDFToDevice } from '@/utils/pdfExport';
import { useTheme } from '@/hooks/useTheme';
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
  FileText,
  Wallet,
  Trash
} from 'lucide-react-native';

type ViewMode = 'profile' | 'wallet' | 'privacy' | 'terms' | 'help';

export default function YouScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');
  const [currentView, setCurrentView] = useState<ViewMode>('profile');
  const [notifications, setNotifications] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const styles = createStyles(colors);

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

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data including screen time entries, goals, focus activities, subscriptions, and wallet information will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            // Second confirmation for extra safety
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will permanently delete all your PayMind data and cannot be recovered.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: performAccountDeletion,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      // Delete all user data from all tables
      const deletePromises = [
        supabase.from('screen_time_entries').delete().eq('user_id', user.id),
        supabase.from('subscriptions').delete().eq('user_id', user.id),
        supabase.from('distraction_logs').delete().eq('user_id', user.id),
        supabase.from('goals').delete().eq('user_id', user.id),
        supabase.from('focus_activities').delete().eq('user_id', user.id),
        supabase.from('attention_wallet').delete().eq('user_id', user.id),
      ];

      // Execute all deletions
      await Promise.all(deletePromises);

      // Sign out the user
      await signOut();

      // Navigate to onboarding
      router.replace('/onboarding');

      Alert.alert(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted. Thank you for using PayMind.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert(
        'Deletion Failed',
        'There was an error deleting your account. Please try again or contact support if the problem persists.',
        [{ text: 'OK' }]
      );
    } finally {
      setDeleting(false);
    }
  };

  const exportData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      if (Platform.OS === 'web') {
        // For web, generate HTML report and download
        const htmlContent = await exportToPDF(user.id);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `paymind-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert(
          'Export Complete',
          'Your attention report has been downloaded as an HTML file. You can open it in any browser or convert it to PDF using your browser\'s print function.',
          [{ text: 'OK' }]
        );
      } else {
        // For mobile, generate and share actual PDF
        await exportToPDF(user.id);
        
        Alert.alert(
          'PDF Export Complete',
          'Your PayMind attention report has been generated as a PDF and is ready to share or save to your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Error', 
        Platform.OS === 'web' 
          ? 'Failed to export your data. Please try again.'
          : 'Failed to generate PDF. Please check your device storage and try again.'
      );
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

  // Handle different view modes
  if (currentView === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentView('profile')} />;
  }

  if (currentView === 'terms') {
    return <TermsOfService onBack={() => setCurrentView('profile')} />;
  }

  if (currentView === 'help') {
    return <HelpAndFAQ onBack={() => setCurrentView('profile')} />;
  }

  const renderProfileContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          <User size={32} color={colors.primary} />
        </View>
        <Text style={styles.profileTitle}>Profile</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
          <View style={styles.settingContent}>
            <Settings size={20} color={colors.primary} />
            <Text style={styles.settingText}>App Settings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={toggleTheme}
        >
          <View style={styles.settingContent}>
            {isDarkMode ? (
              <Moon size={20} color={colors.primary} />
            ) : (
              <Sun size={20} color={colors.warning} />
            )}
            <Text style={styles.settingText}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <View style={[styles.toggle, isDarkMode && styles.toggleActive]}>
            <View style={[styles.toggleButton, isDarkMode && styles.toggleButtonActive]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setNotifications(!notifications)}
        >
          <View style={styles.settingContent}>
            <Bell size={20} color={colors.primary} />
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
            <Download size={20} color={colors.success} />
            <Text style={styles.settingText}>
              {exporting ? 'Generating PDF...' : Platform.OS === 'web' ? 'Export My Data' : 'Export PDF Report'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setCurrentView('privacy')}
        >
          <View style={styles.settingContent}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setCurrentView('terms')}
        >
          <View style={styles.settingContent}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.settingText}>Terms of Service</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share & Support</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={shareApp}>
          <View style={styles.settingContent}>
            <Share2 size={20} color={colors.success} />
            <Text style={styles.settingText}>Share PayMind</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setCurrentView('help')}
        >
          <View style={styles.settingContent}>
            <HelpCircle size={20} color={colors.primary} />
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
        <LogOut size={20} color={colors.error} />
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
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <User size={32} color={colors.primary} />
          <Text style={styles.title}>You</Text>
          <Text style={styles.subtitle}>
            Your profile, achievements, and settings
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <User size={16} color={activeTab === 'profile' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}
            onPress={() => setActiveTab('wallet')}
          >
            <Wallet size={16} color={activeTab === 'wallet' ? '#ffffff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>
              Wallet
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'profile' ? renderProfileContent() : <WalletOverview showAchievements={true} />}
      </View>
    </GradientBackground>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: colors.surface,
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
  deleteAccountItem: {
    backgroundColor: `${colors.error}10`,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  deleteAccountText: {
    color: colors.error,
    fontWeight: '600',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});