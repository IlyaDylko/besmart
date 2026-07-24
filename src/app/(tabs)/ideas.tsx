import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverIdeaCard } from '@/components/book/discover-idea-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CATEGORY_FILTER_LABELS,
  DISCOVER_CATEGORY_ORDER,
} from '@/constants/book-categories';
import { BookColors, BookTypography, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import {
  buildDiscoverFeed,
  DISCOVER_DAILY_SIZE,
  type DiscoverFeedItem,
} from '@/data/discover-feed';

const PAGE_SIZE = DISCOVER_DAILY_SIZE;

type ListRow =
  | { type: 'header'; key: string; title: string }
  | { type: 'idea'; key: string; item: DiscoverFeedItem }
  | { type: 'empty'; key: string };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function IdeasScreenInner() {
  const {
    completedIdeaIds,
    impressedIdeaIds,
    openedIdeaIds,
    readingBookIds,
    markIdeaImpressed,
    markIdeaOpened,
  } = useApp();
  const insets = useSafeAreaInsets();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [day, setDay] = useState(todayKey);
  const [category, setCategory] = useState<string | null>(null);

  // Snapshot impressions when the daily feed is built so scrolling doesn't reshuffle.
  const impressedSnapshot = useRef(impressedIdeaIds);
  useEffect(() => {
    const nextDay = todayKey();
    if (nextDay !== day) {
      setDay(nextDay);
      impressedSnapshot.current = impressedIdeaIds;
      setVisibleCount(PAGE_SIZE);
    }
  }, [day, impressedIdeaIds]);

  useEffect(() => {
    // Remount / first paint: lock current impressions into ranking.
    impressedSnapshot.current = impressedIdeaIds;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  const { continueItems, feed } = useMemo(
    () =>
      buildDiscoverFeed({
        completedIdeaIds,
        impressedIdeaIds: impressedSnapshot.current,
        openedIdeaIds,
        readingBookIds,
        day,
        category,
      }),
    [completedIdeaIds, openedIdeaIds, readingBookIds, day, category],
  );

  const visibleFeed = feed.slice(0, visibleCount);

  const rows: ListRow[] = useMemo(() => {
    const next: ListRow[] = [];
    if (continueItems.length > 0) {
      next.push({ type: 'header', key: 'header-continue', title: 'Continue' });
      for (const item of continueItems) {
        next.push({ type: 'idea', key: `continue:${item.key}`, item });
      }
    }
    if (visibleFeed.length === 0 && continueItems.length === 0) {
      next.push({ type: 'empty', key: 'empty' });
      return next;
    }
    next.push({ type: 'header', key: 'header-picks', title: "Today's picks" });
    for (const item of visibleFeed) {
      next.push({ type: 'idea', key: item.key, item });
    }
    return next;
  }, [continueItems, visibleFeed]);

  const openIdea = useCallback(
    (item: DiscoverFeedItem) => {
      markIdeaOpened(item.bookId, item.idea.id);
      router.push(`/book/${item.bookId}/feed?ideaId=${item.idea.id}&from=discover`);
    },
    [markIdeaOpened],
  );

  const selectCategory = useCallback((next: string | null) => {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const markImpressedRef = useRef(markIdeaImpressed);
  markImpressedRef.current = markIdeaImpressed;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      for (const token of viewableItems) {
        const row = token.item as ListRow | undefined;
        if (row?.type !== 'idea') continue;
        markImpressedRef.current(row.item.bookId, row.item.idea.id);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 55,
    minimumViewTime: 400,
  }).current;

  function loadMore() {
    setVisibleCount((current) => {
      if (current >= feed.length) return current;
      return Math.min(current + PAGE_SIZE, feed.length);
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Ideas
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Skip the scroll. Pick one idea — about 3 minutes.
          </ThemedText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersScroll}>
          <Pressable
            onPress={() => selectCategory(null)}
            style={[styles.filterChip, category === null && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, category === null && styles.filterChipTextActive]}>
              All
            </Text>
          </Pressable>
          {DISCOVER_CATEGORY_ORDER.map((id) => {
            const active = category === id;
            return (
              <Pressable
                key={id}
                onPress={() => selectCategory(id)}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {CATEGORY_FILTER_LABELS[id] ?? id}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Spacing.four + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: row }) => {
            if (row.type === 'header') {
              return (
                <ThemedText type="smallBold" style={styles.sectionLabel}>
                  {row.title}
                </ThemedText>
              );
            }
            if (row.type === 'empty') {
              return (
                <View style={styles.empty}>
                  <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                    No ideas in this category yet. Try another filter.
                  </ThemedText>
                </View>
              );
            }
            return (
              <DiscoverIdeaCard
                idea={row.item.idea}
                bookId={row.item.bookId}
                bookTitle={row.item.bookTitle}
                bookAuthor={row.item.bookAuthor}
                coverEmoji={row.item.coverEmoji}
                category={row.item.category}
                status={row.item.status}
                onPress={() => openIdea(row.item)}
              />
            );
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

export default observer(IdeasScreenInner);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  filtersScroll: {
    flexGrow: 0,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  filters: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    gap: Spacing.two,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: BookColors.card,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: BookColors.brown,
    borderColor: BookColors.brown,
  },
  filterChipText: {
    ...BookTypography.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: BookColors.brown,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  separator: {
    height: Spacing.three,
  },
  sectionLabel: {
    opacity: 0.85,
    marginBottom: -Spacing.one,
  },
  empty: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});
