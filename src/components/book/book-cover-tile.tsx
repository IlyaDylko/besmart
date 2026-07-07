import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/progress-bar';
import { getBookCoverImage } from '@/data/book-images';
import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import type { Book } from '@/types/book';

type BookCoverTileProps = {
  book: Book;
  onPress: () => void;
  showProgress?: boolean;
};

export function BookCoverTile({ book, onPress, showProgress }: BookCoverTileProps) {
  const coverImage = getBookCoverImage(book.id);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={styles.cover}>
        {coverImage ? (
          <Image source={coverImage} style={styles.coverImage} contentFit="cover" />
        ) : (
          <Text style={styles.coverEmoji}>{book.coverEmoji}</Text>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {book.author}
      </Text>
      {showProgress ? (
        <View style={styles.progressWrap}>
          <ProgressBar progress={book.progress} color={BookColors.brown} trackColor={BookColors.brownSoft} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 108,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.9,
  },
  cover: {
    width: 108,
    height: 148,
    borderRadius: 12,
    backgroundColor: BookColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    overflow: 'hidden',
    ...BookShadow.card,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverEmoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: BookColors.brown,
    lineHeight: 17,
    ...BookTypography.body,
  },
  author: {
    fontSize: 11,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  progressWrap: {
    marginTop: 2,
  },
});
