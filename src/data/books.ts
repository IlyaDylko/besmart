import type { Book, BookIdea, PresentationSlide } from '@/types/book';

const theOnePercentSlides: PresentationSlide[] = [
  {
    type: 'content',
    title: 'The 1% Rule',
    body:
      'This whole **1% better each day** thing? It\'s not just math, it\'s legit and proven! The **British cycling team** was garbage for decades, never winning anything significant.\n\nThen coach **Brailsford** came in with a simple idea: *tiny improvements everywhere*.',
    illustration: '🚴‍♂️',
  },
  {
    type: 'reveal',
    title: 'The 1% Rule',
    hiddenText: 'Tap to reveal the idea',
    body:
      'Making tiny, consistent **improvements** daily (just 1%) **compounds dramatically** over time. Instead of seeking radical change, focus on being *slightly better* today than yesterday.',
    illustration: '🚴',
  },
  {
    type: 'summary',
    body:
      'Making tiny, consistent **improvements** daily (just 1%) **compounds dramatically** over time. Instead of seeking radical change, focus on being *slightly better* today than yesterday.',
    bullets: ['Start small and specific', 'Track your progress', 'Be consistent rather than perfect'],
    footer:
      'As James Clear highlights: *1% better each day = 37x better after one year!* This is the essence of the compound effect in personal growth.',
  },
  {
    type: 'content',
    body:
      'Brailsford focused on *1% improvements* in every area — bike seats, pillow quality, hand-washing techniques. Within five years, British cyclists dominated the Olympics and Tour de France.',
    illustration: '🏆',
  },
  {
    type: 'swipe-hint',
    body:
      'Think of habits like **compound interest** for your life. Don\'t sweat *perfection*, just be **consistent**.\n\nThose *tiny gains* seem pointless now but secretly build your **future success**!',
    hint: 'Drag or tap the card to see it',
  },
  {
    type: 'content',
    body:
      'The math is simple: get **1% better** each day for a year and you end up **37 times better**. Get **1% worse** and you decline to nearly zero.\n\nSmall changes compound into remarkable results.',
  },
  {
    type: 'summary',
    body:
      '**The 1% Rule** is about showing up consistently, not perfectly. Focus on systems that make tiny improvements automatic.',
    bullets: ['Improve by 1% daily', 'Compound gains over time', 'Systems beat goals'],
    footer: 'Ready for the next idea?',
  },
];

const placeholderSlides = (title: string): PresentationSlide[] => [
  {
    type: 'content',
    title,
    body: `This is a placeholder slide for **${title}**. Content coming soon.`,
    illustration: '📖',
  },
  {
    type: 'summary',
    body: `Key takeaways from **${title}** will appear here.`,
    bullets: ['Coming soon', 'Stay tuned'],
  },
];

const atomicHabitsIdeas: BookIdea[] = [
  {
    id: 'the-1-percent-rule',
    bookId: 'atomic-habits',
    index: 1,
    title: 'The 1% Rule',
    durationMinutes: 5,
    emoji: '🚴',
    locked: false,
    slides: theOnePercentSlides,
  },
  {
    id: 'systems-over-goals',
    bookId: 'atomic-habits',
    index: 2,
    title: 'Systems over Goals',
    durationMinutes: 5,
    emoji: '🏃',
    locked: true,
    slides: placeholderSlides('Systems over Goals'),
  },
  {
    id: 'identity-based-habits',
    bookId: 'atomic-habits',
    index: 3,
    title: 'Identity-Based Habits',
    durationMinutes: 4,
    emoji: '👥',
    locked: true,
    slides: placeholderSlides('Identity-Based Habits'),
  },
  {
    id: 'atomic-habits-idea',
    bookId: 'atomic-habits',
    index: 4,
    title: 'Atomic Habits',
    durationMinutes: 4,
    emoji: '⚛️',
    locked: true,
    slides: placeholderSlides('Atomic Habits'),
  },
  {
    id: 'the-habit-loop',
    bookId: 'atomic-habits',
    index: 5,
    title: 'The Habit Loop',
    durationMinutes: 5,
    emoji: '🔄',
    locked: true,
    slides: placeholderSlides('The Habit Loop'),
  },
  {
    id: 'four-laws',
    bookId: 'atomic-habits',
    index: 6,
    title: 'The 4 Laws of Behavior Change',
    durationMinutes: 4,
    emoji: '⚙️',
    locked: true,
    slides: placeholderSlides('The 4 Laws of Behavior Change'),
  },
  {
    id: 'habit-stacking',
    bookId: 'atomic-habits',
    index: 7,
    title: 'Habit Stacking — Build New Habits on Existing Ones',
    durationMinutes: 4,
    emoji: '🥤',
    locked: true,
    slides: placeholderSlides('Habit Stacking'),
  },
];

export const books: Book[] = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    headline: 'Build habits that actually stick',
    category: 'HABITS',
    coverEmoji: '🧱',
    description:
      'Ready to unlock **habits that stick for good?** Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    keyIdeasCount: 13,
    minutesPerIdea: '4–5 min',
    progress: 0.05,
    ideas: atomicHabitsIdeas,
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function getBookIdea(bookId: string, ideaId: string): BookIdea | undefined {
  const book = getBook(bookId);
  return book?.ideas.find((idea) => idea.id === ideaId);
}

export function getCurrentIdea(book: Book): BookIdea {
  return book.ideas.find((idea) => !idea.locked) ?? book.ideas[0];
}
