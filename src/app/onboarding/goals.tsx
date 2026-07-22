import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ProgressBar progress={0.5} />
          <ThemedText type="subtitle" style={styles.title}>
            What brings you here?
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            We&apos;ll personalize your daily plan. You can change this later.
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <Pressable
                key={goal.id}
                onPress={() => setSelected(goal.id)}
                style={({ pressed }) => pressed && styles.pressed}>
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

        <PrimaryButton
          label="Continue"
          disabled={!selected}
          onPress={() => {
            if (selected) {
              setLearningGoal(selected);
              router.push('/onboarding/paywall?source=onboarding');
            }
          }}
        />
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
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
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
