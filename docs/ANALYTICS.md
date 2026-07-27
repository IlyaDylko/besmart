# BeSmart — Product Analytics

**Status:** P0 schema + Meta App Events sink (Firebase Analytics deferred — `docs/FIREBASE.md`)  
**Implementation:** `src/services/analytics.ts`  
**Firebase setup (later):** `docs/FIREBASE.md`  
**Meta setup:** `docs/META_EVENTS.md`  
**ATT / IDFA:** `docs/ATT.md`

**SDK:** `react-native-fbsdk-next` in native builds when Meta credentials exist; always `__DEV__` console. Firebase (RNFB) not installed until paid UA. iOS ATT via `expo-tracking-transparency`.

---

## Naming convention

| Rule | Example |
|------|---------|
| Event names: **snake_case** | `idea_opened` |
| Prefer **noun_past_tense** for completed actions | `lesson_completed`, `paywall_viewed` |
| Prefer **noun_present** / open verbs for lifecycle | `app_open`, `idea_opened` |
| Properties: **snake_case** | `book_id`, `is_first_completion` |
| IDs as strings | `"atomic_habits"` |
| Booleans prefixed with `is_` / `has_` | `is_first_completion` |
| Sources / methods as string enums | `source: "discover" \| "book"` |
| No PII (email, name, device id) | — |
| No ad-hoc synonyms | `paywall_viewed`, not `view_paywall` |

### Prefix groups

| Prefix | Meaning |
|--------|---------|
| `app_` | App lifecycle |
| `onboarding_` | First-run funnel |
| `paywall_` / `trial_` / `purchase_` | Monetization |
| `idea_` | Book idea feed |
| `book_` | Book hub |
| `lesson_` | Lesson player |

---

## Event catalog

| Event | When | Required props | Optional props |
|-------|------|----------------|----------------|
| `app_open` | Store hydrated, app UI mounts | — | — |
| `onboarding_started` | Welcome screen mounts | — | — |
| `onboarding_goal_selected` | User continues with a goal | `goal` | — |
| `paywall_viewed` | Paywall screen mounts | `source` | — |
| `trial_started` | User taps “Start free trial” / RC trial | `source` | `plan`, `is_placeholder` |
| `purchase_success` | Real IAP success (RevenueCat later) | `source` | `plan`, `product_id` |
| `onboarding_completed` | Leaves onboarding (paid or skip) | `method` | `goal` |
| `idea_opened` | Idea feed opens for an idea | `book_id`, `idea_id` | `source` |
| `idea_completed` | Idea marked complete (first time) | `book_id`, `idea_id` | — |
| `book_opened` | Book hub mounts | `book_id` | — |
| `lesson_started` | Lesson player mounts | `lesson_id` | `topic_id` |
| `lesson_completed` | Lesson finished | `lesson_id`, `xp_earned` | `is_first_completion`, `topic_id` |

### Prop enums

```ts
source (paywall):  'onboarding' | 'profile' | 'today' | 'unknown'
source (idea):     'discover' | 'book'
method:            'subscribed' | 'skipped'
goal:              'curiosity' | 'career' | 'memory' | 'conversation' | 'habit'
```

---

## Funnel

```
app_open
  → onboarding_started
  → onboarding_goal_selected
  → paywall_viewed
  → trial_started | onboarding_completed (skipped)
  → idea_opened → idea_completed
  → book_opened
  → lesson_started → lesson_completed
```

---

## Implementation

| Layer | Responsibility |
|-------|----------------|
| `src/services/analytics.ts` | Typed `track()`, Meta (+ console) sinks via `initAnalytics()` |
| Screens | View / open events (`*_viewed`, `*_opened`, `*_started`) |
| `userStore` | Durable outcomes (`*_completed`, `trial_started` via `subscribe`) |
| `docs/FIREBASE.md` | How to re-add GA4 / RNFB later |

### Adding an event

1. Add name + props to `AnalyticsEventMap` in `analytics.ts`
2. Add a row to this catalog
3. Call `track('event_name', props)` at one best hook site
4. Prefer store methods for outcomes multiple screens can trigger

### Sink behavior

| Environment | Destination |
|-------------|-------------|
| Native build + Meta App ID/token | Meta App Events (Events Manager) |
| `__DEV__` | Always also `console.log` |
| Expo Go / missing Meta native module | Console only |
| Firebase / GA4 | **Deferred** — see `docs/FIREBASE.md` |

## Do not

- Double-fire completions from UI if the store already tracks them
- Rename events after Meta Ads mapping without a migration note
- Log full slide / quiz answer text
