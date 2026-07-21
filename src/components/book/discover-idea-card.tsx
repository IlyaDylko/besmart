import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import { getIdeaPosterImages, getIdeaTeaserSlides } from '@/data/book-images';
import { getIdeaTeaser } from '@/data/books';
import type { BookIdea } from '@/types/book';

type DiscoverIdeaCardProps = {
  idea: BookIdea;
  bookId: string;
  bookTitle: string;
  completed?: boolean;
  onPress: () => void;
};

const POSTER_ASPECT = 12 / 9;
const SLIDESHOW_MS = 2800;

function firstSentence(text: string): string {
  const normalized = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? normalized).trim();
}

export function DiscoverIdeaCard({
  idea,
  bookId,
  bookTitle,
  completed,
  onPress,
}: DiscoverIdeaCardProps) {
  // idea.index is 1-based; teaser/slide keys use the 0-based idea index
  const ideaIndex = idea.index - 1;
  const images = useMemo(() => getIdeaPosterImages(bookId, ideaIndex), [bookId, ideaIndex]);
  const curatedCaption = getIdeaTeaserSlides(bookId, ideaIndex)?.[0]?.caption;
  const teaserLine = firstSentence(getIdeaTeaser(idea));
  const headline = curatedCaption || teaserLine || idea.title;
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setSlideIndex((current) => (current + 1) % images.length);
    }, SLIDESHOW_MS);
    return () => clearInterval(id);
  }, [images]);

  const activeImage = images[slideIndex] ?? images[0];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.posterCard,
        pressed && styles.pressed,
        completed && styles.completed,
      ]}>
      {activeImage ? (
        <Image
          source={activeImage}
          style={styles.posterImage}
          contentFit="cover"
          transition={400}
        />
      ) : (
        <View style={[styles.posterImage, styles.posterFallback]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(40, 24, 22, 0.55)', 'rgba(40, 24, 22, 0.92)']}
        locations={[0, 0.45, 1]}
        style={styles.posterGradient}
        pointerEvents="none">
        <Text style={styles.posterCaption} numberOfLines={3}>
          {headline}
        </Text>
        <View style={styles.posterFooter}>
          <Text style={styles.posterFooterText} numberOfLines={1}>
            {bookTitle} · {idea.durationMinutes} min
          </Text>
          {images.length > 1 ? (
            <View style={styles.dots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === slideIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
          {completed ? (
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
              size={14}
              tintColor="#FFFFFF"
            />
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    ...BookShadow.card,
  },
  posterCard: {
    overflow: 'hidden',
    aspectRatio: POSTER_ASPECT,
  },
  posterImage: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BookColors.brownSoft,
  },
  posterFallback: {
    backgroundColor: BookColors.brown,
  },
  posterGradient: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.five,
    gap: Spacing.one,
  },
  posterCaption: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    ...BookTypography.display,
  },
  posterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.one,
  },
  posterFooterText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    ...BookTypography.body,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 14,
  },
  completed: {
    opacity: 0.88,
  },
  pressed: {
    opacity: 0.92,
  },
});
