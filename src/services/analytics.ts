/**
 * Product analytics facade → Firebase Analytics (GA4) + Meta App Events.
 * Schema: docs/ANALYTICS.md · Meta setup: docs/META_EVENTS.md · Firebase: docs/FIREBASE.md
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

type AnalyticsParams = Record<string, string | number>;

type AnalyticsSink = <E extends AnalyticsEvent>(
  event: E,
  properties: AnalyticsEventMap[E],
) => void;

/** GA4 / Meta reject null; booleans → 0/1. */
function sanitizeParams(properties: object): AnalyticsParams | undefined {
  const out: AnalyticsParams = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'boolean') {
      out[key] = value ? 1 : 0;
      continue;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const sinks: AnalyticsSink[] = [];

function defaultDevSink(event: string, properties: object) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, properties);
  }
}

/** Replace all sinks (tests). Prefer addAnalyticsSink for production backends. */
export function setAnalyticsSink(next: AnalyticsSink) {
  sinks.length = 0;
  sinks.push(next);
  initialized = true;
}

export function addAnalyticsSink(next: AnalyticsSink) {
  sinks.push(next);
  initialized = true;
}

let initialized = false;
let metaReady = false;

type MetaLogger = {
  logEvent: (name: string, params?: Record<string, string | number>) => void;
  logPurchase: (
    amount: number,
    currency: string,
    params?: Record<string, string | number>,
  ) => void;
  AppEvents?: {
    CompletedRegistration?: string;
    InitiatedCheckout?: string;
    ViewedContent?: string;
    StartTrial?: string;
    Subscribe?: string;
    AchievedLevel?: string;
  };
  AppEventParams?: {
    ContentType?: string;
    ContentID?: string;
    RegistrationMethod?: string;
  };
};

type MetaSettings = {
  initializeSDK?: () => void;
  setAdvertiserTrackingEnabled?: (enabled: boolean) => void;
};

let metaSettings: MetaSettings | null = null;

function getMetaLogger(): MetaLogger | null {
  if (Platform.OS === 'web') return null;
  if (NativeModules.FBAppEventsLogger == null) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-fbsdk-next') as {
      AppEventsLogger: MetaLogger;
      Settings?: MetaSettings;
    };
    metaSettings = mod.Settings ?? null;
    mod.Settings?.initializeSDK?.();
    // Default off until ATT sync (see `setMetaAdvertiserTrackingEnabled` / docs/ATT.md).
    mod.Settings?.setAdvertiserTrackingEnabled?.(false);
    return mod.AppEventsLogger;
  } catch {
    return null;
  }
}

/** Call after ATT grant/deny so Meta knows whether IDFA matching is allowed. */
export function setMetaAdvertiserTrackingEnabled(enabled: boolean) {
  try {
    if (!metaSettings) {
      getMetaLogger();
    }
    metaSettings?.setAdvertiserTrackingEnabled?.(enabled);
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[analytics] Meta advertiserTrackingEnabled=', enabled);
    }
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] setAdvertiserTrackingEnabled failed', error);
    }
  }
}

/**
 * Map product events → Meta standard events (for Ads optimization)
 * while always also logging the custom snake_case name.
 */
