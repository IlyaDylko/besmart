import { StyleSheet, View } from 'react-native';

import { BookColors, Spacing } from '@/constants/theme';

type SegmentedProgressProps = {
  total: number;
  current: number;
};

export function SegmentedProgress({ total, current }: SegmentedProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => {
        const isActive = index <= current;
        const isLast = index === total - 1;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              isLast && styles.lastSegment,
              { backgroundColor: isActive ? BookColors.brown : BookColors.brownSoft },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  lastSegment: {
    flex: 1.8,
  },
});
