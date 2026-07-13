import type { ImageSourcePropType } from 'react-native';

/**
 * Static image map for book covers and slide illustrations.
 *
 * Add files under assets/images/books/{bookId}/ and register them here:
 *   cover.png          -> BOOK_COVERS.atomic_habits
 *   idea-0.png         -> SLIDE_IMAGES['atomic_habits:0']  (first slide of selected idea only)
 *
 * Generate images with AI (see docs in README or use generate_content.py extension),
 * then run: npx expo start --clear
 */
export const BOOK_COVERS: Partial<Record<string, ImageSourcePropType>> = {
  atomic_habits: require('@/assets/images/books/atomic_habits/cover.png'),
  power_of_habit: require('@/assets/images/books/power_of_habit/cover.png'),
  deep_work: require('@/assets/images/books/deep_work/cover.png'),
  seven_habits: require('@/assets/images/books/seven_habits/cover.png'),
  eat_that_frog: require('@/assets/images/books/eat_that_frog/cover.png'),
  psychology_of_money: require('@/assets/images/books/psychology_of_money/cover.png'),
  rich_dad_poor_dad: require('@/assets/images/books/rich_dad_poor_dad/cover.png'),
  richest_man_babylon: require('@/assets/images/books/richest_man_babylon/cover.png'),
  think_and_grow_rich: require('@/assets/images/books/think_and_grow_rich/cover.png'),
  thinking_fast_slow: require('@/assets/images/books/thinking_fast_slow/cover.png'),
  influence: require('@/assets/images/books/influence/cover.png'),
  mindset: require('@/assets/images/books/mindset/cover.png'),
  emotional_intelligence: require('@/assets/images/books/emotional_intelligence/cover.png'),
  predictably_irrational: require('@/assets/images/books/predictably_irrational/cover.png'),
  lean_startup: require('@/assets/images/books/lean_startup/cover.png'),
  zero_to_one: require('@/assets/images/books/zero_to_one/cover.png'),
  good_to_great: require('@/assets/images/books/good_to_great/cover.png'),
  four_hour_workweek: require('@/assets/images/books/four_hour_workweek/cover.png'),
  start_with_why: require('@/assets/images/books/start_with_why/cover.png'),
  high_output_management: require('@/assets/images/books/high_output_management/cover.png'),
  breakneck_chinas_quest_to_engineer_the_future: require('@/assets/images/books/breakneck_chinas_quest_to_engineer_the_future/cover.png'),
  win_friends: require('@/assets/images/books/win_friends/cover.png'),
  never_split_difference: require('@/assets/images/books/never_split_difference/cover.png'),
  crucial_conversations: require('@/assets/images/books/crucial_conversations/cover.png'),
  subtle_art: require('@/assets/images/books/subtle_art/cover.png'),
  cant_hurt_me: require('@/assets/images/books/cant_hurt_me/cover.png'),
  mans_search_meaning: require('@/assets/images/books/mans_search_meaning/cover.png'),
  power_of_now: require('@/assets/images/books/power_of_now/cover.png'),
  ikigai: require('@/assets/images/books/ikigai/cover.png'),
  daring_greatly: require('@/assets/images/books/daring_greatly/cover.png'),
  compound_effect: require('@/assets/images/books/compound_effect/cover.png'),
  grit: require('@/assets/images/books/grit/cover.png'),
  thinking_in_bets: require('@/assets/images/books/thinking_in_bets/cover.png'),
  superforecasting: require('@/assets/images/books/superforecasting/cover.png'),
  antifragile: require('@/assets/images/books/antifragile/cover.png'),
  great_mental_models: require('@/assets/images/books/great_mental_models/cover.png'),
  poor_charlies_almanack: require('@/assets/images/books/poor_charlies_almanack/cover.png'),
  decisive: require('@/assets/images/books/decisive/cover.png'),
  why_nations_fail: require('@/assets/images/books/why_nations_fail/cover.png'),
};

