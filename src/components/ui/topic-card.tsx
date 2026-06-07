import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Topic } from '@/types/learning';

type TopicCardProps = {
  topic: Topic;
  onPress: () => void;
  completedCount?: number;
};

export function TopicCard({ topic, onPress, completedCount = 0 }: TopicCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedView style={[styles.iconWrap, { backgroundColor: `${topic.color}22` }]}>
          <ThemedText style={styles.emoji}>{topic.emoji}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.content}>
          <ThemedText type="smallBold">{topic.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {topic.description}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {completedCount}/{topic.lessonCount} lessons
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
});
