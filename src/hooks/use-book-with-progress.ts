import { useApp } from '@/context/app-context';
import { applyBookProgress, getBook } from '@/data/books';

export function useBookWithProgress(bookId: string) {
  const { completedIdeaIds, completeIdea } = useApp();
  const base = getBook(bookId);
  const book = base ? applyBookProgress(base, completedIdeaIds) : undefined;

  return { book, completedIdeaIds, completeIdea };
}
