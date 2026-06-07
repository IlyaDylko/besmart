import type { Topic } from '@/types/learning';

export const topics: Topic[] = [
  {
    id: 'history',
    title: 'History',
    emoji: '🏛️',
    color: '#E8A838',
    description: 'Events, civilizations, and turning points',
    lessonCount: 3,
  },
  {
    id: 'science',
    title: 'Science',
    emoji: '🔬',
    color: '#4ECDC4',
    description: 'Biology, physics, and how the world works',
    lessonCount: 2,
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    emoji: '🤔',
    color: '#9B59B6',
    description: 'Big questions and clear thinking',
    lessonCount: 2,
  },
  {
    id: 'psychology',
    title: 'Psychology',
    emoji: '🧠',
    color: '#FF7A50',
    description: 'Mind, behavior, and everyday decisions',
    lessonCount: 2,
  },
  {
    id: 'art',
    title: 'Art',
    emoji: '🎨',
    color: '#E056FD',
    description: 'Movements, artists, and visual culture',
    lessonCount: 1,
  },
];

export function getTopic(id: string) {
  return topics.find((topic) => topic.id === id);
}
