# BeSmart — Release Readiness & Task Plan

**Date:** July 21, 2026 · **Updated:** July 24, 2026  
**App version:** 1.0.0 (Expo 56)  
**Status:** prototype / soft-launch candidate — **not ready for scaled paid traffic**

### Done — July 22, 2026

| # | What |
|---|------|
| ✅ P0-6 | Product events wired (`track()`); Firebase Analytics (GA4) live on native iOS build |
| ✅ P0-7 | Event schema + naming: `docs/ANALYTICS.md` |
| ✅ — | Firebase setup docs: `docs/FIREBASE.md`; RNFirebase + `expo-dev-client` |
| ✅ P0-9 *(partial)* | Android `package` = `com.besmart.app` (icons/signing still open) |
| ✅ P0-10 *(partial)* | iOS/Android bundle = `com.besmart.app` (ASC / privacy strings still open) |
| ✅ P0-12 | Swept `summaries.json`: repaired `isn**t` / `It**s` apostrophe-bold artifacts |
| ✅ P0-13 | Fixed `format_summaries.py` (no longer bolds inside contractions); `--repair-only` |
| ✅ P0-14 | Fact-check scrubber: only real `flags[]` (kept `mans_search_meaning` quote issue) |
| ✅ P0-15 | Documented SoT: `src/data/summaries.json`; `whole_json_script/` = scratch + gitignored |

### Done — July 23, 2026

| # | What |
|---|------|
| ✅ P1-2 | Meta App Events live: `react-native-fbsdk-next`, Events Manager Overview receives events (e.g. View content); setup in `docs/META_EVENTS.md` |
| ✅ P1-3 | ATT prompt after onboarding + Meta ATE sync; strategy without IDFA in `docs/ATT.md` |
| ✅ — | Onboarding goals: sticky Continue footer (was untappable on device); splash overlay no longer steals taps |

### Done — July 24, 2026

| # | What |
|---|------|
| ✅ P2-1 | Store listing copy pack: name, subtitle, keywords, descriptions, shot/preview plan — `docs/STORE_LISTING.md` (screenshot/preview assets at submit) |
| ✅ P0-11 | Privacy Policy + Terms drafts (`docs/legal/`); linked from paywall + Profile; publish via GitHub Pages (see `docs/legal/README.md`) |
| ✅ — | Ideas feed: editorial cards + covers, daily ranking, Continue / impressions (`discover-feed`) — no per-idea AI art |
| ✅ — | Conspiracy category + Hancock / von Däniken books (catalog + summaries + covers) |
| ✅ P2-5 | Slide images for **all ideas** (~337): `scripts/generate_slide_images.py`, `SLIDE_IMAGES`, first-slide layout (scroll + image under title) |
| ✅ — | Longer slides: STYLE_PROMPT **4–6 sentences**/screen; regenerated *Fingerprints of the Gods* |
| ✅ — | Reading now: books appear from idea open/complete + progress inference (not only “Open book”) |
| ✅ — | Library search by title / author |

---

## Readiness scorecard

| Area | Score | Notes |
|------|-------|-------|
| Product & UX | **7.5/10** | Ideas ranking, Library search, Reading now, slide chrome — OK for beta; still demo paywall / reset |
| Content (volume) | **8.5/10** | ~44 books + conspiracy set; lessons still secondary |
| Content (QA) | **6.5/10** | ✅ Apostrophe/flags; ✅ slide art shipped; idea **titles/copy** still not final (P1-9) |
| Monetization | **2/10** | Paywall is a placeholder, no IAP |
| Analytics & attribution | **7/10** | ✅ GA4 + Meta + ATT; still no Sentry / MMP / SKAN plan |
| Release ops | **6/10** | Bundle IDs + store copy + privacy/terms drafts; still need Pages live, `eas.json`, signing, screenshots |
| Trust & metrics | **5/10** | Streak/XP can be farmed; progress not audit-ready |
| **Overall (paid-ready)** | **~5/10** | OK for beta / TestFlight; early for Meta Ads on subscription |

**Recommendation:** **closed beta + soft launch** first, then a small Meta Ads test only after P0 monetization + Sentry + EAS.

---

## Go / No-Go

