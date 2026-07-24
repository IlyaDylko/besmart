import { BOOK_CATALOG, IDEA_EMOJIS } from '@/data/book-catalog';
import { hasSlideImage } from '@/data/book-images';
import summariesData from '@/data/summaries.json';
import type { Book, BookIdea, PresentationSlide } from '@/types/book';
import type { QuizQuestion } from '@/types/learning';

type GeneratedCard = {
  summary: string;
  bullets: string[];
  highlight: string;
};

type GeneratedQuizQuestion = Omit<QuizQuestion, 'id'>;

type GeneratedIdea = {
  title: string;
  read_minutes: number;
  screens: string[];
  card: GeneratedCard;
  questions?: GeneratedQuizQuestion[];
};

type GeneratedSummary = {
  hook: string;
  ideas: GeneratedIdea[];
};

type SummaryRow = {
  id: string;
  title?: string;
  author?: string;
  data: GeneratedSummary;
  flags?: string[];
};

const summaries = summariesData as SummaryRow[];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function ideaToSlides(idea: GeneratedIdea, bookId: string, ideaIndex: number): PresentationSlide[] {
  const imageKey = `${bookId}:${ideaIndex}`;
  const showImage = hasSlideImage(bookId, ideaIndex);

  const slides: PresentationSlide[] = idea.screens.map((screen, slideIndex) => ({
    type: 'content',
    title: slideIndex === 0 ? idea.title : undefined,
    body: screen,
    image: slideIndex === 0 && showImage ? imageKey : undefined,
  }));

  slides.push({
    type: 'summary',
    body: idea.card.summary,
    bullets: idea.card.bullets,
    footer: idea.card.highlight,
  });

  return slides;
}

function ideaToQuestions(
  idea: GeneratedIdea,
  bookId: string,
): QuizQuestion[] {
  const ideaId = slugify(idea.title);
  return (idea.questions ?? []).map((question, questionIndex) => ({
    id: `${bookId}:${ideaId}:q${questionIndex + 1}`,
    ...question,
  }));
}

function buildBook(row: SummaryRow): Book | undefined {
  const catalog = BOOK_CATALOG[row.id];
  if (!catalog) return undefined;

  const { data } = row;
  if (!data.ideas || data.ideas.length === 0) return undefined;

  const readMinutes = data.ideas.map((idea) => idea.read_minutes);
  const minRead = Math.min(...readMinutes);
  const maxRead = Math.max(...readMinutes);

  const ideas: BookIdea[] = data.ideas.map((idea, index) => ({
    id: slugify(idea.title),
    bookId: row.id,
    index: index + 1,
    title: idea.title,
    durationMinutes: idea.read_minutes,
    emoji: IDEA_EMOJIS[index % IDEA_EMOJIS.length],
    slides: ideaToSlides(idea, row.id, index),
    questions: ideaToQuestions(idea, row.id),
  }));

  return {
    id: row.id,
    title: catalog.title,
    author: catalog.author,
    headline: data.hook,
    category: catalog.category,
    coverEmoji: catalog.coverEmoji,
    coverImage: row.id,
    description: catalog.description,
    keyIdeasCount: data.ideas.length,
    minutesPerIdea: minRead === maxRead ? `${minRead} min` : `${minRead}–${maxRead} min`,
    progress: 0,
    ideas,
  };
}

export const books: Book[] = summaries
  .map(buildBook)
  .filter((book): book is Book => book !== undefined);

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function ideaProgressKey(bookId: string, ideaId: string): string {
  return `${bookId}:${ideaId}`;
}

export function isIdeaCompleted(
  bookId: string,
  ideaId: string,
  completedIdeaIds: string[],
): boolean {
  return completedIdeaIds.includes(ideaProgressKey(bookId, ideaId));
}

export function applyBookProgress(book: Book, completedIdeaIds: string[]): Book {
  const completedCount = book.ideas.filter((idea) =>
    isIdeaCompleted(book.id, idea.id, completedIdeaIds),
  ).length;

  return {
    ...book,
    progress: book.ideas.length > 0 ? completedCount / book.ideas.length : 0,
  };
}

export function getBookWithProgress(bookId: string, completedIdeaIds: string[]): Book | undefined {
  const book = getBook(bookId);
  return book ? applyBookProgress(book, completedIdeaIds) : undefined;
}

export function getBookIdea(bookId: string, ideaId: string): BookIdea | undefined {
  const book = getBook(bookId);
  return book?.ideas.find((idea) => idea.id === ideaId);
}

export function getBookIdeaWithProgress(
  bookId: string,
  ideaId: string,
  completedIdeaIds: string[],
): BookIdea | undefined {
  const book = getBookWithProgress(bookId, completedIdeaIds);
  return book?.ideas.find((idea) => idea.id === ideaId);
}

export function getCurrentIdea(book: Book, completedIdeaIds: string[]): BookIdea {
  const nextUnread = book.ideas.find(
    (idea) => !isIdeaCompleted(book.id, idea.id, completedIdeaIds),
  );

  if (nextUnread) return nextUnread;

  return book.ideas.at(-1) ?? book.ideas[0];
}

export function getSummaryFlags(bookId: string): string[] {
  const row = summaries.find((entry) => entry.id === bookId);
  return row?.flags ?? [];
}

export type IdeaEntry = {
  idea: BookIdea;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverEmoji: string;
  category: string;
};

export function getIdeaTeaser(idea: BookIdea): string {
  const body = idea.slides.find((slide) => slide.type === 'content')?.body ?? '';
  return body.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

/** Short hook line for editorial Ideas cards (summary slide, else first content sentence). */
export function getIdeaDiscoverTeaser(idea: BookIdea): string {
  const summary = idea.slides.find((slide) => slide.type === 'summary')?.body ?? '';
  const source = summary || getIdeaTeaser(idea);
  const normalized = source.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? normalized).trim();
}

export function getAllIdeasWithProgress(completedIdeaIds: string[]): IdeaEntry[] {
  return books.flatMap((book) => {
    const withProgress = applyBookProgress(book, completedIdeaIds);
    return withProgress.ideas.map((idea) => ({
      idea,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      coverEmoji: book.coverEmoji,
      category: book.category,
    }));
  });
}
