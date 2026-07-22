# BeSmart — Release Readiness & Task Plan

**Date:** July 21, 2026  
**App version:** 1.0.0 (Expo 56)  
**Status:** prototype / soft-launch candidate — **not ready for scaled paid traffic**

---

## Readiness scorecard

| Area | Score | Notes |
|------|-------|-------|
| Product & UX | **7/10** | Onboarding, Ideas, Library, book feed — OK for beta; polish in P2 |
| Content (volume) | **8/10** | ~39 books, ~21 lessons — enough for launch |
| Content (QA) | **5/10** | Broken markdown risk; idea titles/copy & idea images not final |
| Monetization | **2/10** | Paywall is a placeholder, no IAP |
| Analytics & attribution | **1/10** | No SDK, no funnel, no MMP |
| Release ops | **3/10** | No `eas.json`, weak release checklist |
| Trust & metrics | **5/10** | Streak/XP can be farmed; progress not audit-ready |
| **Overall (paid-ready)** | **~4.5/10** | OK for beta / TestFlight; early for Meta Ads on subscription |

**Recommendation:** **closed beta + soft launch** first, then a small Meta Ads test only after P0.

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

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P0-5 | Analytics | **Sentry** (crashes + errors) | Blind release without it | 1d | -
| P0-6 | Analytics | Product events: `app_open`, onboarding steps, paywall_view, purchase, idea/lesson complete — see `docs/ANALYTICS.md` | Funnel for Meta and product | 2–3d |
| P0-7 | Analytics | Event schema doc + naming convention (`docs/ANALYTICS.md`) | Team and ads aligned | 0.5d |

### Release ops (Ilya) quick

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P0-8 | Release ops | **EAS**: `eas.json`, dev / preview / production profiles | Builds and submit | 1–2d |
| P0-9 | Release ops | Android: `android.package`, icons, signing | No package in `app.json` today | 1d |
| P0-10 | Release ops | iOS: bundle ID, capabilities, privacy strings | `com.besmart.app` — verify in App Store Connect | 1d |
| P0-11 | Release ops | Privacy Policy + Terms (URLs in paywall / store) | Required for subscriptions and ads | 1–2d |

### Content (QA) — release blockers (Kostya)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P0-12 | Content (QA) | Sweep `src/data/summaries.json` for artifacts: `isn**t`, `it**s`, broken markdown | `format_summaries.py` breaks apostrophes | 1–2d |
| P0-13 | Content (QA) | Fix `format_summaries.py` + regenerate or run format-only | Prevent recurrence | 1d |
| P0-14 | Content (QA) | Fact-check: store only real flags, not “OK after essay” | Noise in `flags[]` today | 0.5–1d |
| P0-15 | Content (QA) | Confirm bundled `summaries.json` is source of truth (not `whole_json_script/`) | Artifact drift | 0.5d |

### Trust & metrics (Ilya)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P0-16 | Trust & metrics | Streak / XP: no repeat rewards for same lesson; daily goal by calendar day | Streak can be farmed today | 1–2d |

---

## P1 — Before Meta Ads (+1–2 weeks)

### Analytics & attribution (Kostya) medium

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-1 | Analytics | **MMP** (AppsFlyer or Adjust) *or* Meta SDK + clear SKAN plan | ROAS and channels | 2–4d |
| P1-2 | Analytics | Meta Events Manager: app, install, key events | Campaign linkage | 1d |
| P1-3 | Analytics | **ATT** (iOS) + strategy without IDFA | iOS attribution | 1d |
| P1-4 | Analytics | RevenueCat ↔ MMP postbacks (trial, purchase, renewal) | Paid UA visibility | 1–2d |

### Content (QA) (Danik)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-5 | Content (QA) | Manual QA **top 10 books** (full flow + quiz + tone) | Trust on cold traffic | 3–5d |
| P1-6 | Content (QA) | Sensitive books separately (`mans_search_meaning`, `why_nations_fail`, …) | Reputational risk | 1–2d |
| P1-7 | Content (QA) | Quiz QA: not all `correctIndex=0`, no ambiguous options | Learning quality | 2d |
| P1-8 | Content (QA) | Per-book checklist: schema, questions, flags, catalog match, signoff | Process, not one-off fix | 0.5d |

