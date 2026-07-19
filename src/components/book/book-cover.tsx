import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BookColors, BookShadow, BookTypography } from '@/constants/theme';
import { getBookCoverImage } from '@/data/book-images';

/** Standard book cover ratio (2:3). */
export const BOOK_COVER_ASPECT = 2 / 3;

type BookCoverProps = {
  bookId: string;
  coverEmoji: string;
  height: number;
  style?: ViewStyle;
  emojiSize?: number;
  shadow?: boolean;
};

export function BookCover({
  bookId,
  coverEmoji,
  height,
  style,
  emojiSize = 32,
  shadow = false,
}: BookCoverProps) {
  const width = Math.round(height * BOOK_COVER_ASPECT);
  const coverImage = getBookCoverImage(bookId);

  return (
    <View
      style={[
        styles.frame,
        { width, height },
        shadow && BookShadow.card,
        style,
      ]}>
      {coverImage ? (
        <Image source={coverImage} style={styles.image} contentFit="cover" />
      ) : (
        <Text style={[styles.emoji, { fontSize: emojiSize, lineHeight: emojiSize + 6 }]}>
          {coverEmoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: BookColors.brownSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    ...BookTypography.body,
  },
});