| Decision | Condition |
|----------|-----------|
| **GO** — internal / friends beta | Now |
| **GO** — TestFlight / closed beta | After P0 (except full monetization if free-only) |
| **NO-GO** — Meta Ads on subscription | Until RevenueCat + analytics + attribution + content QA |
| **NO-GO** — App Store as paid product | Until real IAP + privacy + store assets |

---

# Tasks by priority

> Scorecard areas map to task sections below. Column **Area** links each task back to the scorecard.

---

## P0 — Blockers (~2–3 weeks)

### Monetization (Ilya) quick

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P0-1 | Monetization | Integrate **RevenueCat** (or native IAP) | `subscribe()` only sets local `isPremium = true` | 3–5d |
| P0-2 | Monetization | Real paywall: products, trial, restore, purchase errors | Store compliance + user trust | 2–3d |
| P0-3 | Monetization | Define **premium gating**: what is free vs paid | Otherwise ads drive users to “free premium” | 1d |
| P0-4 | Product & UX | Remove/hide demo copy (“Paywall placeholder”, “Reset demo progress”) | Professional launch | 0.5d |

### Analytics & attribution (Kostya)

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P0-5 | ☐ | Analytics | **Sentry** (crashes + errors) | Blind release without it | 1d |
| P0-6 | ✅ Jul 22 | Analytics | Product events + **Firebase GA4** — see `docs/ANALYTICS.md` / `docs/FIREBASE.md` | Funnel for Meta and product | 2–3d |
| P0-7 | ✅ Jul 22 | Analytics | Event schema doc + naming convention (`docs/ANALYTICS.md`) | Team and ads aligned | 0.5d |

### Release ops (Ilya) quick

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P0-8 | ☐ | Release ops | **EAS**: `eas.json`, dev / preview / production profiles | Builds and submit | 1–2d |
| P0-9 | ◐ Jul 22 | Release ops | Android: `package` = `com.besmart.app`; icons, signing still open | Was missing package | 1d |
| P0-10 | ◐ Jul 22 | Release ops | Bundle ID `com.besmart.app` set; ASC verify, capabilities, privacy strings open | Identity fixed pre-store | 1d |
| P0-11 | ✅ Jul 24 | Release ops | Privacy Policy + Terms (`docs/legal/`) + paywall/Profile links; enable GitHub Pages for live HTTPS URLs | Required for subscriptions and ads | done |

### Content (QA) — release blockers (Kostya)

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P0-12 | ✅ Jul 22 | Content (QA) | Sweep `src/data/summaries.json` for `isn**t` / `it**s` artifacts | Apostrophe-bold bug | 1–2d |
| P0-13 | ✅ Jul 22 | Content (QA) | Fix `format_summaries.py` + `--repair-only` | Prevent recurrence | 1d |
| P0-14 | ✅ Jul 22 | Content (QA) | Fact-check: store only real flags (`normalize_fact_check_response`) | Dropped OK essays | 0.5–1d |
| P0-15 | ✅ Jul 22 | Content (QA) | SoT = `src/data/summaries.json` (see `docs/CONTENT_PIPELINE.md`) | Legacy `whole_json_script/` ignored | 0.5d |

### Trust & metrics (Ilya)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P0-16 | Trust & metrics | Streak / XP: no repeat rewards for same lesson; daily goal by calendar day | Streak can be farmed today | 1–2d |

---

## P1 — Before Meta Ads (+1–2 weeks)

### Analytics & attribution (Kostya) medium

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P1-1 | ☐ | Analytics | **MMP** (AppsFlyer or Adjust) *or* documented SKAN plan (Meta SDK already live via P1-2) | ROAS and channels | 2–4d |
| P1-2 | ✅ Jul 23 | Analytics | Meta Events Manager: SDK + key events verified in Overview (`docs/META_EVENTS.md`) | Campaign linkage | 1d |
| P1-3 | ✅ Jul 23 | Analytics | **ATT** (iOS) + strategy without IDFA — `docs/ATT.md` | iOS attribution | 1d |
| P1-4 | ☐ | Analytics | RevenueCat ↔ MMP postbacks (trial, purchase, renewal) | Paid UA visibility | 1–2d |

