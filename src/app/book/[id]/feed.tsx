import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { IdeaCompletionFooter } from '@/components/book/idea-completion-footer';
import { PresentationHeader } from '@/components/book/presentation-header';
import { PresentationSlideView } from '@/components/book/presentation-slide';
import { SegmentedProgress } from '@/components/book/segmented-progress';
import { ThemedText } from '@/components/themed-text';
import { BookColors, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useBookWithProgress } from '@/hooks/use-book-with-progress';
import type { PresentationSlide } from '@/types/book';

type FeedMode = 'discover' | 'book';

function useReliableInsets() {
  const insets = useSafeAreaInsets();
  const fallback = initialWindowMetrics?.insets;

  return {
    top: insets.top || fallback?.top || 0,
    bottom: insets.bottom || fallback?.bottom || 0,
  };
}

export default function BookFeedScreen() {
  const { id, ideaId, from } = useLocalSearchParams<{
    id: string;
    ideaId: string;
    from?: string;
  }>();
  const mode: FeedMode = from === 'discover' ? 'discover' : 'book';
  const { openBookFromIdea } = useApp();
  const { book, completeIdea } = useBookWithProgress(id ?? '');
  const idea = book?.ideas.find((entry) => entry.id === ideaId);
  const listRef = useRef<FlatList<PresentationSlide>>(null);
  const { top: topInset, bottom: bottomInset } = useReliableInsets();

  const [slideIndex, setSlideIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState<number | null>(null);
  const [quizShowResult, setQuizShowResult] = useState(false);

  const onPageLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0) {
      setPageHeight(height);
    }
  }, []);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight === 0 || !book || !idea) return;
      const nextIndex = Math.round(event.nativeEvent.contentOffset.y / pageHeight);
      const currentSlide = idea.slides[slideIndex];
      const isCurrentQuiz = currentSlide?.type === 'quiz';
      const blockedForward = nextIndex > slideIndex && isCurrentQuiz && !quizShowResult;

      if (blockedForward) {
        listRef.current?.scrollToOffset({
          offset: slideIndex * pageHeight,
          animated: true,
        });
        return;
      }

      setSlideIndex(nextIndex);
      const lastSlide = idea.slides[idea.slides.length - 1];
      if (nextIndex >= idea.slides.length - 1 && lastSlide.type !== 'quiz') {
        completeIdea(book.id, idea.id);
      }
    },
    [pageHeight, book, idea, slideIndex, quizShowResult, completeIdea],
  );

  useEffect(() => {
    setSlideIndex(0);
    setQuizSelectedIndex(null);
    setQuizShowResult(false);
    if (pageHeight > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [ideaId, pageHeight]);

  useEffect(() => {
    setQuizSelectedIndex(null);
    setQuizShowResult(false);
  }, [slideIndex]);

  useEffect(() => {
    if (!book || !idea || !quizShowResult) return;
    const lastSlide = idea.slides[idea.slides.length - 1];
    if (slideIndex === idea.slides.length - 1 && lastSlide.type === 'quiz') {
      completeIdea(book.id, idea.id);
    }
  }, [quizShowResult, slideIndex, book, idea, completeIdea]);

  if (!book || !idea) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: topInset, paddingBottom: bottomInset },
        ]}>
        <ThemedText type="subtitle">Idea not found</ThemedText>
      </View>
    );
  }

  const totalSlides = idea.slides.length;
  const currentSlide = idea.slides[slideIndex];
  const isQuizSlide = currentSlide?.type === 'quiz';
  const isLastSlide = slideIndex >= totalSlides - 1;
  const showQuizFooter = isQuizSlide && !(isLastSlide && quizShowResult);
  const showCompletionFooter = isLastSlide && (!isQuizSlide || quizShowResult);
  const currentIndex = book.ideas.findIndex((entry) => entry.id === idea.id);
  const nextIdea = book.ideas[currentIndex + 1];

  const scrollToSlide = (index: number) => {
    if (pageHeight === 0) return;
    listRef.current?.scrollToOffset({ offset: index * pageHeight, animated: true });
    setSlideIndex(index);
  };

  const goToNextIdea = () => {
    completeIdea(book.id, idea.id);
    if (!nextIdea) return;
    router.replace(`/book/${book.id}/feed?ideaId=${nextIdea.id}&from=book`);
  };

  const handleOpenBook = () => {
    completeIdea(book.id, idea.id);
    openBookFromIdea(book.id);
    router.replace(`/book/${book.id}`);
  };

  const handleQuizFooterPress = () => {
    if (!quizShowResult) {
      if (quizSelectedIndex === null) return;
      setQuizShowResult(true);
      return;
    }

    setQuizSelectedIndex(null);
    setQuizShowResult(false);
    scrollToSlide(slideIndex + 1);
  };

  const quizFooterLabel = quizShowResult ? 'Next question' : 'Check answer';
  const quizFooterDisabled = !quizShowResult && quizSelectedIndex === null;

  const renderSlide = ({ item, index }: { item: PresentationSlide; index: number }) => {
    const isActive = index === slideIndex;
    const needsFooterPadding =
      isActive && (showQuizFooter || (showCompletionFooter && index === totalSlides - 1));

    return (
      <View
        style={[
          styles.slidePage,
          pageHeight > 0 && { height: pageHeight },
          needsFooterPadding && (showCompletionFooter ? styles.lastSlidePage : styles.quizSlidePage),
        ]}>
        <PresentationSlideView
          slide={item}
          quizSelectedIndex={isActive ? quizSelectedIndex : null}
          quizShowResult={isActive ? quizShowResult : false}
          onQuizSelect={isActive ? setQuizSelectedIndex : undefined}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset, paddingBottom: bottomInset },
      ]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <PresentationHeader
            title={mode === 'discover' ? idea.title : book.title}
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

        {showQuizFooter && (
          <View
            style={[styles.footerOverlay, { paddingBottom: Math.max(bottomInset, Spacing.two) }]}
            pointerEvents="box-none">
            <Pressable
              onPress={handleQuizFooterPress}
              disabled={quizFooterDisabled}
              style={[styles.continueButton, quizFooterDisabled && styles.continueButtonDisabled]}>
              <Text style={styles.continueLabel}>{quizFooterLabel}</Text>
            </Pressable>
          </View>
        )}

        {showCompletionFooter && (
          <IdeaCompletionFooter
            book={book}
            idea={idea}
            mode={mode}
            bottomInset={bottomInset}
            onOpenBook={handleOpenBook}
            onNextIdea={goToNextIdea}
            onBrowseIdeas={() => router.back()}
            onViewBook={() => router.replace(`/book/${book.id}`)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BookColors.cream,
  },
  inner: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.two,
    zIndex: 1,
  },
  feedArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  slidePage: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  quizSlidePage: {
    paddingBottom: 88,
  },
  lastSlidePage: {
    paddingBottom: 160,
  },
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
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
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    ...BookTypography.body,
  },
});
