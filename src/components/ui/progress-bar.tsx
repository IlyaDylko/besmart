import { StyleSheet, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';

type ProgressBarProps = {
  progress: number;
  color?: string;
  trackColor?: string;
};

export function ProgressBar({
  progress,
  color = BrandColors.primary,
  trackColor = BrandColors.primarySoft,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
