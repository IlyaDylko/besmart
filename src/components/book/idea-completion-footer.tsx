import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookColors, BookTypography, Spacing } from '@/constants/theme';
import type { Book, BookIdea } from '@/types/book';

type IdeaCompletionFooterProps = {
  book: Book;
  idea: BookIdea;
  mode: 'discover' | 'book';
  bottomInset: number;
  onOpenBook: () => void;
  onNextIdea: () => void;
  onBrowseIdeas: () => void;
  onViewBook: () => void;
};

export function IdeaCompletionFooter({
  book,
  idea,
  mode,
  bottomInset,
  onOpenBook,
  onNextIdea,
  onBrowseIdeas,
  onViewBook,
}: IdeaCompletionFooterProps) {
  const currentIndex = book.ideas.findIndex((entry) => entry.id === idea.id);
  const nextIdea = book.ideas[currentIndex + 1];

  if (mode === 'discover') {
    return (
      <View
        style={[styles.overlay, { paddingBottom: Math.max(bottomInset, Spacing.two) }]}
        pointerEvents="box-none">
        <View style={styles.attribution}>
          <Text style={styles.attributionLabel}>From</Text>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>
        </View>

        <Pressable onPress={onOpenBook} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Open book</Text>
        </Pressable>

        <Pressable onPress={onBrowseIdeas} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>Browse more ideas</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[styles.overlay, { paddingBottom: Math.max(bottomInset, Spacing.two) }]}
      pointerEvents="box-none">
      {nextIdea ? (
        <Pressable onPress={onNextIdea} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Next idea</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onViewBook} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Back to book</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: BookColors.cream,
    borderTopWidth: 1,
    borderTopColor: BookColors.brownSoft,
    gap: Spacing.two,
  },
  attribution: {
    alignItems: 'center',
    gap: 2,
    marginBottom: Spacing.one,
  },
  attributionLabel: {
    fontSize: 12,
    color: BookColors.brownMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    ...BookTypography.body,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BookColors.brown,
    textAlign: 'center',
    ...BookTypography.body,
  },
  author: {
    fontSize: 14,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  primaryButton: {
    backgroundColor: BookColors.brown,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    ...BookTypography.body,
  },
  secondaryButton: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: BookColors.brownMuted,
    fontSize: 15,
    fontWeight: '600',
    ...BookTypography.body,
  },
});
