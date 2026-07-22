/**
 * Product analytics facade → Firebase Analytics (GA4) when native module is present.
 * Schema + naming: docs/ANALYTICS.md
 * Setup: docs/FIREBASE.md
 */

import { NativeModules, Platform } from 'react-native';

export type PaywallSource = 'onboarding' | 'profile' | 'today' | 'unknown';
export type IdeaOpenSource = 'discover' | 'book';
export type OnboardingMethod = 'subscribed' | 'skipped';

export type AnalyticsEventMap = {
  app_open: Record<string, never>;
  onboarding_started: Record<string, never>;
  onboarding_goal_selected: { goal: string };
  paywall_viewed: { source: PaywallSource };
  trial_started: {
    source: PaywallSource;
    plan?: string;
    is_placeholder?: boolean;
  };
  purchase_success: {
    source: PaywallSource;
    plan?: string;
    product_id?: string;
  };
  onboarding_completed: {
    method: OnboardingMethod;
    goal?: string | null;
  };
  idea_opened: {
    book_id: string;
    idea_id: string;
    source: IdeaOpenSource;
  };
  idea_completed: {
    book_id: string;
    idea_id: string;
  };
  book_opened: { book_id: string };
  lesson_started: {
    lesson_id: string;
    topic_id?: string;
  };
  lesson_completed: {
    lesson_id: string;
    xp_earned: number;
    is_first_completion: boolean;
    topic_id?: string;
  };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;

type AnalyticsParams = Record<string, string | number | boolean>;

type AnalyticsSink = <E extends AnalyticsEvent>(
  event: E,
  properties: AnalyticsEventMap[E],
) => void;

/** GA4 rejects null/undefined; keep only string | number | boolean. */
function sanitizeParams(properties: object): AnalyticsParams | undefined {
  const out: AnalyticsParams = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'boolean') {
      // GA4 custom dims often easier as 0/1
      out[key] = value ? 1 : 0;
      continue;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

let sink: AnalyticsSink = (event, properties) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, properties);
  }
};

let initialized = false;

/** Replace sink (tests / alternate backends). */
export function setAnalyticsSink(next: AnalyticsSink) {
  sink = next;
  initialized = true;
}

/**
 * Wire Firebase Analytics when running in a native build with RNFB.
 * Safe in Expo Go — keeps console-only sink.
 */
export function initAnalytics() {
  if (initialized) return;

  const hasNativeFirebase =
    Platform.OS !== 'web' && NativeModules.RNFBAppModule != null;

  if (!hasNativeFirebase) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(
        '[analytics] Firebase native module missing (Expo Go or no config) — console only',
      );
    }
    initialized = true;
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {
      getAnalytics,
      logEvent,
    } = require('@react-native-firebase/analytics') as typeof import('@react-native-firebase/analytics');

    const analytics = getAnalytics();

    setAnalyticsSink((event, properties) => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[analytics] ${event}`, properties);
      }
      const params = sanitizeParams(properties as object);
      void logEvent(analytics, event, params).catch((error: unknown) => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[analytics] Firebase logEvent failed', event, error);
        }
      });
    });
  } catch (error) {
    initialized = true;
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] Failed to init Firebase Analytics', error);
    }
  }
}

export function track<E extends AnalyticsEvent>(
  event: E,
  ...args: AnalyticsEventMap[E] extends Record<string, never>
    ? [] | [AnalyticsEventMap[E]]
    : [AnalyticsEventMap[E]]
) {
  const properties = (args[0] ?? {}) as AnalyticsEventMap[E];
  sink(event, properties);
}

export function parsePaywallSource(value: string | undefined): PaywallSource {
  if (value === 'onboarding' || value === 'profile' || value === 'today') {
    return value;
  }
  return 'unknown';
}
