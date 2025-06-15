import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FileText, ArrowLeft, Scale, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <FileText size={28} color={colors.primary} />
          <Text style={styles.title}>Terms of Service</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agreement to Terms</Text>
          <Text style={styles.sectionText}>
            By using PayMind, you agree to these terms. If you disagree with any part of these terms, please discontinue use of our service.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>What PayMind Provides</Text>
          </View>
          <Text style={styles.sectionText}>
            PayMind is a digital wellness tool that helps you:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Track and analyze your screen time</Text>
            <Text style={styles.bulletPoint}>• Calculate the value of your attention</Text>
            <Text style={styles.bulletPoint}>• Set and monitor digital wellness goals</Text>
            <Text style={styles.bulletPoint}>• Understand attention economics</Text>
            <Text style={styles.bulletPoint}>• Export your personal data</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Your Responsibilities</Text>
          </View>
          <Text style={styles.sectionText}>
            As a PayMind user, you agree to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Provide accurate information</Text>
            <Text style={styles.bulletPoint}>• Use the service for personal, non-commercial purposes</Text>
            <Text style={styles.bulletPoint}>• Respect intellectual property rights</Text>
            <Text style={styles.bulletPoint}>• Not attempt to reverse engineer the application</Text>
            <Text style={styles.bulletPoint}>• Keep your account credentials secure</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <XCircle size={20} color={colors.error} />
            <Text style={styles.sectionTitle}>Prohibited Uses</Text>
          </View>
          <Text style={styles.sectionText}>
            You may not use PayMind to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Violate any laws or regulations</Text>
            <Text style={styles.bulletPoint}>• Share false or misleading information</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access</Text>
            <Text style={styles.bulletPoint}>• Interfere with service operation</Text>
            <Text style={styles.bulletPoint}>• Use automated tools to access the service</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.sectionText}>
            PayMind and its content are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your personal data while granting us permission to process it as described in our Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={20} color={colors.warning} />
            <Text style={styles.sectionTitle}>Disclaimers</Text>
          </View>
          <Text style={styles.sectionText}>
            PayMind is provided "as is" without warranties. We make no guarantees about:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Accuracy of attention value calculations</Text>
            <Text style={styles.bulletPoint}>• Uninterrupted service availability</Text>
            <Text style={styles.bulletPoint}>• Specific outcomes from using our recommendations</Text>
            <Text style={styles.bulletPoint}>• Compatibility with all devices</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            PayMind's liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages arising from your use of the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Termination</Text>
          <Text style={styles.sectionText}>
            You may delete your account at any time. We may suspend or terminate accounts that violate these terms. Upon termination, your access to the service ends, and your data will be deleted as outlined in our Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Modifications</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify, suspend, or discontinue PayMind at any time. We will provide reasonable notice of significant changes that affect your use of the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Governing Law</Text>
          <Text style={styles.sectionText}>
            These terms are governed by applicable data protection and consumer protection laws. Disputes will be resolved through binding arbitration where legally permitted.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We may update these terms to reflect changes in our service or legal requirements. Continued use of PayMind after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.sectionText}>
            Questions about these terms? Contact us at legal@paymind.app
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These terms ensure PayMind remains a safe, ethical platform for digital wellness.
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