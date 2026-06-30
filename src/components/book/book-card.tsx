import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import type { Book } from '@/types/book';

type BookCardProps = {
  book: Book;
  onPress: () => void;
};

export function BookCard({ book, onPress }: BookCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cover}>
        <Text style={styles.coverEmoji}>{book.coverEmoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.headline} numberOfLines={2}>
          {book.headline}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {book.title} by {book.author}
        </Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{book.category}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  cover: {
    width: 68,
    height: 90,
    borderRadius: 10,
    backgroundColor: BookColors.brownSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 32,
    lineHeight: 38,
  },
  content: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 15,
    fontWeight: '600',
    color: BookColors.brown,
    lineHeight: 20,
    ...BookTypography.body,
  },
  meta: {
    fontSize: 13,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: BookColors.brown,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    marginTop: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    ...BookTypography.body,
  },
});
