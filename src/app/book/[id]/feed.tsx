import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PresentationHeader } from '@/components/book/presentation-header';
import { PresentationSlideView } from '@/components/book/presentation-slide';
import { SegmentedProgress } from '@/components/book/segmented-progress';
import { ThemedText } from '@/components/themed-text';
import { BookColors, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { getBook, getBookIdea } from '@/data/books';
import type { PresentationSlide } from '@/types/book';

export default function BookFeedScreen() {
  const { id, ideaId } = useLocalSearchParams<{ id: string; ideaId: string }>();
  const book = getBook(id ?? '');
  const idea = getBookIdea(id ?? '', ideaId ?? '');
  const listRef = useRef<FlatList<PresentationSlide>>(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const onPageLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0) {
      setPageHeight(height);
    }
  }, []);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight === 0) return;
      const index = Math.round(event.nativeEvent.contentOffset.y / pageHeight);
      setSlideIndex(index);
    },
    [pageHeight],
  );

  if (!book || !idea) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Idea not found</ThemedText>
        </SafeAreaView>
      </View>
    );
  }

  const totalSlides = idea.slides.length;
  const isLastSlide = slideIndex >= totalSlides - 1;

  const renderSlide = ({ item, index }: { item: PresentationSlide; index: number }) => (
    <View
      style={[
        styles.slidePage,
        pageHeight > 0 && { height: pageHeight },
        index === totalSlides - 1 && styles.lastSlidePage,
      ]}>
      <PresentationSlideView slide={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <PresentationHeader
            title={idea.title}
            onBack={() => router.back()}
            onClose={() => router.dismissAll()}
            onAudio={() => {}}
          />
          <SegmentedProgress total={totalSlides} current={slideIndex} />
        </View>

        <View style={styles.feedArea} onLayout={onPageLayout}>
          {pageHeight > 0 && (
            <FlatList
              ref={listRef}
              data={idea.slides}
              keyExtractor={(_, index) => String(index)}
              renderItem={renderSlide}
              pagingEnabled
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              getItemLayout={(_, index) => ({
                length: pageHeight,
                offset: pageHeight * index,
                index,
              })}
              style={styles.list}
            />
          )}
        </View>

        {isLastSlide && (
          <View style={styles.footerOverlay} pointerEvents="box-none">
            <Pressable onPress={() => router.back()} style={styles.continueButton}>
              <Text style={styles.continueLabel}>Continue</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BookColors.cream,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  feedArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  slidePage: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  lastSlidePage: {
    paddingBottom: 88,
  },
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    backgroundColor: BookColors.cream,
    borderTopWidth: 1,
    borderTopColor: BookColors.brownSoft,
  },
  continueButton: {
    backgroundColor: BookColors.brown,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    ...BookTypography.body,
  },
});
