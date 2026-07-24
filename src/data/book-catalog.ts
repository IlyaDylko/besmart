export type BookCatalogEntry = {
  title: string;
  author: string;
  category: string;
  coverEmoji: string;
  description: string;
};

export const BOOK_CATALOG: Record<string, BookCatalogEntry> = {
  // --- Habits ---
  atomic_habits: {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'HABITS',
    coverEmoji: '🧱',
    description:
      'Ready to unlock **habits that stick for good?** Atomic Habits offers a proven framework for improving every day through tiny, consistent changes that compound over time.',
  },
  power_of_habit: {
    title: 'The Power of Habit',
    author: 'Charles Duhigg',
    category: 'HABITS',
    coverEmoji: '🔄',
    description:
      'Habits run on a simple loop — cue, routine, reward. Duhigg shows how to **rewire the patterns** that shape your days, teams, and organizations.',
  },
  deep_work: {
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'HABITS',
    coverEmoji: '🎯',
    description:
      'Focused work is a rare skill in a distracted world. Newport explains how to **protect attention** and produce work that actually matters.',
  },
  seven_habits: {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    category: 'HABITS',
    coverEmoji: '⭐',
    description:
      'Effectiveness starts with character, not shortcuts. Covey\'s seven habits build **principles-first** behavior for work and life.',
  },
  eat_that_frog: {
    title: 'Eat That Frog!',
    author: 'Brian Tracy',
    category: 'HABITS',
    coverEmoji: '🐸',
    description:
      'Your biggest task is usually the one you avoid most. Tracy\'s approach helps you **tackle hard work first** and stop procrastinating.',
  },
  // --- Money ---
  psychology_of_money: {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'MONEY',
    coverEmoji: '💰',
    description:
      'Money decisions are rarely about spreadsheets — they are about **behavior, luck, and psychology**. Learn why wealth is as much a mindset as a math problem.',
  },
  rich_dad_poor_dad: {
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    category: 'MONEY',
    coverEmoji: '📈',
    description:
      'Wealth is built through **how you think about money**, not just how much you earn. Kiyosaki contrasts two mindsets that shape financial outcomes.',
  },
  richest_man_babylon: {
    title: 'The Richest Man in Babylon',
    author: 'George S. Clason',
    category: 'MONEY',
    coverEmoji: '🏛️',
    description:
      'Simple money rules, told as parables. Clason\'s classics on **saving, investing, and discipline** still apply centuries later.',
  },
  think_and_grow_rich: {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    category: 'MONEY',
    coverEmoji: '💎',
    description:
      'Desire backed by disciplined action can build wealth. Hill distills **mindset and persistence** from studying successful people.',
  },
  // --- Psychology ---
  thinking_fast_slow: {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'PSYCHOLOGY',
    coverEmoji: '🧠',
    description:
      'Your mind runs on two systems — one fast, one slow. Understand how **biases shape your judgments** and how to make better decisions under uncertainty.',
  },
  influence: {
    title: 'Influence: The Psychology of Persuasion',
    author: 'Robert B. Cialdini',
    category: 'PSYCHOLOGY',
    coverEmoji: '🧲',
    description:
      'People say yes for predictable reasons. Cialdini breaks down **six principles of persuasion** — and how to resist them too.',
  },
  mindset: {
    title: 'Mindset',
    author: 'Carol S. Dweck',
    category: 'PSYCHOLOGY',
    coverEmoji: '🌱',
    description:
      'Fixed or growth mindset changes how you handle challenge and failure. Dweck shows why **believing you can improve** actually makes you improve.',
  },
  emotional_intelligence: {
    title: 'Emotional Intelligence',
    author: 'Daniel Goleman',
    category: 'PSYCHOLOGY',
    coverEmoji: '❤️',
    description:
      'IQ alone doesn\'t predict success. Goleman argues **self-awareness and empathy** matter as much as raw cognitive ability.',
  },
  predictably_irrational: {
    title: 'Predictably Irrational',
    author: 'Dan Ariely',
    category: 'PSYCHOLOGY',
    coverEmoji: '🎢',
    description:
      'We don\'t always choose rationally — but our mistakes follow patterns. Ariely reveals **hidden forces** behind everyday decisions.',
  },
  // --- Business ---
  lean_startup: {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    category: 'BUSINESS',
    coverEmoji: '🚀',
    description:
      'Build smarter by testing assumptions fast. The Lean Startup shows how **validated learning** beats perfect plans when the future is uncertain.',
  },
  lean_startup_new: {
    title: 'The Lean Startup (New)',
    author: 'Eric Ries',
    category: 'BUSINESS',
    coverEmoji: '🚀',
    description:
      'Build smarter by testing assumptions fast. The Lean Startup shows how **validated learning** beats perfect plans when the future is uncertain. (Hook-style ideas rewrite for Ideas feed comparison.)',
  },
  zero_to_one: {
    title: 'Zero to One',
    author: 'Peter Thiel',
    category: 'BUSINESS',
    coverEmoji: '1️⃣',
    description:
      'Copying competition creates zero progress. Thiel argues for **building something new** — monopolies through unique innovation.',
  },
  good_to_great: {
    title: 'Good to Great',
    author: 'Jim Collins',
    category: 'BUSINESS',
    coverEmoji: '📊',
    description:
      'Some companies break out while others stall. Collins identifies **disciplined habits and leadership** that turn good into great.',
  },
  four_hour_workweek: {
    title: 'The 4-Hour Workweek',
    author: 'Timothy Ferriss',
    category: 'BUSINESS',
    coverEmoji: '⏱️',
    description:
      'Work less, live more — by design. Ferriss challenges the 9-to-5 and offers **automation and lifestyle design** for freedom.',
  },
  start_with_why: {
    title: 'Start with Why',
    author: 'Simon Sinek',
    category: 'BUSINESS',
    coverEmoji: '💫',
    description:
      'People don\'t buy what you do — they buy **why you do it**. Sinek\'s Golden Circle explains how purpose inspires action.',
  },
  high_output_management: {
    title: 'High Output Management',
    author: 'Andrew S. Grove',
    category: 'BUSINESS',
    coverEmoji: '🏭',
    description:
      'Management is leverage. Andrew Grove explains how to run teams, meetings, and systems so that output scales through people, not just effort.',
  },
  breakneck_chinas_quest_to_engineer_the_future: {
    title: "Breakneck: China's Quest to Engineer the Future",
    author: 'Dan Wang',
    category: 'BUSINESS',
    coverEmoji: '🏗️',
    description:
      'China builds at a speed the West can barely imagine — bridges, railways, factories, whole cities. Dan Wang argues this is not chaos but an **engineering state** racing to shape the future.',
  },
  // --- Communication ---
  win_friends: {
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    category: 'COMMUNICATION',
    coverEmoji: '🤝',
    description:
      'People skills are practical skills. Carnegie\'s timeless principles help you **connect, persuade, and lead** without manipulation or empty flattery.',
  },
  never_split_difference: {
    title: 'Never Split the Difference',
    author: 'Chris Voss',
    category: 'COMMUNICATION',
    coverEmoji: '🎙️',
    description:
      'FBI negotiation tactics for everyday life. Voss teaches **tactical empathy** and calibrated questions to get better deals.',
  },
  crucial_conversations: {
    title: 'Crucial Conversations',
    author: 'Kerry Patterson',
    category: 'COMMUNICATION',
    coverEmoji: '💬',
    description:
      'When stakes are high, emotions run strong, and opinions differ — most conversations fail. Learn to **talk when it matters most**.',
  },
  // --- Growth ---
  subtle_art: {
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    category: 'GROWTH',
    coverEmoji: '🔥',
    description:
      'Not everything deserves your energy. Manson argues that **choosing what to care about** — and accepting life\'s problems — is the path to a better life.',
  },
  cant_hurt_me: {
    title: "Can't Hurt Me",
    author: 'David Goggins',
    category: 'GROWTH',
    coverEmoji: '💪',
    description:
      'Goggins transformed himself through **mental toughness and accountability**. His story is brutal, practical, and impossible to forget.',
  },
  mans_search_meaning: {
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    category: 'GROWTH',
    coverEmoji: '🕯️',
    description:
      'Even in suffering, meaning can be chosen. Frankl\'s Holocaust experience became a foundation for **logotherapy and resilience**.',
  },
  power_of_now: {
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    category: 'GROWTH',
    coverEmoji: '🧘',
    description:
      'Most pain comes from living in the past or future. Tolle invites you into **present-moment awareness** as a path to peace.',
  },
  ikigai: {
    title: 'Ikigai',
    author: 'Hector Garcia and Francesc Miralles',
    category: 'GROWTH',
    coverEmoji: '☀️',
    description:
      'Okinawans live long, purposeful lives. This book explores **ikigai** — the intersection of passion, mission, vocation, and profession.',
  },
  daring_greatly: {
    title: 'Daring Greatly',
    author: 'Brené Brown',
    category: 'GROWTH',
    coverEmoji: '💗',
    description:
      'Vulnerability is not weakness — it\'s courage. Brown shows how **showing up authentically** transforms relationships and leadership.',
  },
  compound_effect: {
    title: 'The Compound Effect',
    author: 'Darren Hardy',
    category: 'GROWTH',
    coverEmoji: '📈',
    description:
      'Small daily choices compound into massive results — or massive regret. Hardy makes **consistency** feel actionable.',
  },
  grit: {
    title: 'Grit',
    author: 'Angela Duckworth',
    category: 'GROWTH',
    coverEmoji: '🏔️',
    description:
      'Talent matters less than you think. Duckworth\'s research shows **passion plus perseverance** predict achievement better than IQ.',
  },
  // --- Decisions ---
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
      'Charlie Munger\'s principles on judgment, multidisciplinary thinking, and avoiding stupidity are a masterclass in practical wisdom.',
  },
  decisive: {
    title: 'Decisive',
    author: 'Chip Heath and Dan Heath',
    category: 'DECISIONS',
    coverEmoji: '🎯',
    description:
      'Most bad choices come from predictable decision traps. The Heath brothers offer a practical system for widening options and making better calls.',
  },
  why_nations_fail: {
    title: 'Why Nations Fail',
    author: 'Daron Acemoglu and James A. Robinson',
    category: 'DECISIONS',
    coverEmoji: '🏛️',
    description:
      'Prosperity is not about geography or culture — it is about **institutions**. Acemoglu and Robinson show why inclusive rules create wealth and extractive ones trap nations in poverty.',
  },
  // --- Conspiracy / alternative history ---
  fingerprints_of_the_gods: {
    title: 'Fingerprints of the Gods',
    author: 'Graham Hancock',
    category: 'CONSPIRACY',
    coverEmoji: '🗿',
    description:
      'Hancock argues that a lost advanced civilization may have shaped ancient myths and monuments. A provocative tour of **alternative history** — and why mainstream archaeology pushes back.',
  },
  magicians_of_the_gods: {
    title: 'Magicians of the Gods',
    author: 'Graham Hancock',
    category: 'CONSPIRACY',
    coverEmoji: '☄️',
    description:
      'A sequel to Fingerprints of the Gods: Hancock links a proposed Younger Dryas catastrophe to floods, myths, and the idea that **knowledge survivors** seeded later civilizations.',
  },
  america_before: {
    title: 'America Before',
    author: 'Graham Hancock',
    category: 'CONSPIRACY',
    coverEmoji: '🌎',
    description:
      'Was the Americas\' deep past richer — and stranger — than textbooks allow? Hancock explores mounds, myths, and genetics to challenge the **standard peopling-of-the-Americas** story.',
  },
  chariots_of_the_gods: {
    title: 'Chariots of the Gods?',
    author: 'Erich von Däniken',
    category: 'CONSPIRACY',
    coverEmoji: '👽',
    description:
      'The classic that popularized **ancient astronaut** theory. Von Däniken asks whether gods in old texts were visitors from the stars — and why the idea still grips the public.',
  },
};

export const IDEA_EMOJIS = ['💡', '⚡', '🎯', '🔑', '🧩', '📌', '✨', '🛠️'];
