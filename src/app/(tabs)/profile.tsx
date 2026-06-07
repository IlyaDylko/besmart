import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TabScreenLayout } from '@/components/tab-screen-layout';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StreakBadge } from '@/components/ui/streak-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { lessons } from '@/data/lessons';

export default function ProfileScreen() {
  const {
    streak,
    xp,
    completedLessonIds,
    learningGoal,
    isPremium,
    dailyGoalMinutes,
    resetProgress,
  } = useApp();

  const completionRate = Math.round((completedLessonIds.length / lessons.length) * 100);

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Profile
          </ThemedText>
          <StreakBadge streak={streak} xp={xp} />
        </View>
      }>
      <ThemedView type="backgroundElement" style={styles.statCard}>
        <ThemedText type="smallBold">Your stats</ThemedText>
        <View style={styles.statsGrid}>
          <StatItem label="Lessons done" value={String(completedLessonIds.length)} />
          <StatItem label="Completion" value={`${completionRate}%`} />
          <StatItem label="Daily goal" value={`${dailyGoalMinutes} min`} />
          <StatItem label="Plan" value={isPremium ? 'Premium' : 'Free'} />
        </View>
      </ThemedView>

      {learningGoal && (
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Learning goal</ThemedText>
          <ThemedText themeColor="textSecondary">{learningGoal}</ThemedText>
        </ThemedView>
      )}

      {!isPremium && (
        <PrimaryButton
          label="Upgrade to Premium"
          onPress={() => router.push('/onboarding/paywall')}
        />
      )}

      <PrimaryButton
        label="Reset demo progress"
        variant="ghost"
        onPress={() => {
          resetProgress();
          router.replace('/onboarding');
        }}
      />

      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Edit content in src/data/ · Wire payments in onboarding/paywall.tsx
      </ThemedText>
    </TabScreenLayout>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.statItem}>
      <ThemedText type="smallBold" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  statCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statItem: {
    width: '47%',
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: '#00000008',
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
  },
  card: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.one,
  },
  hint: {
    textAlign: 'center',
  },
});
