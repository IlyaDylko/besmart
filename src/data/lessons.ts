import type { Lesson } from '@/types/learning';

export const lessons: Lesson[] = [
  {
    id: 'rome-founding',
    topicId: 'history',
    title: 'How Rome Was Founded',
    durationMinutes: 8,
    slides: [
      {
        title: 'Two brothers, one city',
        body: 'Roman legend says Romulus and Remus — twins raised by a wolf — founded Rome on the Palatine Hill around 753 BCE. Myth blended with politics to give the city a divine origin story.',
      },
      {
        title: 'Why myths matter',
        body: 'Founding myths weren\'t just stories. They helped Romans explain who they were, justify expansion, and connect everyday citizens to a shared identity.',
      },
      {
        title: 'From village to empire',
        body: 'Rome started as a small settlement near the Tiber River. Its location, alliances, and military discipline turned it into the center of one of history\'s largest empires.',
      },
    ],
    quiz: [
      {
        id: 'rome-q1',
        question: 'According to legend, who founded Rome?',
        options: ['Caesar and Pompey', 'Romulus and Remus', 'Athena and Zeus', 'Homer and Virgil'],
        correctIndex: 1,
        explanation: 'Roman myth credits Romulus and Remus as the legendary founders.',
      },
      {
        id: 'rome-q2',
        question: 'Why did Romans care about founding myths?',
        options: [
          'They had no other entertainment',
          'Myths shaped identity and political legitimacy',
          'They replaced all historical records',
          'They were required by law to memorize them',
        ],
        correctIndex: 1,
        explanation: 'Myths helped unify culture and justify Rome\'s place in the world.',
      },
    ],
  },
  {
    id: 'french-revolution',
    topicId: 'history',
    title: 'The French Revolution in 5 Ideas',
    durationMinutes: 10,
    slides: [
      {
        title: 'Liberty, equality, fraternity',
        body: 'The revolution\'s slogan captured a break from monarchy and aristocracy. Citizens demanded rights, fair taxes, and a voice in government.',
      },
      {
        title: 'The Bastille moment',
        body: 'Storming the Bastille in 1789 became a symbol of people power. It wasn\'t just a prison raid — it signaled that old authority could be challenged.',
      },
      {
        title: 'A world that changed',
        body: 'The revolution spread ideas about nationalism, citizenship, and secular government. Its effects rippled across Europe and beyond for centuries.',
      },
    ],
    quiz: [
      {
        id: 'fr-q1',
        question: 'What did "Liberty, Equality, Fraternity" represent?',
        options: [
          'A military strategy',
          'Core revolutionary ideals',
          'A religious doctrine',
          'An economic trade policy',
        ],
        correctIndex: 1,
        explanation: 'The phrase summarized the revolution\'s political and social goals.',
      },
    ],
  },
  {
    id: 'industrial-revolution',
    topicId: 'history',
    title: 'The Industrial Revolution',
    durationMinutes: 9,
    slides: [
      {
        title: 'Machines changed everything',
        body: 'Steam power and factories shifted production from homes and workshops to industrial cities. Output soared — and so did urban poverty and pollution.',
      },
      {
        title: 'New social classes',
        body: 'Industrial owners and wage workers replaced much of the old rural order. Labor movements and new laws slowly responded to harsh working conditions.',
      },
    ],
    quiz: [
      {
        id: 'ir-q1',
        question: 'What technology helped drive early industrialization?',
        options: ['Nuclear power', 'Steam power', 'Solar panels', 'Telegraphs only'],
        correctIndex: 1,
        explanation: 'Steam engines powered factories, trains, and ships during the first industrial wave.',
      },
    ],
  },
  {
    id: 'cells-basics',
    topicId: 'science',
    title: 'What Is a Cell?',
    durationMinutes: 7,
    slides: [
      {
        title: 'Life\'s building block',
        body: 'Cells are the smallest units of life. Your body has trillions of them — each with machinery to grow, repair, and communicate.',
      },
      {
        title: 'Two main types',
        body: 'Prokaryotes (like bacteria) lack a nucleus. Eukaryotes (plants, animals, fungi) have a nucleus and specialized organelles.',
      },
      {
        title: 'Why it matters',
        body: 'Understanding cells explains disease, genetics, nutrition, and medicine. Modern biology is essentially the study of cells in context.',
      },
    ],
    quiz: [
      {
        id: 'cell-q1',
        question: 'Which type of cell has a nucleus?',
        options: ['Prokaryote', 'Eukaryote', 'Both always', 'Neither'],
        correctIndex: 1,
        explanation: 'Eukaryotic cells contain a membrane-bound nucleus.',
      },
    ],
  },
  {
    id: 'gravity-basics',
    topicId: 'science',
    title: 'Gravity Without the Jargon',
    durationMinutes: 6,
    slides: [
      {
        title: 'Mass attracts mass',
        body: 'Gravity is the force that pulls objects with mass toward each other. Earth pulls you down; you pull Earth up — just much, much less.',
      },
      {
        title: 'Not just on Earth',
        body: 'Gravity keeps the Moon in orbit, bends light near black holes, and shapes galaxies. It\'s universal, though weaker with distance.',
      },
    ],
    quiz: [
      {
        id: 'grav-q1',
        question: 'What does gravity depend on?',
        options: ['Color of objects', 'Mass and distance', 'Temperature only', 'Magnetic fields only'],
        correctIndex: 1,
        explanation: 'Gravitational force increases with mass and weakens with distance.',
      },
    ],
  },
  {
    id: 'stoicism-intro',
    topicId: 'philosophy',
    title: 'Stoicism for Busy People',
    durationMinutes: 8,
    slides: [
      {
        title: 'Control what you can',
        body: 'Stoics split life into what you control (judgments, actions) and what you don\'t (weather, other people\'s moods). Focus energy on the first group.',
      },
      {
        title: 'Practice, not perfection',
        body: 'Stoicism is a daily discipline: reflect, prepare for setbacks, act with virtue. It\'s practical philosophy for real stress, not abstract debate.',
      },
    ],
    quiz: [
      {
        id: 'stoic-q1',
        question: 'Stoics advise focusing on…',
        options: [
          'Things entirely outside your control',
          'Your judgments and actions',
          'Predicting the future',
          'Avoiding all discomfort',
        ],
        correctIndex: 1,
        explanation: 'The core Stoic move is directing effort toward what you can influence.',
      },
    ],
  },
  {
    id: 'socratic-method',
    topicId: 'philosophy',
    title: 'The Socratic Method',
    durationMinutes: 7,
    slides: [
      {
        title: 'Questions over lectures',
        body: 'Socrates taught by asking questions that expose assumptions. The goal wasn\'t winning an argument — it was clearer thinking.',
      },
      {
        title: 'Still used today',
        body: 'Law schools, science, and good meetings use Socratic questioning: define terms, test logic, revise beliefs when evidence changes.',
      },
    ],
    quiz: [
      {
        id: 'soc-q1',
        question: 'The Socratic method relies mainly on…',
        options: ['Long speeches', 'Careful questioning', 'Memorization', 'Voting'],
        correctIndex: 1,
        explanation: 'Socrates used questions to examine beliefs and definitions.',
      },
    ],
  },
  {
    id: 'cognitive-bias',
    topicId: 'psychology',
    title: 'Cognitive Biases 101',
    durationMinutes: 9,
    slides: [
      {
        title: 'Shortcuts with side effects',
        body: 'Your brain uses mental shortcuts to decide fast. Biases like confirmation bias make you favor information that matches what you already believe.',
      },
      {
        title: 'Spot them, slow down',
        body: 'Naming a bias doesn\'t remove it — but pausing, seeking disconfirming evidence, and asking "what would change my mind?" helps.',
      },
    ],
    quiz: [
      {
        id: 'bias-q1',
        question: 'Confirmation bias means you tend to…',
        options: [
          'Ignore all new information',
          'Favor info that supports existing beliefs',
          'Always change your mind instantly',
          'Memorize random facts',
        ],
        correctIndex: 1,
        explanation: 'Confirmation bias filters toward evidence that fits prior views.',
      },
    ],
  },
  {
    id: 'habit-loop',
    topicId: 'psychology',
    title: 'The Habit Loop',
    durationMinutes: 8,
    slides: [
      {
        title: 'Cue → routine → reward',
        body: 'Habits run on a loop: a trigger, an automatic behavior, and a payoff. Change the routine while keeping the cue and reward to rebuild habits.',
      },
      {
        title: 'Tiny wins compound',
        body: 'Microlearning works partly because small daily cues (open app, 5 minutes) build identity: "I\'m someone who learns every day."',
      },
    ],
    quiz: [
      {
        id: 'habit-q1',
        question: 'The habit loop includes…',
        options: [
          'Cue, routine, reward',
          'Plan, panic, profit',
          'Read, write, rest',
          'Goal, guilt, quit',
        ],
        correctIndex: 0,
        explanation: 'Most habit models center on cue, routine, and reward.',
      },
    ],
  },
  {
    id: 'impressionism',
    topicId: 'art',
    title: 'Why Impressionism Shocked Paris',
    durationMinutes: 8,
    slides: [
      {
        title: 'Light over detail',
        body: 'Impressionists painted fleeting light and atmosphere — loose brushwork, outdoor scenes, everyday life — not polished historical tableaux.',
      },
      {
        title: 'A new way of seeing',
        body: 'Critics mocked the "unfinished" look. Today Monet, Degas, and Renoir define a shift toward modern art and personal perception.',
      },
    ],
    quiz: [
      {
        id: 'imp-q1',
        question: 'Impressionists emphasized…',
        options: [
          'Strict religious scenes only',
          'Light, atmosphere, and momentary perception',
          'Photorealistic portraits of kings',
          'Abstract geometry exclusively',
        ],
        correctIndex: 1,
        explanation: 'Capturing light and moment was central to Impressionism.',
      },
    ],
  },
];

export function getLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function getLessonsByTopic(topicId: string) {
  return lessons.filter((lesson) => lesson.topicId === topicId);
}

export function getRecommendedLesson(completedIds: string[]) {
  return lessons.find((lesson) => !completedIds.includes(lesson.id)) ?? lessons[0];
}
