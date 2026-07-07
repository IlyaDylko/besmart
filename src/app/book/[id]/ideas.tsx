import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookBottomBar } from '@/components/book/book-bottom-bar';
import { BookDisplayTitle } from '@/components/book/book-display-title';
import { BookScreenHeader } from '@/components/book/book-screen-header';
import { IdeaCard } from '@/components/book/idea-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BookColors, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { getCurrentIdea, isIdeaCompleted } from '@/data/books';
import { useBookWithProgress } from '@/hooks/use-book-with-progress';

export default function BookIdeasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { book, completedIdeaIds } = useBookWithProgress(id ?? '');
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!book) return;
    setSelectedId(getCurrentIdea(book, completedIdeaIds).id);
  }, [book, completedIdeaIds]);

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Book not found</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const selectedIdea =
    book.ideas.find((idea) => idea.id === selectedId) ?? getCurrentIdea(book, completedIdeaIds);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <BookScreenHeader onBack={() => router.back()} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>...ready to unlock habits that stick for good?</Text>
          <BookDisplayTitle>Main Ideas</BookDisplayTitle>

          <View style={styles.list}>
            {book.ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                selected={idea.id === selectedId}
                completed={isIdeaCompleted(book.id, idea.id, completedIdeaIds)}
                onPress={() => setSelectedId(idea.id)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <BookBottomBar
            ideaIndex={selectedIdea.index}
            ideaTitle={selectedIdea.title}
            onContinue={() =>
              router.push(`/book/${book.id}/feed?ideaId=${selectedIdea.id}&from=book`)
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
  intro: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: BookColors.brownMuted,
    marginBottom: Spacing.three,
    ...BookTypography.body,
  },
  list: {
    gap: Spacing.two,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    backgroundColor: BookColors.cream,
    paddingTop: Spacing.two,
  },
});
