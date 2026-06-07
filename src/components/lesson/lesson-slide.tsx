import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { LessonSlide as LessonSlideType } from '@/types/learning';

type LessonSlideProps = {
  slide: LessonSlideType;
  index: number;
  total: number;
};

export function LessonSlide({ slide, index, total }: LessonSlideProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Slide {index + 1} of {total}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.title}>
        {slide.title}
      </ThemedText>
      <ThemedText style={styles.body}>{slide.body}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    fontSize: 18,
    lineHeight: 28,
  },
});
