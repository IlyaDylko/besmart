import {
  getAllIdeasWithProgress,
  ideaProgressKey,
  isIdeaCompleted,
  type IdeaEntry,
} from '@/data/books';

export type DiscoverStatus = 'new' | 'continue' | 'done';

export type DiscoverFeedItem = IdeaEntry & {
  status: DiscoverStatus;
  key: string;
};

export const DISCOVER_DAILY_SIZE = 12;
export const DISCOVER_CONTINUE_MAX = 2;

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Deterministic PRNG seed from string (mulberry32-friendly). */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  const rand = mulberry32(hashSeed(seed));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Avoid stacking the same book in adjacent slots when possible. */
function diversifyByBook(items: DiscoverFeedItem[]): DiscoverFeedItem[] {
  if (items.length < 2) return items;
  const pending = [...items];
  const out: DiscoverFeedItem[] = [];

  while (pending.length > 0) {
    const lastBook = out.at(-1)?.bookId;
    const nextIndex = pending.findIndex((item) => item.bookId !== lastBook);
    const pickAt = nextIndex >= 0 ? nextIndex : 0;
    out.push(pending.splice(pickAt, 1)[0]);
  }

  return out;
}

function withStatus(entry: IdeaEntry, status: DiscoverStatus): DiscoverFeedItem {
  return {
    ...entry,
    status,
    key: ideaProgressKey(entry.bookId, entry.idea.id),
  };
}

export type BuildDiscoverFeedInput = {
  completedIdeaIds: string[];
  impressedIdeaIds: string[];
  openedIdeaIds: string[];
  readingBookIds: string[];
  /** Defaults to today UTC date — stable “Today’s picks” order within the day. */
  day?: string;
  /** When set, only ideas from this catalog category. */
  category?: string | null;
};

export type DiscoverFeed = {
  continueItems: DiscoverFeedItem[];
  feed: DiscoverFeedItem[];
  day: string;
};

/**
 * Rank Ideas for discovery: Continue → fresh → impressed → done,
 * with a seeded daily shuffle and book diversity.
 */
export function buildDiscoverFeed(input: BuildDiscoverFeedInput): DiscoverFeed {
  const day = input.day ?? dayKey();
  const completed = new Set(input.completedIdeaIds);
  const impressed = new Set(input.impressedIdeaIds);
  const opened = new Set(input.openedIdeaIds);
  const reading = new Set(input.readingBookIds);
  const category = input.category ?? null;

  const all = getAllIdeasWithProgress(input.completedIdeaIds).filter((entry) =>
    category ? entry.category === category : true,
  );

  const continueItems: DiscoverFeedItem[] = [];
  const continueKeys = new Set<string>();

  // Prefer opened-but-not-done; boost books already in reading list.
  const openedCandidates = input.openedIdeaIds
    .map((key) => {
      const entry = all.find((item) => ideaProgressKey(item.bookId, item.idea.id) === key);
      return entry;
    })
    .filter((entry): entry is IdeaEntry => {
      if (!entry) return false;
      return !isIdeaCompleted(entry.bookId, entry.idea.id, input.completedIdeaIds);
    })
    .sort((a, b) => {
      const aReading = reading.has(a.bookId) ? 0 : 1;
      const bReading = reading.has(b.bookId) ? 0 : 1;
      return aReading - bReading;
    });

  for (const entry of openedCandidates) {
    if (continueItems.length >= DISCOVER_CONTINUE_MAX) break;
    const key = ideaProgressKey(entry.bookId, entry.idea.id);
    if (continueKeys.has(key)) continue;
    continueItems.push(withStatus(entry, 'continue'));
    continueKeys.add(key);
  }

  const fresh: DiscoverFeedItem[] = [];
  const seen: DiscoverFeedItem[] = [];
  const done: DiscoverFeedItem[] = [];

  for (const entry of all) {
    const key = ideaProgressKey(entry.bookId, entry.idea.id);
    if (continueKeys.has(key)) continue;

    if (completed.has(key)) {
      done.push(withStatus(entry, 'done'));
      continue;
    }
    if (impressed.has(key) || opened.has(key)) {
      seen.push(withStatus(entry, 'new'));
      continue;
    }
    fresh.push(withStatus(entry, 'new'));
  }

  const seedSuffix = category ? `:${category}` : '';
  const feed = [
    ...diversifyByBook(seededShuffle(fresh, `${day}:fresh${seedSuffix}`)),
    ...diversifyByBook(seededShuffle(seen, `${day}:seen${seedSuffix}`)),
    ...diversifyByBook(seededShuffle(done, `${day}:done${seedSuffix}`)),
  ];

  return { continueItems, feed, day };
}