export const SLIDE_IMAGES: Partial<Record<string, ImageSourcePropType>> = {
  'antifragile:3': require('@/assets/images/books/antifragile/idea-3.png'),
  'atomic_habits:0': require('@/assets/images/books/atomic_habits/idea-0.png'),
  'cant_hurt_me:2': require('@/assets/images/books/cant_hurt_me/idea-2.png'),
  'compound_effect:0': require('@/assets/images/books/compound_effect/idea-0.png'),
  'crucial_conversations:0': require('@/assets/images/books/crucial_conversations/idea-0.png'),
  'daring_greatly:0': require('@/assets/images/books/daring_greatly/idea-0.png'),
  'decisive:0': require('@/assets/images/books/decisive/idea-0.png'),
  'deep_work:0': require('@/assets/images/books/deep_work/idea-0.png'),
  'eat_that_frog:4': require('@/assets/images/books/eat_that_frog/idea-4.png'),
  'emotional_intelligence:0': require('@/assets/images/books/emotional_intelligence/idea-0.png'),
  'four_hour_workweek:0': require('@/assets/images/books/four_hour_workweek/idea-0.png'),
  'good_to_great:6': require('@/assets/images/books/good_to_great/idea-6.png'),
  'great_mental_models:0': require('@/assets/images/books/great_mental_models/idea-0.png'),
  'grit:0': require('@/assets/images/books/grit/idea-0.png'),
  'high_output_management:0': require('@/assets/images/books/high_output_management/idea-0.png'),
  'ikigai:0': require('@/assets/images/books/ikigai/idea-0.png'),
  'influence:0': require('@/assets/images/books/influence/idea-0.png'),
  'lean_startup:6': require('@/assets/images/books/lean_startup/idea-6.png'),
  'mans_search_meaning:0': require('@/assets/images/books/mans_search_meaning/idea-0.png'),
  'mindset:5': require('@/assets/images/books/mindset/idea-5.png'),
  'never_split_difference:0': require('@/assets/images/books/never_split_difference/idea-0.png'),
  'poor_charlies_almanack:0': require('@/assets/images/books/poor_charlies_almanack/idea-0.png'),
  'power_of_habit:7': require('@/assets/images/books/power_of_habit/idea-7.png'),
  'power_of_now:0': require('@/assets/images/books/power_of_now/idea-0.png'),
  'predictably_irrational:0': require('@/assets/images/books/predictably_irrational/idea-0.png'),
  'psychology_of_money:0': require('@/assets/images/books/psychology_of_money/idea-0.png'),
  'rich_dad_poor_dad:0': require('@/assets/images/books/rich_dad_poor_dad/idea-0.png'),
  'richest_man_babylon:0': require('@/assets/images/books/richest_man_babylon/idea-0.png'),
  'seven_habits:3': require('@/assets/images/books/seven_habits/idea-3.png'),
  'start_with_why:4': require('@/assets/images/books/start_with_why/idea-4.png'),
  'subtle_art:1': require('@/assets/images/books/subtle_art/idea-1.png'),
  'superforecasting:5': require('@/assets/images/books/superforecasting/idea-5.png'),
  'think_and_grow_rich:0': require('@/assets/images/books/think_and_grow_rich/idea-0.png'),
  'thinking_fast_slow:3': require('@/assets/images/books/thinking_fast_slow/idea-3.png'),
  'thinking_in_bets:0': require('@/assets/images/books/thinking_in_bets/idea-0.png'),
  'win_friends:0': require('@/assets/images/books/win_friends/idea-0.png'),
  'zero_to_one:4': require('@/assets/images/books/zero_to_one/idea-4.png'),
};

export function getBookCoverImage(bookId: string): ImageSourcePropType | undefined {
  return BOOK_COVERS[bookId];
}

export function resolveSlideImage(imageKey?: string): ImageSourcePropType | undefined {
  if (!imageKey) return undefined;
  return SLIDE_IMAGES[imageKey];
}
