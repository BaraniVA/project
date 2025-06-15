import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useTheme } from '@/hooks/useTheme';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const styles = createStyles(colors);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [user, loading, router]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </GradientBackground>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});