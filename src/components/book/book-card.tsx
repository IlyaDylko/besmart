import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import type { Book } from '@/types/book';

type BookCardProps = {
  book: Book;
  onPress: () => void;
};

export function BookCard({ book, onPress }: BookCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <BookCover bookId={book.id} coverEmoji={book.coverEmoji} height={90} />
      <View style={styles.content}>
        <Text style={styles.headline} numberOfLines={2}>
          {book.headline}
        </Text>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {book.author}
          </Text>
        </View>
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
  content: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 14,
    fontWeight: '500',
    color: BookColors.brownMuted,
    lineHeight: 19,
    ...BookTypography.body,
  },
  bookInfo: {
    gap: 2,
  },
  bookTitle: {
    fontSize: 17,
    lineHeight: 22,
    color: BookColors.brown,
    ...BookTypography.display,
  },
  bookAuthor: {
    fontSize: 13,
    lineHeight: 17,
    color: BookColors.brownLight,
    fontWeight: '500',
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
