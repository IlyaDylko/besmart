export type PresentationSlideType = 'content' | 'reveal' | 'summary' | 'swipe-hint';

export type PresentationSlide = {
  type: PresentationSlideType;
  title?: string;
  body: string;
  bullets?: string[];
  footer?: string;
  hiddenText?: string;
  illustration?: string;
  hint?: string;
};

export type BookIdea = {
  id: string;
  bookId: string;
  index: number;
  title: string;
  durationMinutes: number;
  emoji: string;
  locked: boolean;
  slides: PresentationSlide[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  headline: string;
  category: string;
  coverEmoji: string;
  description: string;
  keyIdeasCount: number;
  minutesPerIdea: string;
  progress: number;
  ideas: BookIdea[];
};
