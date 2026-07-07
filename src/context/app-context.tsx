import { observer } from 'mobx-react-lite';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { userStore } from '@/stores/user-store';
import type { LearningGoal } from '@/types/learning';

type AppContextValue = {
  hasCompletedOnboarding: boolean;
  isPremium: boolean;
  streak: number;
  xp: number;
  dailyGoalMinutes: number;
  learningGoal: LearningGoal | null;
  completedLessonIds: string[];
  completedIdeaIds: string[];
  readingBookIds: string[];
  setLearningGoal: (goal: LearningGoal) => void;
  completeOnboarding: () => void;
  subscribe: () => void;
  completeLesson: (lessonId: string, xpEarned: number) => void;
  completeIdea: (bookId: string, ideaId: string) => void;
  openBookFromIdea: (bookId: string) => void;
  resetProgress: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const AppProviderInner = observer(function AppProviderInner({ children }: { children: ReactNode }) {
  const value: AppContextValue = {
    hasCompletedOnboarding: userStore.hasCompletedOnboarding,
    isPremium: userStore.isPremium,
    streak: userStore.streak,
    xp: userStore.xp,
    dailyGoalMinutes: userStore.dailyGoalMinutes,
    learningGoal: userStore.learningGoal,
    completedLessonIds: userStore.completedLessonIds,
    completedIdeaIds: userStore.completedIdeaIds,
    readingBookIds: userStore.readingBookIds,
    setLearningGoal: userStore.setLearningGoal,
    completeOnboarding: userStore.completeOnboarding,
    subscribe: userStore.subscribe,
    completeLesson: userStore.completeLesson,
    completeIdea: userStore.completeIdea,
    openBookFromIdea: userStore.openBookFromIdea,
    resetProgress: userStore.resetProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(userStore.isStoreHydrated);

  useEffect(() => {
    if (userStore.isStoreHydrated) {
      return;
    }

    let cancelled = false;
    userStore.hydrationPromise.then(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <AppProviderInner>{children}</AppProviderInner>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
