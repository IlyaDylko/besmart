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
  thinking_in_bets: {
    title: 'Thinking in Bets',
    author: 'Annie Duke',
    category: 'DECISIONS',
    coverEmoji: '🎲',
    description:
      'Great decisions are not guarantees — they are bets under uncertainty. Annie Duke shows how to think in probabilities, separate skill from luck, and judge choices more clearly.',
  },
  superforecasting: {
    title: 'Superforecasting',
    author: 'Philip E. Tetlock',
    category: 'DECISIONS',
    coverEmoji: '🔮',
    description:
      'Some people forecast the future better than experts by thinking in probabilities, updating often, and staying intellectually humble.',
  },
  antifragile: {
    title: 'Antifragile',
    author: 'Nassim Nicholas Taleb',
    category: 'DECISIONS',
    coverEmoji: '⚡',
    description:
      'Some systems do more than survive stress — they benefit from it. Taleb explores how volatility, randomness, and disorder can make people and systems stronger.',
  },
  great_mental_models: {
    title: 'The Great Mental Models',
    author: 'Shane Parrish',
    category: 'DECISIONS',
    coverEmoji: '🧩',
    description:
      'Clear thinking improves when you borrow the best models from many disciplines. This book helps you see problems through stronger mental frameworks.',
  },
  poor_charlies_almanack: {
    title: "Poor Charlie's Almanack",
    author: 'Charlie Munger',
    category: 'DECISIONS',
    coverEmoji: '🦉',
    description:
      'Charlie Munger’s principles on judgment, multidisciplinary thinking, and avoiding stupidity are a masterclass in practical wisdom.',
  },
  decisive: {
    title: 'Decisive',
    author: 'Chip Heath and Dan Heath',
    category: 'DECISIONS',
    coverEmoji: '🎯',
    description:
      'Most bad choices come from predictable decision traps. The Heath brothers offer a practical system for widening options and making better calls.',
  },
  high_output_management: {
    title: 'High Output Management',
    author: 'Andrew S. Grove',
    category: 'BUSINESS',
    coverEmoji: '🏭',
    description:
      'Management is leverage. Andrew Grove explains how to run teams, meetings, and systems so that output scales through people, not just effort.',
  },
};

export const IDEA_EMOJIS = ['💡', '⚡', '🎯', '🔑', '🧩', '📌', '✨', '🛠️'];
