// Public data API — import from '@/data' instead of individual modules.

export { topics, getTopic } from './topics';

export {
  lessons,
  getLesson,
  getLessonsByTopic,
  getRecommendedLesson,
} from './lessons';

export {
  books,
  getBook,
  getBookWithProgress,
  getBookIdea,
  getBookIdeaWithProgress,
  getCurrentIdea,
  getAllIdeasWithProgress,
  getIdeaTeaser,
  getIdeaDiscoverTeaser,
  getSummaryFlags,
  ideaProgressKey,
  isIdeaCompleted,
  applyBookProgress,
} from './books';

export type { IdeaEntry } from './books';

export {
  buildDiscoverFeed,
  DISCOVER_DAILY_SIZE,
  DISCOVER_CONTINUE_MAX,
} from './discover-feed';
export type { DiscoverFeedItem, DiscoverStatus, DiscoverFeed } from './discover-feed';

export { getBookCoverImage, getIdeaCardImage, hasSlideImage, resolveSlideImage } from './book-images';


export type { BookCatalogEntry } from './book-catalog';
export { BOOK_CATALOG, IDEA_EMOJIS } from './book-catalog';
