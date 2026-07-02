import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BookCard } from '@/components/book/book-card';
import { TabScreenLayout } from '@/components/tab-screen-layout';
import { TopicCard } from '@/components/ui/topic-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { books } from '@/data/books';
import { getLessonsByTopic } from '@/data/lessons';
import { topics } from '@/data/topics';

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
  const { completedLessonIds } = useApp();
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
            Book summaries and bite-sized lessons
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

      <View style={styles.section}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Topics
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {topics.map((topic) => {
          const topicLessons = getLessonsByTopic(topic.id);
          const completedCount = topicLessons.filter((lesson) =>
            completedLessonIds.includes(lesson.id),
          ).length;
          const nextLesson = topicLessons.find(
            (lesson) => !completedLessonIds.includes(lesson.id),
          );

          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              completedCount={completedCount}
              onPress={() => {
                if (nextLesson) {
                  router.push(`/lesson/${nextLesson.id}`);
                } else if (topicLessons[0]) {
                  router.push(`/lesson/${topicLessons[0].id}`);
                }
              }}
            />
          );
        })}
      </View>
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
  grid: {
    gap: Spacing.two,
  },
});
