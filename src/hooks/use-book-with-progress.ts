import { useMemo } from 'react';

import { useApp } from '@/context/app-context';
import { applyBookProgress, getBook } from '@/data/books';

export function useBookWithProgress(bookId: string) {
  const { completedIdeaIds, completeIdea } = useApp();

  const book = useMemo(() => {
    const base = getBook(bookId);
    return base ? applyBookProgress(base, completedIdeaIds) : undefined;
  }, [bookId, completedIdeaIds]);

  return { book, completedIdeaIds, completeIdea };
}
