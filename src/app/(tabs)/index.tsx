import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { TabScreenLayout } from '@/components/tab-screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StreakBadge } from '@/components/ui/streak-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { getRecommendedLesson, getLesson } from '@/data/lessons';
import { getTopic } from '@/data/topics';
import type { LearningGoal } from '@/types/learning';

export default function TodayScreen() {
  const { streak, xp, completedLessonIds, dailyGoalMinutes, learningGoal, isPremium } = useApp();
  const recommended = getRecommendedLesson(completedLessonIds);
  const topic = getTopic(recommended.topicId);
  const completedToday = completedLessonIds.length > 0;
  const progress = Math.min(completedLessonIds.length / 3, 1);

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Good {getGreeting()}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.greeting}>
              Ready to learn?
            </ThemedText>
          </View>
          <StreakBadge streak={streak} xp={xp} />
        </View>
      }>
      <ThemedView type="backgroundElement" style={styles.dailyCard}>
        <ThemedText type="smallBold">Daily goal</ThemedText>
        <ThemedText themeColor="textSecondary">
          {dailyGoalMinutes} minutes · {completedToday ? 'In progress' : 'Not started'}
        </ThemedText>
        <ProgressBar progress={progress} />
        <ThemedText type="small" themeColor="textSecondary">
          {Math.round(progress * 100)}% of today&apos;s mini-goal
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.lessonCard}>
        <ThemedText type="small" themeColor="textSecondary">
          {topic?.emoji} {topic?.title ?? 'Recommended'}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.lessonTitle}>
          {recommended.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {recommended.durationMinutes} min · {recommended.slides.length} slides ·{' '}
          {recommended.quiz.length} quiz
        </ThemedText>
        <PrimaryButton
          label={completedLessonIds.includes(recommended.id) ? 'Review lesson' : 'Start lesson'}
          onPress={() => router.push(`/lesson/${recommended.id}`)}
        />
      </ThemedView>

      {learningGoal && (
        <ThemedView type="backgroundElement" style={styles.goalCard}>
          <ThemedText type="smallBold">Your goal</ThemedText>
          <ThemedText themeColor="textSecondary">{formatGoal(learningGoal)}</ThemedText>
        </ThemedView>
      )}

      {!isPremium && (
        <Pressable onPress={() => router.push('/onboarding/paywall')}>
          <ThemedView style={styles.premiumBanner}>
            <ThemedText type="smallBold" style={styles.premiumText}>
              ✨ Unlock all topics with Premium
            </ThemedText>
            <ThemedText type="small" style={styles.premiumSubtext}>
              Tap to see plans
            </ThemedText>
          </ThemedView>
        </Pressable>
      )}

      {completedLessonIds.length > 0 && (
        <View style={styles.recentSection}>
          <ThemedText type="smallBold">Recently completed</ThemedText>
          {completedLessonIds.slice(-3).reverse().map((id) => {
            const lesson = getLesson(id);
            if (!lesson) return null;
            return (
              <Pressable
                key={id}
                onPress={() => router.push(`/lesson/${id}`)}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundElement" style={styles.recentRow}>
                  <ThemedText>{lesson.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Review →
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      )}
    </TabScreenLayout>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function formatGoal(goal: LearningGoal) {
  const labels: Record<LearningGoal, string> = {
    curiosity: 'Feed my curiosity',
    career: 'Boost my career',
    memory: 'Train my memory',
    conversation: 'Sound smarter in conversation',
    habit: 'Build a daily learning habit',
  };
  return labels[goal];
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
  },
  dailyCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.two,
  },
  lessonCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    borderWidth: 2,
    borderColor: BrandColors.primarySoft,
  },
  lessonTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  goalCard: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.one,
  },
  premiumBanner: {
    padding: Spacing.four,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    gap: Spacing.one,
  },
  premiumText: {
    color: '#FFFFFF',
  },
  premiumSubtext: {
    color: '#FFFFFFCC',
  },
  recentSection: {
    gap: Spacing.two,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
