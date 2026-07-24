import { router } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { TabScreenLayout } from '@/components/tab-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StreakBadge } from '@/components/ui/streak-badge';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';
import { BookColors, BookShadow, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { lessons } from '@/data/lessons';

async function openLegalUrl(url: string) {
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}

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
      <View style={styles.statCard}>
        <ThemedText type="smallBold" style={styles.sectionLabel}>
          Your stats
        </ThemedText>
        <View style={styles.statsGrid}>
          <StatItem label="Lessons done" value={String(completedLessonIds.length)} />
          <StatItem label="Completion" value={`${completionRate}%`} />
          <StatItem label="Daily goal" value={`${dailyGoalMinutes} min`} />
          <StatItem label="Plan" value={isPremium ? 'Premium' : 'Free'} />
        </View>
      </View>

      {learningGoal && (
        <View style={styles.card}>
          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Learning goal
          </ThemedText>
          <ThemedText type="small" style={styles.secondaryText}>
            {learningGoal}
          </ThemedText>
        </View>
      )}

      {!isPremium && (
        <PrimaryButton
          label="Upgrade to Premium"
          onPress={() => router.push('/onboarding/paywall?source=profile')}
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

      {__DEV__ && (
        <PrimaryButton
          label="Open onboarding (dev)"
          variant="ghost"
          onPress={() => router.push('/onboarding')}
        />
      )}

      <View style={styles.legalRow}>
        <Pressable
          onPress={() => openLegalUrl(TERMS_OF_SERVICE_URL)}
          accessibilityRole="link"
          accessibilityLabel="Open Terms of Service">
          <ThemedText type="small" style={styles.legalLink}>
            Terms
          </ThemedText>
        </Pressable>
        <ThemedText type="small" style={styles.legalSep}>
          ·
        </ThemedText>
        <Pressable
          onPress={() => openLegalUrl(PRIVACY_POLICY_URL)}
          accessibilityRole="link"
          accessibilityLabel="Open Privacy Policy">
          <ThemedText type="small" style={styles.legalLink}>
            Privacy Policy
          </ThemedText>
        </Pressable>
      </View>
    </TabScreenLayout>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <ThemedText type="smallBold" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={styles.secondaryText}>
        {label}
      </ThemedText>
    </View>
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
  sectionLabel: {
    color: BookColors.brown,
  },
  secondaryText: {
    color: BookColors.brownMuted,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  legalLink: {
    color: BookColors.brown,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalSep: {
    color: BookColors.brownMuted,
  },
  statCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
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
    backgroundColor: BookColors.brownSoft,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    color: BookColors.brown,
  },
  card: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.one,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  hint: {
    textAlign: 'center',
    color: BookColors.brownMuted,
  },
});