### Content (QA) (Danik)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-5 | Content (QA) | Manual QA **top 10 books** (full flow + quiz + tone) | Trust on cold traffic | 3–5d |
| P1-6 | Content (QA) | Sensitive books separately (`mans_search_meaning`, `why_nations_fail`, …) | Reputational risk | 1–2d |
| P1-7 | Content (QA) | Quiz QA: not all `correctIndex=0`, no ambiguous options | Learning quality | 2d |
| P1-8 | Content (QA) | Per-book checklist: schema, questions, flags, catalog match, signoff | Process, not one-off fix | 0.5d |

### Content (QA) — idea texts *(not final)* (Danik)

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P1-9 | ☐ | Content (QA) | **Idea titles & copy pass** (top books → all): hooks for Ideas feed; tighten slides, teaser, card summary | Titles & body copy not final — Ideas is discovery surface | 5–10d |
| P1-10 | ◐ Jul 24 | Content (QA) | **Ideas style guide** + encode in `STYLE_PROMPT` — length now **4–6 sentences**/screen; fuller guide still open | Repeatable generation | 1–2d |
| P1-11 | ◐ Jul 24 | Content (QA) | Pilot hook-style regen: *Fingerprints* done; expand to top books after style signoff | Validate before mass rewrite | 2–3d |

### Content (QA) — idea images *(not final)* (Danik)

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P1-12 | ✅ Jul 24 | Content (QA) | **Idea card images** optional — Ideas uses editorial cards + book covers; AI `card-N` not required | Feed without asset farm | — |
| P1-13 | ✅ Jul 24 | Content (QA) | `IDEA_CARD_IMAGES` optional; discover = covers + typography | Asset pipeline deferred | — |
| P1-14 | ☐ | Content (QA) | Covers: every catalog book has `cover.png` + registered `BOOK_COVERS` | Library / hub polish | 1–2d |

### Content (volume) — pipeline (Danik)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-15 | Content (volume) | Rewrite `docs/CONTENT_PIPELINE.md` for **`generate_content_cursor.py`** | Docs still point at `generate_content.py` + Anthropic | 0.5–1d |
| P1-16 | Content (volume) | Document chain: `book-catalog.ts` → Cursor LLM → `summaries.jsonl` → `src/data/summaries.json`; deprecate `whole_json_script/` drift | Single source of truth | 1d |
| P1-17 | Content (volume) | Sync models, `--skip-covers`, fact-check behavior — docs ↔ script | Team uses wrong pipeline | 0.5d |

### Product & UX (Ilya)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-18 | Product & UX | One **core narrative** in onboarding/ads — *Stop scrolling TikTok/Insta, become smarter* (`docs/STORE_LISTING.md`) | Conversion and creatives | 1–2d |
| P1-19 | Product & UX | Smoke tests: onboarding → idea → quiz → paywall | Regressions | 1–2d |

---

## P2 — Polish & scale

| # | Status | Area | Task | Why | Est. |
|---|--------|------|------|-----|------|
| P2-1 | ✅ Jul 24 | Release ops | Store listing copy + keywords — `docs/STORE_LISTING.md` (screenshots/preview assets at submit) | ASO | 2–3d |
| P2-2 | ☐ | Content (QA) | Scale idea-card art (batch prompts, consistent 1:1 style across books) | Optional — feed uses covers | design + assets |
| P2-3 | ☐ | Content (volume) | Lessons content pass (titles, slides, quiz) if lessons in acquisition funnel | Parity with books | content |
| P2-4 | ☐ | Product & UX | Navigation: `dismissAll` in feed, edge cases | UX polish | 0.5–1d |
| P2-5 | ✅ Jul 24 | Content (volume) | Slide images in book feed for all ideas + gen script (`docs/SLIDE_IMAGES.md`) | Depth in reader | done |
| P2-6 | ☐ | Release ops | Bundle size / lazy load content (as library grows) | Performance — assets grew with slides | as needed |
| P2-7 | ☐ | Release ops | CI: lint + basic tests (store, progress keys) | Release quality | 2–3d |
| P2-8 | ☐ | Analytics | Amplitude / PostHog — cohorts, retention dashboards | Growth | 2d |
| P2-9 | ☐ | Release ops | Repo cleanup: `.gitignore`, temp files, `books_archive` | Operations | 0.5d |
| P2-10 | ✅ Jul 24 | Product & UX | Library search (title / author) | Find known books | done |

---

# Meta Ads — what to install

## Minimum (test $500–2k)

