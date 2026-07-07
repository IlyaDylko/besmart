import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { TabScreenLayout } from '@/components/tab-screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StreakBadge } from '@/components/ui/streak-badge';
import { ThemedText } from '@/components/themed-text';
import { BookColors, BookShadow, BrandColors, Spacing } from '@/constants/theme';
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
            <ThemedText type="small" style={styles.secondaryText}>
              Good {getGreeting()}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.greeting}>
              Ready to learn?
            </ThemedText>
          </View>
          <StreakBadge streak={streak} xp={xp} />
        </View>
      }>
      <View style={styles.dailyCard}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          Daily goal
        </ThemedText>
        <ThemedText style={styles.secondaryText}>
          {dailyGoalMinutes} minutes · {completedToday ? 'In progress' : 'Not started'}
        </ThemedText>
        <ProgressBar
          progress={progress}
          color={BookColors.brown}
          trackColor={BookColors.brownSoft}
        />
        <ThemedText type="small" style={styles.secondaryText}>
          {Math.round(progress * 100)}% of today&apos;s mini-goal
        </ThemedText>
      </View>

      <View style={styles.lessonCard}>
        <ThemedText type="small" style={styles.secondaryText}>
          {topic?.emoji} {topic?.title ?? 'Recommended'}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.lessonTitle}>
          {recommended.title}
        </ThemedText>
        <ThemedText style={styles.secondaryText}>
          {recommended.durationMinutes} min · {recommended.slides.length} slides ·{' '}
          {recommended.quiz.length} quiz
        </ThemedText>
        <PrimaryButton
          label={completedLessonIds.includes(recommended.id) ? 'Review lesson' : 'Start lesson'}
          onPress={() => router.push(`/lesson/${recommended.id}`)}
        />
      </View>

      {learningGoal && (
        <View style={styles.goalCard}>
          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Your goal
          </ThemedText>
          <ThemedText style={styles.secondaryText}>{formatGoal(learningGoal)}</ThemedText>
        </View>
      )}

      {!isPremium && (
        <Pressable onPress={() => router.push('/onboarding/paywall')}>
          <View style={styles.premiumBanner}>
            <ThemedText type="smallBold" style={styles.premiumText}>
              ✨ Unlock all topics with Premium
            </ThemedText>
            <ThemedText type="small" style={styles.premiumSubtext}>
              Tap to see plans
            </ThemedText>
          </View>
        </Pressable>
      )}

      {completedLessonIds.length > 0 && (
        <View style={styles.recentSection}>
          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Recently completed
          </ThemedText>
          {completedLessonIds.slice(-3).reverse().map((id) => {
            const lesson = getLesson(id);
            if (!lesson) return null;
            return (
              <Pressable
                key={id}
                onPress={() => router.push(`/lesson/${id}`)}
                style={({ pressed }) => pressed && styles.pressed}>
                <View style={styles.recentRow}>
                  <ThemedText style={styles.rowTitle}>{lesson.title}</ThemedText>
                  <ThemedText type="small" style={styles.secondaryText}>
                    Review →
                  </ThemedText>
                </View>
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
    color: BookColors.brown,
  },
  sectionLabel: {
    color: BookColors.brown,
  },
  secondaryText: {
    color: BookColors.brownMuted,
  },
  rowTitle: {
    color: BookColors.brown,
  },
  dailyCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.two,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  lessonCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    backgroundColor: BookColors.card,
    borderWidth: 1.5,
    borderColor: BookColors.brown,
    ...BookShadow.card,
  },
  lessonTitle: {
    fontSize: 24,
    lineHeight: 30,
    color: BookColors.brown,
  },
  goalCard: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.one,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
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
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  pressed: {
    opacity: 0.85,
  },
});
