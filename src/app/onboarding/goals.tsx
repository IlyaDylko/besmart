import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useTheme } from '@/hooks/use-theme';
import type { LearningGoal } from '@/types/learning';

const GOALS: { id: LearningGoal; title: string; subtitle: string; emoji: string }[] = [
  {
    id: 'curiosity',
    title: 'Feed my curiosity',
    subtitle: 'Explore history, science, art, and more',
    emoji: '✨',
  },
  {
    id: 'career',
    title: 'Boost my career',
    subtitle: 'Learn skills and ideas that matter at work',
    emoji: '🚀',
  },
  {
    id: 'memory',
    title: 'Train my memory',
    subtitle: 'Short quizzes and spaced repetition',
    emoji: '🧩',
  },
  {
    id: 'conversation',
    title: 'Sound smarter in conversation',
    subtitle: 'Interesting facts and clear explanations',
    emoji: '💬',
  },
  {
    id: 'habit',
    title: 'Build a daily learning habit',
    subtitle: 'Replace doomscrolling with 10 focused minutes',
    emoji: '📱',
  },
];

export default function OnboardingGoals() {
  const { setLearningGoal } = useApp();
  const [selected, setSelected] = useState<LearningGoal | null>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const footerPaddingBottom = Math.max(insets.bottom, Spacing.three) + Spacing.two;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: insets.top + Spacing.two,
            paddingBottom: 88 + footerPaddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <ProgressBar progress={0.5} />
          <ThemedText type="subtitle" style={styles.title}>
            What brings you here?
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            We&apos;ll personalize your daily plan. You can change this later.
          </ThemedText>
        </View>

        {GOALS.map((goal) => {
          const isSelected = selected === goal.id;
          return (
            <Pressable
              key={goal.id}
              onPress={() => setSelected(goal.id)}
              style={({ pressed }) => [pressed && styles.pressed]}>
              <ThemedView
                type={isSelected ? 'backgroundSelected' : 'backgroundElement'}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}>
                <ThemedText style={styles.emoji}>{goal.emoji}</ThemedText>
                <View style={styles.goalText}>
                  <ThemedText type="smallBold">{goal.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {goal.subtitle}
                  </ThemedText>
                </View>
              </ThemedView>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.footer,
          {
            paddingBottom: footerPaddingBottom,
            backgroundColor: theme.background,
          },
        ]}>
        <PrimaryButton
          label="Continue"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            setLearningGoal(selected);
            router.push('/onboarding/paywall?source=onboarding');
          }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listScroll: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  goalCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: BrandColors.primary,
  },
  emoji: {
    fontSize: 28,
  },
  goalText: {
    flex: 1,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.85,
  },
});
