import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import { getIdeaDiscoverTeaser } from '@/data/books';
import type { DiscoverStatus } from '@/data/discover-feed';
import type { BookIdea } from '@/types/book';

type DiscoverIdeaCardProps = {
  idea: BookIdea;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  coverEmoji: string;
  category: string;
  status: DiscoverStatus;
  onPress: () => void;
};

const CATEGORY_TINT: Record<string, string> = {
  HABITS: '#F7EFE8',
  MONEY: '#EEF5F0',
  PSYCHOLOGY: '#F3EEF6',
  BUSINESS: '#EEF2F7',
  COMMUNICATION: '#F7F0EA',
  GROWTH: '#F0F5EE',
  DECISIONS: '#F5F0F0',
  CONSPIRACY: '#F0ECEF',
};

const STATUS_LABEL: Record<DiscoverStatus, string> = {
  new: 'New',
  continue: 'Continue',
  done: 'Done',
};

function formatCategory(category: string): string {
  if (!category) return '';
  return category
    .toLowerCase()
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function DiscoverIdeaCard({
  idea,
  bookId,
  bookTitle,
  bookAuthor,
  coverEmoji,
  category,
  status,
  onPress,
}: DiscoverIdeaCardProps) {
  const teaser = getIdeaDiscoverTeaser(idea);
  const tint = CATEGORY_TINT[category] ?? BookColors.cream;
  const categoryLabel = formatCategory(category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: tint },
        status === 'done' && styles.doneCard,
        pressed && styles.pressed,
      ]}>
      <View style={styles.metaRow}>
        <View style={styles.chips}>
          <View
            style={[
              styles.chip,
              status === 'continue' && styles.chipContinue,
              status === 'done' && styles.chipDone,
            ]}>
            <Text style={[styles.chipText, status === 'continue' && styles.chipTextContinue]}>
              {STATUS_LABEL[status]}
            </Text>
          </View>
          {categoryLabel ? (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{categoryLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.metaText}>{idea.durationMinutes} min</Text>
      </View>

      <Text style={styles.title} numberOfLines={3}>
        {idea.title}
      </Text>

      {teaser ? (
        <Text style={styles.teaser} numberOfLines={2}>
          {teaser}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <BookCover bookId={bookId} coverEmoji={coverEmoji} height={56} shadow />
        <View style={styles.bookMeta}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {bookTitle}
          </Text>
          {bookAuthor ? (
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {bookAuthor}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  doneCard: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.92,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(92, 61, 58, 0.1)',
  },
  chipContinue: {
    backgroundColor: 'rgba(255, 122, 80, 0.18)',
  },
  chipDone: {
    backgroundColor: 'rgba(92, 61, 58, 0.06)',
  },
  chipText: {
    fontSize: 12,
    color: BookColors.brown,
    ...BookTypography.body,
    fontWeight: '600',
  },
  chipTextContinue: {
    color: '#C45A2C',
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
  },
  categoryChipText: {
    fontSize: 12,
    color: BookColors.brownMuted,
    ...BookTypography.body,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metaText: {
    fontSize: 12,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: BookColors.brown,
    ...BookTypography.display,
  },
  teaser: {
    fontSize: 15,
    lineHeight: 22,
    color: BookColors.brownLight,
    ...BookTypography.body,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  bookMeta: {
    flex: 1,
    gap: 2,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BookColors.brown,
    ...BookTypography.body,
  },
  bookAuthor: {
    fontSize: 13,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
});
