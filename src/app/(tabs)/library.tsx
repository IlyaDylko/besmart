import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BookCoverTile } from '@/components/book/book-cover-tile';
import { TabScreenLayout } from '@/components/tab-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { CATEGORY_TITLES } from '@/constants/book-categories';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { applyBookProgress, books, getBook } from '@/data/books';

function bookIdFromIdeaKey(key: string): string {
  const sep = key.indexOf(':');
  return sep === -1 ? key : key.slice(0, sep);
}

export default function LibraryScreen() {
  const { readingBookIds, completedIdeaIds, openedIdeaIds } = useApp();

  const readingBooks = useMemo(() => {
    // Also infer from progress so books read before openBookFromIdea wiring still appear.
    const inferred = new Set<string>();
    for (const key of completedIdeaIds) {
      inferred.add(bookIdFromIdeaKey(key));
    }
    for (const key of openedIdeaIds) {
      inferred.add(bookIdFromIdeaKey(key));
    }

    const orderedIds = [
      ...readingBookIds,
      ...[...inferred].filter((id) => !readingBookIds.includes(id)),
    ];

    return orderedIds
      .map((id) => {
        const book = getBook(id);
        if (!book) return undefined;
        const withProgress = applyBookProgress(book, completedIdeaIds);
        if (withProgress.progress >= 1) return undefined;
        const started =
          withProgress.progress > 0 ||
          openedIdeaIds.some((key) => bookIdFromIdeaKey(key) === id);
        return started ? withProgress : undefined;
      })
      .filter((book) => book !== undefined);
  }, [readingBookIds, completedIdeaIds, openedIdeaIds]);

  const bookSections = useMemo(
    () =>
      Object.entries(
        books.reduce<Record<string, typeof books>>((sections, book) => {
          if (!sections[book.category]) {
            sections[book.category] = [];
          }
          sections[book.category].push(book);
          return sections;
        }, {}),
      ),
    [],
  );

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Library
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Books you&apos;re reading and more to explore
          </ThemedText>
        </View>
      }>
      {readingBooks.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Reading now
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {readingBooks.map((book) => (
              <BookCoverTile
                key={book.id}
                book={book}
                showProgress
                onPress={() => router.push(`/book/${book.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {bookSections.map(([category, sectionBooks]) => (
        <View style={styles.section} key={category}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {CATEGORY_TITLES[category] ?? category}
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {sectionBooks.map((book) => (
              <BookCoverTile
                key={book.id}
                book={applyBookProgress(book, completedIdeaIds)}
                onPress={() => router.push(`/book/${book.id}`)}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
  },
  row: {
    gap: Spacing.three,
    paddingRight: Spacing.four,
  },
});