function logMetaEvent<E extends AnalyticsEvent>(
  logger: MetaLogger,
  event: E,
  properties: AnalyticsEventMap[E],
) {
  const params = sanitizeParams(properties as object);
  // Always send our catalog name as a custom event (Events Manager).
  logger.logEvent(event, params);

  const AppEvents = logger.AppEvents ?? {};
  const AppEventParams = logger.AppEventParams ?? {};

  switch (event) {
    case 'onboarding_started':
      // custom only
      break;
    case 'onboarding_goal_selected':
      break;
    case 'onboarding_completed': {
      const props = properties as AnalyticsEventMap['onboarding_completed'];
      if (AppEvents.CompletedRegistration) {
        logger.logEvent(AppEvents.CompletedRegistration, {
          ...(AppEventParams.RegistrationMethod
            ? { [AppEventParams.RegistrationMethod]: props.method }
            : { registration_method: props.method }),
        });
      }
      break;
    }
    case 'paywall_viewed':
      if (AppEvents.InitiatedCheckout) {
        logger.logEvent(AppEvents.InitiatedCheckout, params);
      }
      break;
    case 'trial_started':
      if (AppEvents.StartTrial) {
        logger.logEvent(AppEvents.StartTrial, params);
      } else if (AppEvents.Subscribe) {
        logger.logEvent(AppEvents.Subscribe, params);
      }
      break;
    case 'purchase_success':
      // Amount unknown until RevenueCat — log Subscribe standard + custom.
      if (AppEvents.Subscribe) {
        logger.logEvent(AppEvents.Subscribe, params);
      }
      break;
    case 'idea_opened':
    case 'book_opened':
    case 'lesson_started': {
      if (AppEvents.ViewedContent) {
        const id =
          'book_id' in (properties as object)
            ? String((properties as { book_id?: string }).book_id ?? '')
            : 'lesson_id' in (properties as object)
              ? String((properties as { lesson_id?: string }).lesson_id ?? '')
              : '';
        logger.logEvent(AppEvents.ViewedContent, {
          ...(AppEventParams.ContentType
            ? { [AppEventParams.ContentType]: event.replace('_opened', '').replace('_started', '') }
            : { content_type: event }),
          ...(AppEventParams.ContentID && id
            ? { [AppEventParams.ContentID]: id }
            : id
              ? { content_id: id }
              : {}),
        });
      }
      break;
    }
    case 'idea_completed':
    case 'lesson_completed':
      if (AppEvents.AchievedLevel) {
        logger.logEvent(AppEvents.AchievedLevel, params);
      }
      break;
    default:
      break;
  }
}

/**
 * Wire Firebase + Meta when native modules exist.
 * Safe in Expo Go — console-only.
 */
export function initAnalytics() {
  if (initialized) return;
  initialized = true;

  // Always keep a DEV console line.
  sinks.push((event, properties) => {
    defaultDevSink(event, properties);
  });

  const hasNativeFirebase =
    Platform.OS !== 'web' && NativeModules.RNFBAppModule != null;

  if (hasNativeFirebase) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        getAnalytics,
        logEvent,
      } = require('@react-native-firebase/analytics') as typeof import('@react-native-firebase/analytics');

      const analytics = getAnalytics();
      sinks.push((event, properties) => {
        const params = sanitizeParams(properties as object);
        void logEvent(analytics, event, params).catch((error: unknown) => {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn('[analytics] Firebase logEvent failed', event, error);
          }
        });
      });
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[analytics] Failed to init Firebase Analytics', error);
      }
    }
  } else if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(
      '[analytics] Firebase native module missing (Expo Go or no config) — console only for GA4',
    );
  }

  const meta = getMetaLogger();
  if (meta) {
    metaReady = true;
    sinks.push((event, properties) => {
      try {
        logMetaEvent(meta, event, properties);
      } catch (error) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[analytics] Meta logEvent failed', event, error);
        }
      }
    });
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[analytics] Meta App Events sink ready');
    }
  } else if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(
      '[analytics] Meta SDK missing (no rebuild / no FACEBOOK_APP_ID) — skip Meta Events',
    );
  }
}

export function isMetaAnalyticsReady() {
  return metaReady;
}

export function track<E extends AnalyticsEvent>(
  event: E,
  ...args: AnalyticsEventMap[E] extends Record<string, never>
    ? [] | [AnalyticsEventMap[E]]
    : [AnalyticsEventMap[E]]
) {
  const properties = (args[0] ?? {}) as AnalyticsEventMap[E];
  if (sinks.length === 0) {
    defaultDevSink(event, properties as object);
    return;
  }
  for (const sink of sinks) {
    sink(event, properties);
  }
}

export function parsePaywallSource(value: string | undefined): PaywallSource {
  if (value === 'onboarding' || value === 'profile' || value === 'today') {
    return value;
  }
  return 'unknown';
}
