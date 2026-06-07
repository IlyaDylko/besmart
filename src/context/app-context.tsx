import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { LearningGoal } from '@/types/learning';

type AppContextValue = {
  hasCompletedOnboarding: boolean;
  isPremium: boolean;
  streak: number;
  xp: number;
  dailyGoalMinutes: number;
  learningGoal: LearningGoal | null;
  completedLessonIds: string[];
  setLearningGoal: (goal: LearningGoal) => void;
  completeOnboarding: () => void;
  subscribe: () => void;
  completeLesson: (lessonId: string, xpEarned: number) => void;
  resetProgress: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [learningGoal, setLearningGoal] = useState<LearningGoal | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const value = useMemo<AppContextValue>(
    () => ({
      hasCompletedOnboarding,
      isPremium,
      streak,
      xp,
      dailyGoalMinutes: 10,
      learningGoal,
      completedLessonIds,
      setLearningGoal: (goal) => {
        setLearningGoal(goal);
      },
      completeOnboarding: () => {
        setHasCompletedOnboarding(true);
      },
      subscribe: () => {
        setIsPremium(true);
        setHasCompletedOnboarding(true);
      },
      completeLesson: (lessonId, xpEarned) => {
        setCompletedLessonIds((current) =>
          current.includes(lessonId) ? current : [...current, lessonId],
        );
        setXp((current) => current + xpEarned);
        setStreak((current) => current + 1);
      },
      resetProgress: () => {
        setHasCompletedOnboarding(false);
        setIsPremium(false);
        setStreak(0);
        setXp(0);
        setLearningGoal(null);
        setCompletedLessonIds([]);
      },
    }),
    [completedLessonIds, hasCompletedOnboarding, isPremium, learningGoal, streak, xp],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
