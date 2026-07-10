import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import { getIdeaTeaser } from '@/data/books';
import type { BookIdea } from '@/types/book';

type DiscoverIdeaCardProps = {
  idea: BookIdea;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverEmoji: string;
  completed?: boolean;
  onPress: () => void;
};

const COVER_HEIGHT = 132;

export function DiscoverIdeaCard({
  idea,
  bookId,
  bookTitle,
  bookAuthor,
  coverEmoji,
  completed,
  onPress,
}: DiscoverIdeaCardProps) {
  const teaser = getIdeaTeaser(idea);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, completed && styles.completed]}>
      <BookCover
        bookId={bookId}
        coverEmoji={coverEmoji}
        height={COVER_HEIGHT}
        emojiSize={36}
        shadow
      />
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {bookTitle}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.duration}>{idea.durationMinutes} min</Text>
          {completed ? (
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
              size={14}
              tintColor={BookColors.brown}
              style={styles.check}
            />
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {idea.title}
        </Text>
        {teaser ? (
          <Text style={styles.teaser} numberOfLines={3}>
            {teaser}
          </Text>
        ) : null}
        <Text style={styles.author} numberOfLines={1}>
          {bookAuthor}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 24,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  completed: {
    backgroundColor: BookColors.brownSelected,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookTitle: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    color: BookColors.brownMuted,
    letterSpacing: 0.2,
    ...BookTypography.body,
  },
  dot: {
    fontSize: 12,
    color: BookColors.brownMuted,
  },
  duration: {
    fontSize: 12,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  check: {
    marginLeft: 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    color: BookColors.brown,
    ...BookTypography.display,
  },
  teaser: {
    fontSize: 14,
    lineHeight: 20,
    color: BookColors.brownLight,
    ...BookTypography.body,
  },
  author: {
    marginTop: 2,
    fontSize: 12,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
});
