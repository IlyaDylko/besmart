import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import { getIdeaCardImage } from '@/data/book-images';
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

/** Full-width Ideas card art — matches 1:1 Recraft assets. */
export const IDEA_CARD_ASPECT = 1;

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
  const cardImage = getIdeaCardImage(bookId, idea.index - 1);
  const fallbackEmoji = idea.emoji || coverEmoji;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, completed && styles.completed]}>
      <View style={styles.imageWrap}>
        {cardImage ? (
          <Image source={cardImage} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageEmoji}>{fallbackEmoji}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={3}>
          {idea.title}
        </Text>
        {teaser ? (
          <Text style={styles.teaser} numberOfLines={3}>
            {teaser}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={2}>
            {bookTitle} by <Text style={styles.footerAuthor}>{bookAuthor}</Text>
          </Text>
          {completed ? (
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
              size={14}
              tintColor={BookColors.brown}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    overflow: 'hidden',
    ...BookShadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  completed: {
    backgroundColor: BookColors.brownSelected,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: IDEA_CARD_ASPECT,
    backgroundColor: BookColors.brownSoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 48,
    lineHeight: 56,
    ...BookTypography.body,
  },
  content: {
    gap: Spacing.one,
    padding: Spacing.three,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: BookColors.brown,
    ...BookTypography.display,
  },
  teaser: {
    fontSize: 14,
    lineHeight: 20,
    color: BookColors.brownLight,
    ...BookTypography.body,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.one,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  footerAuthor: {
    fontWeight: '600',
    color: BookColors.brown,
  },
});
