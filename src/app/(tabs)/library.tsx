import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BookCoverTile } from '@/components/book/book-cover-tile';
import { TabScreenLayout } from '@/components/tab-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { CATEGORY_TITLES, DISCOVER_CATEGORY_ORDER } from '@/constants/book-categories';
import { BookColors, BookTypography, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { applyBookProgress, books, getBook } from '@/data/books';
import type { Book } from '@/types/book';

function bookIdFromIdeaKey(key: string): string {
  const sep = key.indexOf(':');
  return sep === -1 ? key : key.slice(0, sep);
}

function bookMatchesQuery(book: Book, query: string): boolean {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = `${book.title} ${book.author}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export default function LibraryScreen() {
  const { readingBookIds, completedIdeaIds, openedIdeaIds } = useApp();
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;

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

  const bookSections = useMemo(() => {
    const filtered = isSearching
      ? books.filter((book) => bookMatchesQuery(book, query))
      : books;

    const byCategory = filtered.reduce<Record<string, Book[]>>((sections, book) => {
      if (!sections[book.category]) {
        sections[book.category] = [];
      }
      sections[book.category].push(book);
      return sections;
    }, {});

    return DISCOVER_CATEGORY_ORDER.filter((category) => byCategory[category]?.length).map(
      (category) => [category, byCategory[category]] as const,
    );
  }, [isSearching, query]);

  const resultCount = useMemo(
    () => bookSections.reduce((sum, [, sectionBooks]) => sum + sectionBooks.length, 0),
    [bookSections],
  );

  return (
    <TabScreenLayout
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
      header={
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Library
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Books you&apos;re reading and more to explore
          </ThemedText>
          <View style={styles.searchField}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search' }}
              size={18}
              tintColor={BookColors.brownMuted}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by title or author"
              placeholderTextColor={BookColors.brownMuted}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
              returnKeyType="search"
              style={styles.searchInput}
              accessibilityLabel="Search books by title or author"
            />
            {isSearching ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search">
                <SymbolView
                  name={{ ios: 'xmark.circle.fill', android: 'cancel' }}
                  size={18}
                  tintColor={BookColors.brownMuted}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      }>
      {!isSearching && readingBooks.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Reading now
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            keyboardShouldPersistTaps="handled">
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

      {isSearching && resultCount === 0 ? (
        <View style={styles.empty}>
          <ThemedText type="smallBold" style={styles.emptyTitle}>
            No books found
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.emptyBody}>
            Try another title or author name
          </ThemedText>
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
            contentContainerStyle={styles.row}
            keyboardShouldPersistTaps="handled">
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
  searchField: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: BookColors.brown,
    paddingVertical: 2,
    ...BookTypography.body,
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
  empty: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.one,
  },
  emptyTitle: {
    fontSize: 16,
    color: BookColors.brown,
  },
  emptyBody: {
    textAlign: 'center',
  },
});
