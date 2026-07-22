import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable } from 'mobx';
import { isHydrated, makePersistable } from 'mobx-persist-store';

import { track, type PaywallSource } from '@/services/analytics';
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
    track('onboarding_goal_selected', { goal });
  }

  completeOnboarding() {
    if (this.hasCompletedOnboarding) {
      return;
    }
    this.hasCompletedOnboarding = true;
    track('onboarding_completed', {
      method: 'skipped',
      goal: this.learningGoal,
    });
  }

  subscribe(options?: { source?: PaywallSource; plan?: string }) {
    const wasOnboarding = !this.hasCompletedOnboarding;
    this.isPremium = true;
    this.hasCompletedOnboarding = true;
    track('trial_started', {
      source: options?.source ?? 'unknown',
      plan: options?.plan,
      is_placeholder: true,
    });
    if (wasOnboarding) {
      track('onboarding_completed', {
        method: 'subscribed',
        goal: this.learningGoal,
      });
    }
  }

  completeLesson(lessonId: string, xpEarned: number) {
    const isFirst = !this.completedLessonIds.includes(lessonId);
    if (isFirst) {
      this.completedLessonIds = [...this.completedLessonIds, lessonId];
    }
    this.xp += xpEarned;
    this.streak += 1;
    track('lesson_completed', {
      lesson_id: lessonId,
      xp_earned: xpEarned,
      is_first_completion: isFirst,
    });
  }

  completeIdea(bookId: string, ideaId: string) {
    const key = `${bookId}:${ideaId}`;
    if (this.completedIdeaIds.includes(key)) {
      return;
    }
    this.completedIdeaIds = [...this.completedIdeaIds, key];
    track('idea_completed', { book_id: bookId, idea_id: ideaId });
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
