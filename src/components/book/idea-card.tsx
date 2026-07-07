import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import type { BookIdea } from '@/types/book';

type IdeaCardProps = {
  idea: BookIdea;
  bookTitle?: string;
  selected?: boolean;
  completed?: boolean;
  onPress: () => void;
};

export function IdeaCard({ idea, bookTitle, selected, completed, onPress }: IdeaCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={[styles.card, selected && styles.selected]}>
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          <ThemedText style={styles.emoji}>{idea.emoji}</ThemedText>
        </View>
        <View style={styles.content}>
          {bookTitle ? (
            <ThemedText type="small" style={styles.bookTitle} numberOfLines={1}>
              {bookTitle}
            </ThemedText>
          ) : null}
          <ThemedText type="smallBold" style={styles.title} numberOfLines={2}>
            {idea.title}
          </ThemedText>
          <ThemedText type="small" style={styles.duration}>
            {idea.durationMinutes} min
          </ThemedText>
        </View>
        {completed ? (
          <SymbolView
            name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
            size={18}
            tintColor={BookColors.brown}
          />
        ) : (
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right' }}
            size={14}
            weight="semibold"
            tintColor={BookColors.brownMuted}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  selected: {
    backgroundColor: BookColors.brownSelected,
    borderColor: BookColors.brown,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BookColors.brownSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: '#FFFFFF',
  },
  emoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  bookTitle: {
    color: BookColors.brownMuted,
    fontSize: 12,
  },
  title: {
    color: BookColors.brown,
    ...BookTypography.body,
    fontSize: 15,
    fontWeight: '600',
  },
  duration: {
    color: BookColors.brownMuted,
    fontSize: 13,
  },
});
