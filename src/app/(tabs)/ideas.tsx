import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { DiscoverIdeaCard } from '@/components/book/discover-idea-card';
import { TabScreenLayout } from '@/components/tab-screen-layout';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { getAllIdeasWithProgress, isIdeaCompleted } from '@/data/books';

const PAGE_SIZE = 12;
const LOAD_MORE_OFFSET = 480;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function ideaKey(bookId: string, ideaId: string) {
  return `${bookId}:${ideaId}`;
}

export default function IdeasScreen() {
  const { completedIdeaIds } = useApp();
  const [order] = useState(() =>
    shuffle(getAllIdeasWithProgress([]).map((entry) => ideaKey(entry.bookId, entry.idea.id))),
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const ideas = useMemo(() => {
    const byKey = new Map(
      getAllIdeasWithProgress(completedIdeaIds).map((entry) => [
        ideaKey(entry.bookId, entry.idea.id),
        entry,
      ]),
    );
    return order.map((key) => byKey.get(key)).filter((entry) => entry !== undefined);
  }, [completedIdeaIds, order]);

  const visibleIdeas = ideas.slice(0, visibleCount);

  function loadMore() {
    setVisibleCount((current) => {
      if (current >= ideas.length) return current;
      return Math.min(current + PAGE_SIZE, ideas.length);
    });
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceFromBottom < LOAD_MORE_OFFSET) {
      loadMore();
    }
  }

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Ideas
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Try an idea — if it clicks, open the book
          </ThemedText>
        </View>
      }
      scrollProps={{
        onScroll: handleScroll,
        scrollEventThrottle: 200,
      }}>
      <View style={styles.feed}>
        {visibleIdeas.map((entry) => (
          <DiscoverIdeaCard
            key={ideaKey(entry.bookId, entry.idea.id)}
            idea={entry.idea}
            bookId={entry.bookId}
            bookTitle={entry.bookTitle}
            completed={isIdeaCompleted(entry.bookId, entry.idea.id, completedIdeaIds)}
            onPress={() =>
              router.push(
                `/book/${entry.bookId}/feed?ideaId=${entry.idea.id}&from=discover`,
              )
            }
          />
        ))}
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
  feed: {
    gap: Spacing.three,
  },
});
