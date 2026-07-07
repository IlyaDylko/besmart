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
  getSummaryFlags,
  ideaProgressKey,
  isIdeaCompleted,
  applyBookProgress,
} from './books';

export type { IdeaEntry } from './books';

export { getBookCoverImage, resolveSlideImage } from './book-images';

export type { BookCatalogEntry } from './book-catalog';
export { BOOK_CATALOG, IDEA_EMOJIS } from './book-catalog';
