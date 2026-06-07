import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, Spacing } from '@/constants/theme';

type StreakBadgeProps = {
  streak: number;
  xp: number;
};

export function StreakBadge({ streak, xp }: StreakBadgeProps) {
  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <ThemedText type="smallBold" style={styles.pillText}>
          🔥 {streak}
        </ThemedText>
      </View>
      <View style={[styles.pill, styles.xpPill]}>
        <ThemedText type="smallBold" style={styles.xpText}>
          ⚡ {xp} XP
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    backgroundColor: BrandColors.streakSoft,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  xpPill: {
    backgroundColor: BrandColors.primarySoft,
  },
  pillText: {
    color: BrandColors.streak,
    lineHeight: 20,
  },
  xpText: {
    color: BrandColors.primary,
    lineHeight: 20,
  },
});
