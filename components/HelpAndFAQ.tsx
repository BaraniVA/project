import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { 
  CircleHelp as HelpCircle, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  Brain,
  DollarSign,
  Shield,
  Smartphone,
  Target,
  Download
} from 'lucide-react-native';

interface HelpAndFAQProps {
  onBack: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: any;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How does PayMind calculate attention value?',
    answer: 'PayMind calculates attention value based on your estimated earning potential (₹30,000/month default) divided by productive hours, then applies platform-specific profit weights. For example, TikTok has a higher weight (1.8x) because it generates more advertising revenue from your attention.',
    category: 'Calculations',
    icon: DollarSign,
  },
  {
    id: '2',
    question: 'Do I earn real money using PayMind?',
    answer: 'No, PayMind doesn\'t pay you money. Instead, it shows you how much your attention is worth and how much value you\'re giving away to tech companies. The goal is to help you make more intentional choices about your digital consumption.',
    category: 'Calculations',
    icon: DollarSign,
  },
  {
    id: '3',
    question: 'Is my data safe and private?',
    answer: 'Yes, your data is encrypted and stored securely. We never share your personal information with third parties or use it for advertising. You can export or delete your data at any time.',
    category: 'Privacy',
    icon: Shield,
  },
  {
    id: '4',
    question: 'How do I track my screen time accurately?',
    answer: 'PayMind relies on manual input for screen time tracking. Check your device\'s built-in screen time features (iOS: Settings > Screen Time, Android: Settings > Digital Wellbeing) and input the data daily for best results.',
    category: 'Tracking',
    icon: Smartphone,
  },
  {
    id: '5',
    question: 'What are focus points and how do I earn them?',
    answer: 'Focus points represent productive activities that build your personal capital. You earn points by logging activities like studying (100 pts/hr), exercise (80 pts/hr), or skill-building (95 pts/hr). These points track your investment in yourself.',
    category: 'Focus',
    icon: Brain,
  },
  {
    id: '6',
    question: 'How do goals work with my attention savings?',
    answer: 'Goals help you visualize what you could achieve by reducing screen time. You can allocate money from your attention wallet (earned through focus activities) toward your goals to see progress and stay motivated.',
    category: 'Goals',
    icon: Target,
  },
  {
    id: '7',
    question: 'Can I export my data?',
    answer: 'Yes! Go to Profile > Export My Data to download a comprehensive report of your attention tracking data, including screen time, focus activities, goals, and insights.',
    category: 'Data',
    icon: Download,
  },
  {
    id: '8',
    question: 'Why are some apps weighted differently?',
    answer: 'Apps have different profit weights based on their business models. Social media platforms like TikTok and Instagram generate more revenue per hour of user attention through advertising, so they have higher weights in our calculations.',
    category: 'Calculations',
    icon: DollarSign,
  },
  {
    id: '9',
    question: 'How is my streak calculated?',
    answer: 'Your streak counts consecutive days where you\'ve logged any activity in PayMind - whether it\'s screen time tracking, focus activities, or distraction logs. It resets if you miss a day.',
    category: 'Tracking',
    icon: Smartphone,
  },
  {
    id: '10',
    question: 'What should I do if I find the app overwhelming?',
    answer: 'Start small! Begin by tracking just one app\'s usage for a week. PayMind is designed to build awareness gradually. You don\'t need to track everything at once - focus on your biggest attention drains first.',
    category: 'Getting Started',
    icon: Brain,
  },
];

export function HelpAndFAQ({ onBack }: HelpAndFAQProps) {
  const { colors } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const styles = createStyles(colors);

  const categories = ['All', ...Array.from(new Set(FAQ_DATA.map(item => item.category)))];

  const filteredFAQ = selectedCategory === 'All' 
    ? FAQ_DATA 
    : FAQ_DATA.filter(item => item.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <HelpCircle size={28} color={colors.primary} />
          <Text style={styles.title}>Help & FAQ</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Find answers to common questions about PayMind
        </Text>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        <View style={styles.faqList}>
          {filteredFAQ.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const IconComponent = item.icon;

            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <View style={styles.faqQuestionContent}>
                    <IconComponent size={20} color={colors.primary} />
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronRight size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Can't find what you're looking for? We're here to help!
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Start by tracking your top 3 most-used apps for better focus
            </Text>
            <Text style={styles.tipItem}>
              • Set realistic goals - small changes compound over time
            </Text>
            <Text style={styles.tipItem}>
              • Use the lessons section to understand why apps are designed to be addictive
            </Text>
            <Text style={styles.tipItem}>
              • Check your attention wallet regularly to see your progress
            </Text>
          </View>
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
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  categoryFilter: {
    marginBottom: 24,
  },
  categoryFilterContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  faqList: {
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginLeft: 32,
  },
  contactSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  tipsSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});