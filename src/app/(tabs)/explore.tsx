import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TabScreenLayout } from '@/components/tab-screen-layout';
import { TopicCard } from '@/components/ui/topic-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { getLessonsByTopic } from '@/data/lessons';
import { topics } from '@/data/topics';

export default function ExploreScreen() {
  const { completedLessonIds } = useApp();

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Explore topics
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Pick a subject and dive into bite-sized lessons
          </ThemedText>
        </View>
      }>
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
  grid: {
    gap: Spacing.two,
  },
});
