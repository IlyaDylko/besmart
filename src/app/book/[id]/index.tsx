import { BookCover } from '@/components/book/book-cover';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookBottomBar } from '@/components/book/book-bottom-bar';
import { BookScreenHeader } from '@/components/book/book-screen-header';
import { IdeaCard } from '@/components/book/idea-card';
import { RichText } from '@/components/book/rich-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BookColors, BookShadow, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { getCurrentIdea, isIdeaCompleted } from '@/data/books';
import { useBookWithProgress } from '@/hooks/use-book-with-progress';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { book, completedIdeaIds } = useBookWithProgress(id ?? '');

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Book not found</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const currentIdea = getCurrentIdea(book, completedIdeaIds);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BookScreenHeader onBack={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.coverSection}>
            <BookCover
              bookId={book.id}
              coverEmoji={book.coverEmoji}
              height={210}
              emojiSize={64}
              shadow
              style={styles.cover}
            />
            <View style={styles.progressWrap}>
              <ProgressBar progress={book.progress} color={BookColors.brown} />
              <Text style={styles.progressLabel}>{Math.round(book.progress * 100)}%</Text>
            </View>
          </View>

          <Text style={styles.headline}>{book.headline}</Text>
          <Text style={styles.author}>
            {book.title} by <Text style={styles.authorBold}>{book.author}</Text>
          </Text>

          <View style={styles.tag}>
            <Text style={styles.tagText}>{book.category}</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>⭐</Text>
              <Text style={styles.metricLabel}>Key ideas</Text>
              <Text style={styles.metricValue}>{book.keyIdeasCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricEmoji}>⏱</Text>
              <Text style={styles.metricLabel}>Time / idea</Text>
              <Text style={styles.metricValue}>{book.minutesPerIdea}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <RichText style={styles.description}>{book.description}</RichText>

          <Text style={styles.sectionTitle}>Main Ideas</Text>
          <View style={styles.ideasList}>
            {book.ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                completed={isIdeaCompleted(book.id, idea.id, completedIdeaIds)}
                onPress={() =>
                  router.push(`/book/${book.id}/feed?ideaId=${idea.id}&from=book`)
                }
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <BookBottomBar
            ideaIndex={currentIdea.index}
            ideaTitle={currentIdea.title}
            onContinue={() =>
              router.push(`/book/${book.id}/feed?ideaId=${currentIdea.id}&from=book`)
            }
            onAudio={() => {}}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
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
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 150,
  },
  coverSection: {
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    marginTop: Spacing.one,
  },
  cover: {
    backgroundColor: BookColors.card,
  },
  progressWrap: {
    width: '55%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressLabel: {
    color: BookColors.brownMuted,
    fontSize: 13,
    minWidth: 32,
    ...BookTypography.body,
  },
  headline: {
    ...BookTypography.display,
    fontSize: 26,
    lineHeight: 34,
    color: BookColors.brown,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  author: {
    fontSize: 15,
    lineHeight: 22,
    color: BookColors.brownMuted,
    textAlign: 'center',
    marginBottom: Spacing.three,
    ...BookTypography.body,
  },
  authorBold: {
    fontWeight: '600',
    color: BookColors.brown,
  },
  tag: {
    alignSelf: 'center',
    backgroundColor: BookColors.brown,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: Spacing.four,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    ...BookTypography.body,
  },
  metrics: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  metricCard: {
    flex: 1,
    backgroundColor: BookColors.card,
    borderRadius: 18,
    padding: Spacing.three,
    gap: 4,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    ...BookShadow.card,
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: BookColors.brownMuted,
    ...BookTypography.body,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: BookColors.brown,
    ...BookTypography.body,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BookColors.brown,
    marginBottom: Spacing.two,
    ...BookTypography.body,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
  },
  ideasList: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: BookColors.cream,
  },
});
