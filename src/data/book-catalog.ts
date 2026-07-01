export type BookCatalogEntry = {
  title: string;
  author: string;
  category: string;
  coverEmoji: string;
  description: string;
};

export const BOOK_CATALOG: Record<string, BookCatalogEntry> = {
  atomic_habits: {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'HABITS',
    coverEmoji: '🧱',
    description:
      'Ready to unlock **habits that stick for good?** Atomic Habits offers a proven framework for improving every day through tiny, consistent changes that compound over time.',
  },
  psychology_of_money: {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'MONEY',
    coverEmoji: '💰',
    description:
      'Money decisions are rarely about spreadsheets — they are about **behavior, luck, and psychology**. Learn why wealth is as much a mindset as a math problem.',
  },
  thinking_fast_slow: {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'PSYCHOLOGY',
    coverEmoji: '🧠',
    description:
      'Your mind runs on two systems — one fast, one slow. Understand how **biases shape your judgments** and how to make better decisions under uncertainty.',
  },
  lean_startup: {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    category: 'BUSINESS',
    coverEmoji: '🚀',
    description:
      'Build smarter by testing assumptions fast. The Lean Startup shows how **validated learning** beats perfect plans when the future is uncertain.',
  },
  win_friends: {
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    category: 'COMMUNICATION',
    coverEmoji: '🤝',
    description:
      'People skills are practical skills. Carnegie\'s timeless principles help you **connect, persuade, and lead** without manipulation or empty flattery.',
  },
  subtle_art: {
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    category: 'GROWTH',
    coverEmoji: '🔥',
    description:
      'Not everything deserves your energy. Manson argues that **choosing what to care about** — and accepting life\'s problems — is the path to a better life.',
  },
};

export const IDEA_EMOJIS = ['💡', '⚡', '🎯', '🔑', '🧩', '📌', '✨', '🛠️'];
