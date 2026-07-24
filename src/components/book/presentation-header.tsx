import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookColors, BookTypography, Spacing } from '@/constants/theme';
import { getBookCoverImage } from '@/data/book-images';

type BookLink = {
  bookId: string;
  coverEmoji: string;
  label?: string;
  onPress: () => void;
};

type PresentationHeaderProps = {
  title: string;
  /** Label next to the back chevron, e.g. "Ideas" */
  leftLabel?: string;
  onLeft: () => void;
  /** Optional book hub shortcut on the right */
  bookLink?: BookLink;
};

const BACK_SIZE = 40;
const COVER_HEIGHT = 40;
const COVER_WIDTH = Math.round(COVER_HEIGHT * (2 / 3));

export function PresentationHeader({
  title,
  leftLabel,
  onLeft,
  bookLink,
}: PresentationHeaderProps) {
  const coverImage = bookLink ? getBookCoverImage(bookLink.bookId) : undefined;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onLeft}
        style={({ pressed }) => [styles.side, styles.sideLeft, pressed && styles.pressed]}
        hitSlop={8}>
        <View style={styles.backCircle}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left' }}
            size={18}
            weight="medium"
            tintColor={BookColors.brown}
          />
        </View>
        {leftLabel ? (
          <Text style={styles.sideLabel} numberOfLines={1}>
            {leftLabel}
          </Text>
        ) : null}
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {bookLink ? (
        <Pressable
          onPress={bookLink.onPress}
          style={({ pressed }) => [styles.side, styles.sideRight, pressed && styles.pressed]}
          hitSlop={8}>
          <Text style={styles.sideLabel} numberOfLines={1}>
            {bookLink.label ?? 'Book'}
          </Text>
          <View style={styles.cover}>
            {coverImage ? (
              <Image source={coverImage} style={styles.coverImage} contentFit="cover" />
            ) : (
              <Text style={styles.coverEmoji}>{bookLink.coverEmoji}</Text>
            )}
          </View>
        </Pressable>
      ) : (
        <View style={styles.sideSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: BACK_SIZE,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 0,
  },
  sideLeft: {
    maxWidth: '32%',
  },
  sideRight: {
    maxWidth: '32%',
    justifyContent: 'flex-end',
  },
  sideSpacer: {
    width: COVER_WIDTH + 48,
  },
  backCircle: {
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: BACK_SIZE / 2,
    backgroundColor: BookColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
  },
  sideLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: BookColors.brown,
    ...BookTypography.body,
    flexShrink: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: BookColors.brown,
    fontSize: 15,
    fontWeight: '600',
    ...BookTypography.body,
    minWidth: 0,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: BookColors.brownSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverEmoji: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
