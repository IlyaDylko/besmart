# Firebase Analytics (GA4) setup

BeSmart sends product events through `src/services/analytics.ts` → **Firebase Analytics** when running in a **development / production native build**. Expo Go has no RNFB native module — events stay console-only there.

## 1. Create Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) → Create project (or use existing).
2. Enable **Google Analytics** when asked (GA4 property).
3. Add apps:
   - **iOS** bundle ID: `com.besmart.app`
   - **Android** package: `com.besmart.app`
4. Download config files into the **repo root**:
   - `GoogleService-Info.plist` (iOS)
   - `google-services.json` (Android)

`app.config.js` picks them up automatically when present.

## 2. Git

These files are gitignored (local / CI secrets via EAS file env). Copy onto each machine or inject in EAS Build:

```
google-services.json
GoogleService-Info.plist
```

## 3. Rebuild (required)

React Native Firebase needs native code — **Expo Go will not send to GA4**.

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

Or EAS development build after configs are in place.

## 4. Verify events

| Where | Notes |
|-------|--------|
| Metro console | Always logs `[analytics] event_name {…}` in `__DEV__` |
| Firebase **Realtime** | Analytics → Dashboard realtime (minutes delay) |
| GA4 **DebugView** | Best for development |

**Android DebugView:**

```bash
adb shell setprop debug.firebase.analytics.app com.besmart.app
```

**iOS DebugView:** Xcode scheme → Arguments → `-FIRDebugEnabled` (or `-FIRAnalyticsDebugEnabled`).

## 5. How events flow

```
track('idea_opened', props)
  → analytics sink
  → @react-native-firebase/analytics logEvent(GA4)
```

All catalog events in `docs/ANALYTICS.md` go to Firebase with the same names. Booleans are sent as `0` / `1`.

## 6. Notes

- iOS Analytics uses **`withoutAdIdSupport: true`** (no IDFA / ATT yet). Revisit when Meta Ads + ATT land.
- Automatic Firebase events (`first_open`, `session_start`, …) still fire in addition to our custom set.
- `purchase_success` is reserved for real IAP; placeholder trial uses `trial_started` with `is_placeholder: 1`.
