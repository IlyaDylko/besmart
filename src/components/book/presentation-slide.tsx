import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RichText } from '@/components/book/rich-text';
import { resolveSlideImage } from '@/data/book-images';
import { BrandColors, BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';
import type { PresentationSlide } from '@/types/book';

type PresentationSlideViewProps = {
  slide: PresentationSlide;
};

export function PresentationSlideView({ slide }: PresentationSlideViewProps) {
  const [revealed, setRevealed] = useState(slide.type !== 'reveal');
  const slideImage = resolveSlideImage(slide.image);

  switch (slide.type) {
    case 'reveal':
      return (
        <View style={styles.container}>
          {slide.title && <Text style={styles.contentTitle}>{slide.title}</Text>}
          <Pressable onPress={() => setRevealed(true)} style={styles.revealCard}>
            {!revealed ? (
              <View style={styles.revealHidden}>
                {slide.illustration && (
                  <Text style={styles.revealEmoji}>{slide.illustration}</Text>
                )}
                <View style={styles.revealDot} />
                <Text style={styles.revealHint}>
                  {slide.hiddenText ?? 'Tap to reveal the idea'}
                </Text>
              </View>
            ) : (
              <View style={styles.revealContent}>
                <RichText>{slide.body}</RichText>
              </View>
            )}
          </Pressable>
        </View>
      );

    case 'summary':
      return (
        <View style={styles.container}>
          <View style={styles.summaryCard}>
            <RichText>{slide.body}</RichText>
            {slide.bullets && (
              <View style={styles.bullets}>
                {slide.bullets.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <RichText style={styles.bulletText}>{bullet}</RichText>
                  </View>
                ))}
              </View>
            )}
            {slide.footer && (
              <View style={styles.footer}>
                <RichText style={styles.footerText}>{slide.footer}</RichText>
              </View>
            )}
            <View style={styles.summaryActions}>
              <SymbolView
                name={{ ios: 'square.and.arrow.up', android: 'share' }}
                size={20}
                tintColor={BookColors.brownMuted}
              />
              <SymbolView
                name={{ ios: 'bookmark', android: 'bookmark_border' }}
                size={20}
                tintColor={BookColors.brownMuted}
              />
            </View>
          </View>
        </View>
      );

    case 'swipe-hint':
      return (
        <View style={styles.container}>
          <RichText>{slide.body}</RichText>
          {slide.hint && <Text style={styles.swipeHint}>{slide.hint}</Text>}
          <View style={styles.peekCard}>
            <Text style={styles.peekEmoji}>🚴</Text>
          </View>
        </View>
      );

    case 'content':
    default:
      return (
        <View style={styles.container}>
          {slide.title && <Text style={styles.contentTitle}>{slide.title}</Text>}
          <RichText>{slide.body}</RichText>
          {slideImage ? (
            <Image source={slideImage} style={styles.slideImage} contentFit="cover" />
          ) : slide.image ? (
            <View style={styles.slideImagePlaceholder}>
              <SymbolView
                name={{ ios: 'photo', android: 'image' }}
                size={28}
                tintColor={BookColors.brownMuted}
              />
            </View>
          ) : slide.illustration ? (
            <View style={styles.illustration}>
              <Text style={styles.illustrationEmoji}>{slide.illustration}</Text>
            </View>
          ) : null}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
  },
  contentTitle: {
    ...BookTypography.display,
    fontSize: 28,
    lineHeight: 36,
    color: BookColors.brown,
    marginBottom: Spacing.one,
  },
  illustration: {
    borderRadius: 16,
    backgroundColor: '#3D3D3D',
    padding: Spacing.five,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  illustrationEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  slideImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: Spacing.two,
    backgroundColor: BookColors.brownSoft,
  },
  slideImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: Spacing.two,
    backgroundColor: BookColors.brownSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    borderStyle: 'dashed',
  },
  revealCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary,
    overflow: 'hidden',
    minHeight: 300,
  },
  revealHidden: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  revealEmoji: {
    fontSize: 72,
    lineHeight: 84,
  },
  revealDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BookColors.brown,
  },
  revealHint: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    ...BookTypography.body,
  },
  revealContent: {
    flex: 1,
    padding: Spacing.four,
    backgroundColor: BookColors.card,
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: BookColors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    padding: Spacing.four,
    gap: Spacing.two,
    ...BookShadow.card,
  },
  bullets: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  bulletMarker: {
    fontSize: 16,
    lineHeight: 24,
    color: BookColors.brown,
    ...BookTypography.body,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BookColors.brownSoft,
  },
  footerText: {
    fontSize: 16,
    lineHeight: 24,
  },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    paddingTop: Spacing.one,
  },
  swipeHint: {
    textAlign: 'center',
    color: BookColors.brownMuted,
    fontSize: 14,
    marginTop: 'auto',
    ...BookTypography.body,
  },
  peekCard: {
    height: 72,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  peekEmoji: {
    fontSize: 28,
  },
});
