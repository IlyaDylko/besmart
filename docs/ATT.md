# ATT (iOS) & strategy without IDFA

**Task:** P1-3  
**SDK:** `expo-tracking-transparency`  
**Runtime:** `src/services/att.ts` → Meta `Settings.setAdvertiserTrackingEnabled`

---

## What we do

1. After onboarding, when the user lands on tabs, request **App Tracking Transparency** once if status is still `undetermined`.
2. Sync the result to Meta:
   - **Allow** → `setAdvertiserTrackingEnabled(true)` (IDFA may be used for ad matching)
   - **Ask App Not to Track** / unavailable → `false` (events still fire; no IDFA)
3. Product features are **never** gated on ATT.

Usage string (`NSUserTrackingUsageDescription`) is set via the Expo config plugin in `app.config.js`.

---

## Strategy without IDFA

Most users will deny ATT or have “Allow Apps to Request to Track” off. Ads and product analytics must still work.

| Layer | Without IDFA | With ATT granted |
|-------|--------------|------------------|
| **Meta App Events** | Custom + standard events still send (as today in Overview) | Better device matching / ATE True rate |
| **Firebase GA4** | Kept on `withoutAdIdSupport: true` — product funnel does not need IDFA | Unchanged (no AdSupport dependency) |
| **Paid install attribution** | Rely on **SKAdNetwork** / Aggregated Event Measurement + first-party events (P1-1) | Plus IDFA where Apple allows |
| **MMP** (optional later) | Same: events + SKAN postbacks | Enrich when consented |

**Do not:** block Meta event logging when ATT is denied — we already verified events arrive with ATE off.

---

## Rebuild required

ATT / `NSUserTrackingUsageDescription` / Meta `advertiserIDCollectionEnabled` are native:

```bash
npx expo prebuild --clean
npx expo run:ios --device
```

Simulator often returns null IDFA even when granted; test on a **physical iPhone**.

---

## How to verify

1. Reset ATT for the app: delete BeSmart from the phone (or Settings → Privacy → Tracking).
2. Complete onboarding → enter Ideas.
3. System dialog should appear (~1s after tabs).
4. Metro: `[att] tracking consent granted|denied` and `[analytics] Meta advertiserTrackingEnabled= true|false`.
5. Events Manager Overview should still receive events either way.

---

## Out of scope

- Soft pre-prompt UI before the system dialog (can raise opt-in later)
- Full SKAN / MMP plan → P1-1
- Firebase Ad ID / AdSupport → not needed for product analytics
