import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable } from 'mobx';
import { isHydrated, makePersistable } from 'mobx-persist-store';

import type { LearningGoal } from '@/types/learning';

class UserStore {
  hasCompletedOnboarding = false;
  isPremium = false;
  streak = 0;
  xp = 0;
  learningGoal: LearningGoal | null = null;
  completedLessonIds: string[] = [];
  completedIdeaIds: string[] = [];
  /** Books opened from the discover flow after reading an idea */
  readingBookIds: string[] = [];

  readonly dailyGoalMinutes = 10;
  readonly hydrationPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this, { dailyGoalMinutes: false, hydrationPromise: false }, { autoBind: true });

    this.hydrationPromise = makePersistable(this, {
      name: 'UserStore',
      properties: [
        'hasCompletedOnboarding',
        'isPremium',
        'streak',
        'xp',
        'learningGoal',
        'completedLessonIds',
        'completedIdeaIds',
        'readingBookIds',
      ],
      storage: AsyncStorage,
    }).then(() => undefined);
  }

  get isStoreHydrated() {
    return isHydrated(this);
  }

  setLearningGoal(goal: LearningGoal) {
    this.learningGoal = goal;
  }

  completeOnboarding() {
    this.hasCompletedOnboarding = true;
  }

  subscribe() {
    this.isPremium = true;
    this.hasCompletedOnboarding = true;
  }

  completeLesson(lessonId: string, xpEarned: number) {
    if (!this.completedLessonIds.includes(lessonId)) {
      this.completedLessonIds = [...this.completedLessonIds, lessonId];
    }
    this.xp += xpEarned;
    this.streak += 1;
  }

  completeIdea(bookId: string, ideaId: string) {
    const key = `${bookId}:${ideaId}`;
    if (!this.completedIdeaIds.includes(key)) {
      this.completedIdeaIds = [...this.completedIdeaIds, key];
    }
  }

  openBookFromIdea(bookId: string) {
    const filtered = this.readingBookIds.filter((id) => id !== bookId);
    this.readingBookIds = [bookId, ...filtered];
  }

  resetProgress() {
    this.hasCompletedOnboarding = false;
    this.isPremium = false;
    this.streak = 0;
    this.xp = 0;
    this.learningGoal = null;
    this.completedLessonIds = [];
    this.completedIdeaIds = [];
    this.readingBookIds = [];
  }
}

export const userStore = new UserStore();
