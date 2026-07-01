import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookBottomBar } from '@/components/book/book-bottom-bar';
import { BookScreenHeader } from '@/components/book/book-screen-header';
import { RichText } from '@/components/book/rich-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getBookCoverImage } from '@/data/book-images';
import { BookColors, BookShadow, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { getBook, getCurrentIdea } from '@/data/books';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = getBook(id ?? '');

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Book not found</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const currentIdea = getCurrentIdea(book);
  const coverImage = getBookCoverImage(book.id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BookScreenHeader onBack={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.coverSection}>
            <View style={styles.cover}>
              {coverImage ? (
                <Image source={coverImage} style={styles.coverImage} contentFit="cover" />
              ) : (
                <Text style={styles.coverEmoji}>{book.coverEmoji}</Text>
              )}
            </View>
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

          <Pressable onPress={() => router.push(`/book/${book.id}/ideas`)}>
            <Text style={styles.ideasLink}>View all main ideas →</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <BookBottomBar
            ideaIndex={currentIdea.index}
            ideaTitle={currentIdea.title}
            onContinue={() =>
              router.push(`/book/${book.id}/feed?ideaId=${currentIdea.id}`)
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
    width: 150,
    height: 210,
    borderRadius: 14,
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
    fontSize: 64,
    lineHeight: 76,
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
  ideasLink: {
    color: BookColors.brown,
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.four,
    ...BookTypography.body,
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
