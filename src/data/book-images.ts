import type { ImageSourcePropType } from 'react-native';

/**
 * Static image map for book covers and slide illustrations.
 *
 * Add files under assets/images/books/{bookId}/ and register them here:
 *   cover.png          -> BOOK_COVERS.atomic_habits
 *   idea-0-slide-0.png -> SLIDE_IMAGES['atomic_habits:0:0']
 *
 * Generate images with AI (see docs in README or use generate_content.py extension),
 * then run: npx expo start --clear
 */
export const BOOK_COVERS: Partial<Record<string, ImageSourcePropType>> = {
  // atomic_habits: require('@/assets/images/books/atomic_habits/cover.png'),
};

export const SLIDE_IMAGES: Partial<Record<string, ImageSourcePropType>> = {
  // 'atomic_habits:0:0': require('@/assets/images/books/atomic_habits/idea-0-slide-0.png'),
};

export function getBookCoverImage(bookId: string): ImageSourcePropType | undefined {
  return BOOK_COVERS[bookId];
}

export function resolveSlideImage(imageKey?: string): ImageSourcePropType | undefined {
  if (!imageKey) return undefined;
  return SLIDE_IMAGES[imageKey];
}
