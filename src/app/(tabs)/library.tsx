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

export default function LibraryScreen() {
  const { readingBookIds, completedIdeaIds } = useApp();

  const readingBooks = useMemo(
    () =>
      readingBookIds
        .map((id) => {
          const book = getBook(id);
          return book ? applyBookProgress(book, completedIdeaIds) : undefined;
        })
        .filter((book) => book !== undefined),
    [readingBookIds, completedIdeaIds],
  );

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
