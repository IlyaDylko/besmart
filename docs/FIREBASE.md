# Firebase Analytics (GA4) — deferred

**Status:** Removed from the app for now (`@react-native-firebase/*` not installed).  
Product events still flow through `track()` → Meta App Events + `__DEV__` console.  
**Re-enable before Google App campaigns / paid UA** (or switch to an MMP — see `docs/RELEASE_READINESS.md` P1-1).

## Why it was removed

React Native Firebase requires iOS `useFrameworks: 'static'`, which frequently broke Expo prebuild alongside Meta SDK and other pods. We keep the event schema and Meta sink; Firebase can come back when ads need it.

## How to re-enable (checklist)

1. Install:
   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/analytics expo-build-properties
   ```
2. Add config files at repo root (gitignored):
   - `GoogleService-Info.plist` (iOS)
   - `google-services.json` (Android)
3. Restore in `app.config.js`:
   - `ios.googleServicesFile` / `android.googleServicesFile` when files exist
   - plugins: `@react-native-firebase/app`, `@react-native-firebase/analytics` (`withoutAdIdSupport: true`)
   - `expo-build-properties` with `useFrameworks: 'static'` and `forceStaticLinking: ['RNFBApp', 'RNFBAnalytics']`
4. In `src/services/analytics.ts` `initAnalytics()`: add the Firebase sink again (guard on `NativeModules.RNFBAppModule`, `logEvent` from `@react-native-firebase/analytics`).
5. Rebuild native:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios   # or android / EAS
   ```
6. Verify GA4 Realtime / DebugView (same as before).

Official Expo notes: https://docs.expo.dev/guides/using-firebase/  
RNFB Expo section: https://rnfirebase.io/#expo

## Event flow (when re-enabled)

```
track('idea_opened', props)
  → analytics sinks
  → Meta App Events (if configured)
  → @react-native-firebase/analytics logEvent(GA4)
```

Booleans are sent as `0` / `1`. Catalog: `docs/ANALYTICS.md`.

## Notes

- iOS Analytics should use **`withoutAdIdSupport: true`** (product funnel without IDFA). Meta ads use ATT separately — see `docs/ATT.md`.
- Expo Go will never include RNFB — need a development / production build.
- Expect iOS build friction with static frameworks; pin RNFB + Expo versions and prefer `prebuild --clean`.