| Component | Required? |
|-----------|-----------|
| Meta App + Events Manager | Yes |
| Install + custom events (onboarding, paywall, purchase) | Yes |
| RevenueCat | Yes (if subscription) |
| Sentry | Yes |
| ATT | Yes (iOS) |
| Privacy Policy | Yes |
| **MMP** | Recommended; can start without if Meta-only |

## Recommended stack for scale

| Role | Tool |
|------|------|
| Subscriptions | **RevenueCat** |
| Attribution | **AppsFlyer** or **Adjust** |
| Crashes | **Sentry** |
| Product analytics | **Firebase Analytics (GA4)** (+ Amplitude/PostHog later if needed) |
| Ads | Meta (+ later other channels via MMP) |

### Do you need an MMP?

| Scenario | MMP |
|----------|-----|
| Meta only, small budget, learning phase | Can defer |
| Subscription + ROAS + multiple channels | **Almost required** |
| Retargeting, cohort LTV, SKAN sanity | **Yes** |

---

# Event funnel (draft)

Canonical schema: **`docs/ANALYTICS.md`**. Summary:

| Event | When |
|-------|------|
| `app_open` | App start |
| `onboarding_started` | Welcome screen |
| `onboarding_goal_selected` | Goals screen |
| `paywall_viewed` | Paywall |
| `trial_started` / `purchase_success` | Trial CTA / RevenueCat |
| `onboarding_completed` | Subscribe or skip |
| `idea_opened` | Ideas → feed |
| `idea_completed` | End of idea / quiz |
| `book_opened` | Library / discover |
| `lesson_started` / `lesson_completed` | Lesson player |

---

# Risks

| Risk | Severity | Area | Mitigation |
|------|----------|------|------------|
| Fake premium | Critical | Monetization | P0-1–P0-3 |
| Broken text in summaries | Medium | Content (QA) | ✅ P0-12–P0-13 |
| Idea copy not feed-ready | High | Content (QA) | P1-9–P1-11 (length prompt ◐; titles still open) |
| Idea slide images missing | Low | Content (QA) | ✅ P2-5 shipped; optional card art P2-2 |
| No crash/analytics data | Medium | Analytics | ✅ P0-6–P0-7 (GA4); ✅ P1-2 Meta; ☐ P0-5 Sentry |
| Docs ≠ pipeline | Medium | Content (volume) | ◐ CONTENT_PIPELINE updated; P1-15–17 polish |
| Streak farming | Medium | Trust & metrics | P0-16 |
| False fact-check flags | Low | Content (QA) | ✅ P0-14 |
| App size / asset bloat | Medium | Release ops | P2-6 after slide PNG ship |

---

# Suggested timeline (1 dev)

| Week | Focus |
|------|--------|
| 1 | P0: RevenueCat skeleton, Sentry, analytics schema, summaries text fix |
| 2 | P0: EAS builds, privacy, progress/streak, paywall prod-ready |
| 3 | P1: MMP/Meta, idea copy/images pilot, pipeline docs, QA top books |
| 4 | Soft launch → small Meta test → iterate |

---

# Definition of Done — “ready for Meta Ads on subscription”

| # | Criterion | Area |
|---|-----------|------|
| ☐ | Real purchase and restore work on iOS and Android | Monetization |
| ☐ | Premium actually gates content | Monetization |
| ◐ | Event funnel in GA4 + Meta (✅); Sentry still open | Analytics |
| ◐ | Meta App Events + ATT live (✅ P1-2/P1-3); still need MMP or documented SKAN plan | Analytics |
| ✅ | No broken apostrophe-markdown in shipped summaries | Content (QA) |
| ☐ | Top 10 books passed manual QA | Content (QA) |
| ☐ | Idea titles signed off for Ideas feed | Content (QA) |
| ✅ | Ideas feed uses covers + editorial cards (AI card art optional) | Content (QA) |
| ✅ | Slide images present for ideas in book feed | Content (QA) |
| ☐ | `CONTENT_PIPELINE.md` matches `generate_content_cursor.py` | Content (volume) |
| ☐ | Production build without demo placeholders | Product & UX |
| ◐ | Privacy Policy / Terms written + in-app links (✅); HTTPS host (GitHub Pages) must be live for store | Release ops |

---

**Document owner:** _fill in_  
**Repo:** `besmart` (Expo 56, `src/data/summaries.json`, `generate_content_cursor.py`)
