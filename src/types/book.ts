import type { QuizQuestion } from '@/types/learning';

export type PresentationSlideType = 'content' | 'reveal' | 'summary' | 'swipe-hint' | 'quiz';

export type PresentationSlide = {
  type: PresentationSlideType;
  title?: string;
  body: string;
  bullets?: string[];
  footer?: string;
  hiddenText?: string;
  illustration?: string;
  hint?: string;
  /** Key into SLIDE_IMAGES or a remote URI */
  image?: string;
  question?: QuizQuestion;
  quizNumber?: number;
  quizTotal?: number;
};

export type BookIdea = {
  id: string;
  bookId: string;
  index: number;
  title: string;
  durationMinutes: number;
  emoji: string;
  slides: PresentationSlide[];
  questions: QuizQuestion[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  headline: string;
  category: string;
  coverEmoji: string;
  coverImage?: string;
  description: string;
  keyIdeasCount: number;
  minutesPerIdea: string;
  progress: number;
  ideas: BookIdea[];
};
