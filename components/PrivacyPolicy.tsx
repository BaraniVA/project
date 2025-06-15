import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Shield, ArrowLeft, Eye, Lock, Database, UserCheck } from 'lucide-react-native';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Shield size={28} color={colors.primary} />
          <Text style={styles.title}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Information We Collect</Text>
          </View>
          <Text style={styles.sectionText}>
            PayMind collects only the information necessary to provide our attention tracking services:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Account information (email address)</Text>
            <Text style={styles.bulletPoint}>• Screen time data you manually input</Text>
            <Text style={styles.bulletPoint}>• Focus activity logs</Text>
            <Text style={styles.bulletPoint}>• Subscription information you add</Text>
            <Text style={styles.bulletPoint}>• Goal and achievement data</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          </View>
          <Text style={styles.sectionText}>
            Your data is used exclusively to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Calculate attention value and insights</Text>
            <Text style={styles.bulletPoint}>• Track your progress toward goals</Text>
            <Text style={styles.bulletPoint}>• Provide personalized recommendations</Text>
            <Text style={styles.bulletPoint}>• Generate your attention reports</Text>
            <Text style={styles.bulletPoint}>• Maintain your account and preferences</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Data Protection</Text>
          </View>
          <Text style={styles.sectionText}>
            We implement industry-standard security measures:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• End-to-end encryption for all data transmission</Text>
            <Text style={styles.bulletPoint}>• Secure database storage with access controls</Text>
            <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
            <Text style={styles.bulletPoint}>• No third-party data sharing</Text>
            <Text style={styles.bulletPoint}>• Data minimization practices</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserCheck size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Your Rights</Text>
          </View>
          <Text style={styles.sectionText}>
            You have complete control over your data:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Access: View all your stored data</Text>
            <Text style={styles.bulletPoint}>• Export: Download your complete data archive</Text>
            <Text style={styles.bulletPoint}>• Delete: Remove your account and all associated data</Text>
            <Text style={styles.bulletPoint}>• Correct: Update or modify your information</Text>
            <Text style={styles.bulletPoint}>• Portability: Transfer your data to other services</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.sectionText}>
            PayMind does not sell, rent, or share your personal data with third parties. Your attention data remains private and is never used for advertising or marketing purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.sectionText}>
            We retain your data only as long as your account is active. When you delete your account, all personal data is permanently removed within 30 days.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies and Tracking</Text>
          <Text style={styles.sectionText}>
            PayMind uses minimal, essential cookies only for authentication and app functionality. We do not use tracking cookies or analytics that compromise your privacy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.sectionText}>
            PayMind is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this privacy policy to reflect changes in our practices or legal requirements. Users will be notified of significant changes via email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            For questions about this privacy policy or your data, contact us at privacy@paymind.app
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your privacy is fundamental to PayMind's mission of helping you reclaim your attention.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginLeft: 16,
  },
  bulletPoint: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  footer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});