### Content (QA) — idea texts *(not final)* (Danik)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-9 | Content (QA) | **Idea titles & copy pass** (top books → all): hooks for Ideas feed; tighten slides, teaser, card summary | Titles & body copy not final — Ideas is discovery surface | 5–10d |
| P1-10 | Content (QA) | **Ideas style guide** + encode in `STYLE_PROMPT` (`generate_content_cursor.py`) | Repeatable generation, not one-off edits | 1–2d |
| P1-11 | Content (QA) | Pilot hook-style regeneration on 1–2 books → validate → rollout | Validate before mass rewrite | 2–3d |

### Content (QA) — idea images *(not final)* (Danik)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-12 | Content (QA) | **Idea card images** 1:1 for discovery books | Feed looks unfinished without final assets | 5–10d |
| P1-13 | Content (QA) | Wire `IDEA_CARD_IMAGES` / `getIdeaCardImage()`, Recraft prompts, naming `card-N.png` | Asset pipeline + app integration | 2–3d |
| P1-14 | Content (QA) | Covers: every catalog book has `cover.png` + registered `BOOK_COVERS` | Library / hub polish | 1–2d |

### Content (volume) — pipeline (Danik)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-15 | Content (volume) | Rewrite `docs/CONTENT_PIPELINE.md` for **`generate_content_cursor.py`** | Docs still point at `generate_content.py` + Anthropic | 0.5–1d |
| P1-16 | Content (volume) | Document chain: `book-catalog.ts` → Cursor LLM → `summaries.jsonl` → `src/data/summaries.json`; deprecate `whole_json_script/` drift | Single source of truth | 1d |
| P1-17 | Content (volume) | Sync models, `--skip-covers`, fact-check behavior — docs ↔ script | Team uses wrong pipeline | 0.5d |

### Product & UX (Ilya)

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P1-18 | Product & UX | One **core narrative** in onboarding/ads (ideas vs lessons vs books) | Conversion and creatives | 1–2d | (Stop scrolling tiktok and insta and become smarter)
| P1-19 | Product & UX | Smoke tests: onboarding → idea → quiz → paywall | Regressions | 1–2d |

---

## P2 — Polish & scale

| # | Area | Task | Why | Est. |
|---|------|------|-----|------|
| P2-1 | Release ops | Store listing: screenshots, preview, description, keywords | ASO | 2–3d |
| P2-2 | Content (QA) | Scale idea-card art (batch prompts, consistent 1:1 style across books) | After P1-12 pilot | design + assets |
| P2-3 | Content (volume) | Lessons content pass (titles, slides, quiz) if lessons in acquisition funnel | Parity with books | content |
| P2-4 | Product & UX | Navigation: `dismissAll` in feed, edge cases | UX polish | 0.5–1d |
| P2-5 | Content (volume) | Optional: slide images inside book feed (`docs/SLIDE_IMAGES.md`) | Depth, not Ideas CTR | as needed |
| P2-6 | Release ops | Bundle size / lazy load content (as library grows) | Performance | as needed |
| P2-7 | Release ops | CI: lint + basic tests (store, progress keys) | Release quality | 2–3d |
| P2-8 | Analytics | Amplitude / PostHog — cohorts, retention dashboards | Growth | 2d |
| P2-9 | Release ops | Repo cleanup: `.gitignore`, temp files, `books_archive` | Operations | 0.5d |

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
| Broken text in summaries | High | Content (QA) | P0-12–P0-13 |
| Idea copy not feed-ready | High | Content (QA) | P1-9–P1-11 |
| Idea images missing / inconsistent | High | Content (QA) | P1-12–P1-13, P2-2 |
| No crash/analytics data | High | Analytics | P0-5–P0-7 |
| Docs ≠ pipeline | Medium | Content (volume) | P1-15–P1-17 |
| Streak farming | Medium | Trust & metrics | P0-16 |
| False fact-check flags | Medium | Content (QA) | P0-14 |

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
| ☐ | Sentry + event funnel in a dashboard | Analytics |
| ☐ | Attribution: Meta + (MMP or documented SKAN plan) | Analytics |
| ☐ | No broken markdown in shipped summaries | Content (QA) |
| ☐ | Top 10 books passed manual QA | Content (QA) |
| ☐ | Idea titles signed off for Ideas feed | Content (QA) |
| ☐ | Idea card images for discovery books (or explicit fallback policy) | Content (QA) |
| ☐ | `CONTENT_PIPELINE.md` matches `generate_content_cursor.py` | Content (volume) |
| ☐ | Production build without demo placeholders | Product & UX |
| ☐ | Privacy Policy / Terms published | Release ops |

---

**Document owner:** _fill in_  
**Repo:** `besmart` (Expo 56, `src/data/summaries.json`, `generate_content_cursor.py`)
