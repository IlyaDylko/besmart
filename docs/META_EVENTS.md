# Meta App Events / Events Manager

**Task:** P1-2 — Meta Events Manager: app, install, key events  
**SDK:** `react-native-fbsdk-next` (wired through `src/services/analytics.ts`)  
**Product events:** same catalog as `docs/ANALYTICS.md`

Install / `fb_mobile_activate_app` is auto-logged by the Meta SDK when `autoLogAppEventsEnabled: true`.

---

## What you do in Meta (required)

### 1. Create a Meta app

1. Open [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App**.
2. Use type suited for ads / consumer app (e.g. **Other** → **Consumer**, or **Business**).
3. Name: **BeSmart**.

### 2. Turn on App Events

1. In the app dashboard: **Add Product** → **App Events** (or open **Events Manager** from Meta Business Suite).
2. Settings → **Basic**:
   - Copy **App ID**
   - **Show** → copy **Client Token** (required for `react-native-fbsdk-next`)

### 3. Add platforms (same bundle as the app)

| Platform | Value |
|----------|--------|
| iOS Bundle ID | `com.besmart.app` |
| Android Package | `com.besmart.app` |

- iOS: add Bundle ID under Settings → Basic → iOS.
- Android: Package name `com.besmart.app`. Key hashes can wait until Play signing; for debug you can add a debug key hash later if Events Manager asks.

### 4. Put credentials in the repo root `.env`

```bash
EXPO_PUBLIC_FACEBOOK_APP_ID=your_app_id
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=your_client_token
```

(`.env` is local — do not commit secrets if you treat the client token as sensitive; App ID is public-ish.)

### 5. Rebuild the native app

Meta SDK needs a **dev client rebuild** (Expo Go will not work):

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

### 6. Verify in Events Manager

1. [Events Manager](https://business.facebook.com/events_manager) → select your dataset / app.
2. Open **Test Events** (or Overview → recent).
3. Use the app: open, onboarding, paywall, complete an idea.
4. Within ~1 minute you should see:
   - `fb_mobile_activate_app` / install-related (auto)
   - custom: `app_open`, `onboarding_started`, `paywall_viewed`, …
   - standard: `fb_mobile_complete_registration`, `StartTrial`, `fb_mobile_initiated_checkout`, `fb_mobile_content_view`, …

Mark key events for ads later: **StartTrial**, **Subscribe** / purchase, **CompleteRegistration**, and optionally `idea_completed`.

---

## What the app already does

| Layer | Behavior |
|-------|----------|
| `track()` | Fans out to Firebase GA4 **and** Meta when SDKs are present |
| Custom events | Same snake_case names as `docs/ANALYTICS.md` |
| Standard Meta events | Mapped from key funnel steps (see below) |
| ATT / IDFA | **Off for now** (`advertiserIDCollectionEnabled: false`) until P1-3 |

### Standard event mapping

| Product event | Meta standard (when available) |
|---------------|--------------------------------|
| `onboarding_completed` | Completed Registration |
| `paywall_viewed` | Initiated Checkout |
| `trial_started` | Start Trial (fallback: Subscribe) |
| `purchase_success` | Subscribe (+ `logPurchase` later with RevenueCat amount) |
| `idea_opened` / `book_opened` / `lesson_started` | Viewed Content |
| `idea_completed` / `lesson_completed` | Achieved Level |
| `app_open` | Custom (+ SDK auto activate) |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Metro: `Meta SDK missing` | No `.env` credentials and/or no rebuild after adding plugin |
| Events Manager empty | Wait 1–15 min; use **Test Events**; confirm App ID matches `.env` |
| iOS no events | Rebuild with `GoogleService` + Meta plugin; check scheme `fb{APP_ID}` |
| Android package rejected in Meta UI | App not on Play yet is OK for development; still set package name |

---

## Out of scope here (later)

- P1-1 MMP / full SKAN plan  
- P1-3 ATT prompt + `setAdvertiserTrackingEnabled(true)` when allowed  
- P1-4 RevenueCat → purchase value / `logPurchase(amount, 'USD')`
