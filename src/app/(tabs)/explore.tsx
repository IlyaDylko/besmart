import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BookCard } from '@/components/book/book-card';
import { TabScreenLayout } from '@/components/tab-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { books } from '@/data/books';

const CATEGORY_TITLES: Record<string, string> = {
  HABITS: 'Habits',
  MONEY: 'Money',
  PSYCHOLOGY: 'Psychology',
  BUSINESS: 'Business',
  COMMUNICATION: 'Communication',
  GROWTH: 'Growth',
  DECISIONS: 'Decisions & Uncertainty',
};

export default function ExploreScreen() {
  const bookSections = Object.entries(
    books.reduce<Record<string, typeof books>>((sections, book) => {
      if (!sections[book.category]) {
        sections[book.category] = [];
      }
      sections[book.category].push(book);
      return sections;
    }, {}),
  );

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Explore
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Book summaries by category
          </ThemedText>
        </View>
      }>
      {bookSections.map(([category, sectionBooks]) => (
        <View style={styles.section} key={category}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {CATEGORY_TITLES[category] ?? category}
          </ThemedText>
          {sectionBooks.map((book) => (
            <BookCard key={book.id} book={book} onPress={() => router.push(`/book/${book.id}`)} />
          ))}
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
});
