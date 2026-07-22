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
import { QuizQuestion } from '@/components/lesson/quiz-question';
import { ThemedText } from '@/components/themed-text';
import { BookColors, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { useBookWithProgress } from '@/hooks/use-book-with-progress';
import { track } from '@/services/analytics';
import type { PresentationSlide } from '@/types/book';

type FeedMode = 'discover' | 'book';
type Step = 'slides' | 'complete' | 'quiz';

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

  const [step, setStep] = useState<Step>('slides');
  const [slideIndex, setSlideIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState<number | null>(null);
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const onPageLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0) {
      setPageHeight(height);
    }
  }, []);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageHeight === 0 || !idea) return;
      const nextIndex = Math.round(event.nativeEvent.contentOffset.y / pageHeight);
      setSlideIndex(nextIndex);
    },
    [pageHeight, idea],
  );

  useEffect(() => {
    setStep('slides');
    setSlideIndex(0);
    setQuizIndex(0);
    setQuizSelectedIndex(null);
    setQuizShowResult(false);
    setQuizDone(false);
    if (pageHeight > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [ideaId, pageHeight]);

  useEffect(() => {
    if (!id || !ideaId) return;
    track('idea_opened', {
      book_id: id,
      idea_id: ideaId,
      source: mode,
    });
  }, [id, ideaId, mode]);

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
  const questions = idea.questions;
  const totalQuiz = questions.length;
  const hasQuiz = totalQuiz > 0;
  const currentQuestion = questions[quizIndex];
  const isLastSlide = step === 'slides' && slideIndex >= totalSlides - 1;
  const currentIndex = book.ideas.findIndex((entry) => entry.id === idea.id);
  const nextIdea = book.ideas[currentIndex + 1];

  const progressTotal = step === 'quiz' ? totalQuiz : totalSlides;
  const progressCurrent = step === 'quiz' ? quizIndex : slideIndex;

  const finishIdea = () => {
    completeIdea(book.id, idea.id);
    setStep('complete');
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

  const handleTakeQuiz = () => {
    setQuizIndex(0);
    setQuizSelectedIndex(null);
    setQuizShowResult(false);
    setStep('quiz');
  };

  const handleQuizFooterPress = () => {
    if (!quizShowResult) {
      if (quizSelectedIndex === null) return;
      setQuizShowResult(true);
      return;
    }

    if (quizIndex < totalQuiz - 1) {
      setQuizIndex((current) => current + 1);
      setQuizSelectedIndex(null);
      setQuizShowResult(false);
      return;
    }

    setQuizDone(true);
    setStep('complete');
  };

  const quizFooterLabel = quizShowResult
    ? quizIndex < totalQuiz - 1
      ? 'Next question'
      : 'Finish quiz'
    : 'Check answer';
  const quizFooterDisabled = !quizShowResult && quizSelectedIndex === null;

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
          {step !== 'complete' && (
            <SegmentedProgress total={progressTotal} current={progressCurrent} />
          )}
        </View>

        {step === 'slides' && (
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
        )}

        {step === 'quiz' && currentQuestion && (
          <View style={[styles.quizArea, styles.quizSlidePage]}>
            <Text style={styles.quizEyebrow}>
              Check your understanding · {quizIndex + 1}/{totalQuiz}
            </Text>
            <QuizQuestion
              question={currentQuestion}
              selectedIndex={quizSelectedIndex}
              showResult={quizShowResult}
              onSelect={setQuizSelectedIndex}
            />
          </View>
        )}

        {isLastSlide && (
          <View
            style={[styles.footerOverlay, { paddingBottom: Math.max(bottomInset, Spacing.two) }]}
            pointerEvents="box-none">
            <Pressable onPress={finishIdea} style={styles.continueButton}>
              <Text style={styles.continueLabel}>Continue</Text>
            </Pressable>
          </View>
        )}

        {step === 'quiz' && (
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

        {step === 'complete' && (
          <IdeaCompletionFooter
            book={book}
            idea={idea}
            mode={mode}
            bottomInset={bottomInset}
            hasQuiz={hasQuiz}
            quizDone={quizDone}
            onTakeQuiz={handleTakeQuiz}
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
  lastSlidePage: {
    paddingBottom: 88,
  },
  quizArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    gap: Spacing.three,
  },
  quizSlidePage: {
    paddingBottom: 88,
  },
  quizEyebrow: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: BookColors.brownMuted,
    textTransform: 'uppercase',
    ...BookTypography.body,
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
