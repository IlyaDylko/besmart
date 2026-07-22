import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, MaxContentWidth, Spacing } from '@/constants/theme';
import { track } from '@/services/analytics';

export default function OnboardingWelcome() {
  useEffect(() => {
    track('onboarding_started');
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <ThemedText style={styles.emoji}>🧠</ThemedText>
          <ThemedText type="title" style={styles.title}>
            BeSmart
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            Bite-sized lessons for curious minds. Learn something new in 10 minutes a day.
          </ThemedText>
        </View>

        <View style={styles.features}>
          {[
            { emoji: '⚡', text: '10-minute interactive lessons' },
            { emoji: '🎯', text: 'Quizzes that help knowledge stick' },
            { emoji: '🔥', text: 'Daily streaks and progress tracking' },
          ].map((item) => (
            <ThemedView key={item.text} type="backgroundElement" style={styles.featureRow}>
              <ThemedText style={styles.featureEmoji}>{item.emoji}</ThemedText>
              <ThemedText>{item.text}</ThemedText>
            </ThemedView>
          ))}
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Get started" onPress={() => router.push('/onboarding/goals')} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
            Replace scrolling with learning
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.five,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    color: BrandColors.primary,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 320,
  },
  features: {
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  featureEmoji: {
    fontSize: 24,
  },
  actions: {
    gap: Spacing.two,
  },
  footer: {
    textAlign: 'center',
  },
});
