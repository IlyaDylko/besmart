import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonSlide } from '@/components/lesson/lesson-slide';
import { QuizQuestion } from '@/components/lesson/quiz-question';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { getLesson } from '@/data/lessons';
import { getTopic } from '@/data/topics';

type Step = 'slides' | 'quiz' | 'complete';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id ?? '');
  const { completeLesson } = useApp();

  const [step, setStep] = useState<Step>('slides');
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!lesson) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Lesson not found</ThemedText>
          <PrimaryButton label="Go back" onPress={() => router.back()} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const topic = getTopic(lesson.topicId);
  const totalSlides = lesson.slides.length;
  const totalQuiz = lesson.quiz.length;
  const currentQuestion = lesson.quiz[quizIndex];

  const slideProgress = step === 'slides' ? (slideIndex + 1) / (totalSlides + totalQuiz) : 0;
  const quizProgress =
    step === 'quiz' ? (totalSlides + quizIndex + 1) / (totalSlides + totalQuiz) : slideProgress;
  const progress = step === 'complete' ? 1 : step === 'quiz' ? quizProgress : slideProgress;

  const handleNextSlide = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((current) => current + 1);
      return;
    }
    setStep('quiz');
  };

  const handleCheckAnswer = () => {
    if (selectedIndex === null || !currentQuestion) return;

    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectCount((current) => current + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (quizIndex < totalQuiz - 1) {
      setQuizIndex((current) => current + 1);
      setSelectedIndex(null);
      setShowResult(false);
      return;
    }

    const score = correctCount + (selectedIndex === currentQuestion?.correctIndex ? 0 : 0);
    const xpEarned = 10 + score * 5;
    completeLesson(lesson.id, xpEarned);
    setStep('complete');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText type="smallBold" style={styles.close}>
              ✕ Close
            </ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary">
            {topic?.emoji} {topic?.title}
          </ThemedText>
        </View>

        <ProgressBar progress={progress} />

        <View style={styles.content}>
          {step === 'slides' && (
            <LessonSlide slide={lesson.slides[slideIndex]} index={slideIndex} total={totalSlides} />
          )}

          {step === 'quiz' && currentQuestion && (
            <QuizQuestion
              question={currentQuestion}
              selectedIndex={selectedIndex}
              showResult={showResult}
              onSelect={setSelectedIndex}
            />
          )}

          {step === 'complete' && (
            <ThemedView style={styles.complete}>
              <ThemedText style={styles.completeEmoji}>🎉</ThemedText>
              <ThemedText type="subtitle" style={styles.completeTitle}>
                Lesson complete!
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                You got {correctCount} of {totalQuiz} quiz questions right.
              </ThemedText>
              <ThemedText type="smallBold" style={styles.xp}>
                +{10 + correctCount * 5} XP earned
              </ThemedText>
            </ThemedView>
          )}
        </View>

        <View style={styles.footer}>
          {step === 'slides' && (
            <PrimaryButton
              label={slideIndex < totalSlides - 1 ? 'Continue' : 'Start quiz'}
              onPress={handleNextSlide}
            />
          )}

          {step === 'quiz' && !showResult && (
            <PrimaryButton
              label="Check answer"
              disabled={selectedIndex === null}
              onPress={handleCheckAnswer}
            />
          )}

          {step === 'quiz' && showResult && (
            <PrimaryButton
              label={quizIndex < totalQuiz - 1 ? 'Next question' : 'Finish lesson'}
              onPress={handleNextQuestion}
            />
          )}

          {step === 'complete' && (
            <PrimaryButton label="Back to Today" onPress={() => router.replace('/(tabs)')} />
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  close: {
    color: BrandColors.primary,
  },
  content: {
    flex: 1,
  },
  footer: {
    gap: Spacing.two,
  },
  complete: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  completeEmoji: {
    fontSize: 64,
  },
  completeTitle: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  xp: {
    color: BrandColors.primary,
  },
});
