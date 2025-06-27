import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@/components/GradientBackground';
import { BoltBadge } from '@/components/BoltBadge';
import { Brain, DollarSign, Target, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

export default function OnboardingScreen() {
  const [showFAQ, setShowFAQ] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <GradientBackground>
      <BoltBadge position="fixed" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>PayMind</Text>
          <Text style={styles.subtitle}>Track it. Own it. Reclaim it.</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <DollarSign size={40} color={colors.success} />
            <Text style={styles.featureTitle}>See Your Time's Value</Text>
            <Text style={styles.featureText}>
              Discover how much your attention is worth and where you're losing money daily
            </Text>
          </View>

          <View style={styles.feature}>
            <Target size={40} color={colors.warning} />
            <Text style={styles.featureTitle}>Set Meaningful Goals</Text>
            <Text style={styles.featureText}>
              Track how digital habits delay your real-world achievements
            </Text>
          </View>

          <View style={styles.feature}>
            <Brain size={40} color="#8b5cf6" />
            <Text style={styles.featureTitle}>Reclaim Focus</Text>
            <Text style={styles.featureText}>
              Build awareness and make intentional choices about your digital consumption
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/auth')}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowFAQ(true)}>
            <Text style={styles.secondaryButtonText}>Quick FAQ</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showFAQ} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Quick FAQ</Text>
                <TouchableOpacity onPress={() => setShowFAQ(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.faqContent}>
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Q: Do I earn real money?</Text>
                  <Text style={styles.faqAnswer}>
                    A: No. This app calculates how much your time is worth — and how much value you're giving away. 
                    It's about reclaiming your focus, not your paycheck.
                  </Text>
                </View>

                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Q: How do you calculate attention value?</Text>
                  <Text style={styles.faqAnswer}>
                    A: We use your estimated earning potential and factor in how much tech companies 
                    profit from your attention on their platforms.
                  </Text>
                </View>

                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Q: Is my data safe?</Text>
                  <Text style={styles.faqAnswer}>
                    A: Yes. All your personal data is encrypted and stored securely. We never share 
                    your information with third parties.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </GradientBackground>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  features: {
    marginBottom: 30,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 0,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
    padding: 0,
    maxHeight: '80%',
    width: '90%',
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
  faqContent: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 24,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});