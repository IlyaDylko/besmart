# BeSmart — Store Listing (ASO)

**Task:** P2-1 — Store listing: screenshots, preview, description, keywords  
**Status:** ✅ Copy + ASO brief done · Screenshots / preview video — shoot at submit (shot list below)  
**Locale:** English (US) primary · other locales later  
**Narrative:** Stop scrolling TikTok & Instagram — become smarter in minutes a day.

Use this file as the single source when filling App Store Connect and Google Play Console.

---

## Brand & positioning

| Item | Value |
|------|--------|
| App name | **BeSmart** |
| Bundle / package | `com.besmart.app` |
| One-liner | Stop doomscrolling. Learn something real in 10 minutes. |
| Audience | Curious adults who waste time on TikTok/Reels/Instagram and want a smarter daily habit |
| Category (iOS) | Education (secondary: Books or Lifestyle) |
| Category (Android) | Education |
| Content rating | 12+ / Teen (non-sensitive learning content; confirm at submit) |

**Do not position as:** another “book summary spam” clone only. Lead with **habit replacement** (scroll → learn), then books + short lessons + quizzes.

---

## Name & subtitle (App Store)

**Name** (≤30): `BeSmart`

**Subtitle options** (≤30) — pick one at submit:

| # | Subtitle | Chars | Notes |
|---|----------|-------|-------|
| A ★ | `Stop Scrolling. Get Smarter` | 27 | Closest to core narrative |
| B | `Learn Instead of Scrolling` | 26 | Clear habit swap |
| C | `Bite-Sized Learning Daily` | 25 | Softer; less TikTok contrast |
| D | `Book Ideas in 10 Minutes` | 24 | Content-led |

**Recommended:** **A**.

---

## Google Play title & short description

**Title** (≤30): `BeSmart: Learn Daily`

(If Play allows differentiation from iOS name; else `BeSmart`.)

**Short description** (≤80) — options:

| # | Text | Chars |
|---|------|-------|
| A ★ | `Stop scrolling TikTok. Learn big ideas in 10 minutes a day.` | 60 |
| B | `Replace Instagram scrolling with bite-sized books & quizzes.` | 60 |
| C | `Daily microlearning: book ideas, short lessons, real progress.` | 62 |

**Recommended:** **A**.

---

## Keywords (App Store field, ≤100 characters)

Rules: comma-separated, **no spaces after commas**, no brand duplicates of the app name if Apple already indexes it, avoid competitor trademark spam.

**Primary set ★** (99 chars):

```
learn,learning,books,summary,quiz,microlearning,education,habits,self improvement,tiktok,scrolling,ideas,daily
```

**Alt set** (more “book summary”):

```
book summaries,blinkist alternative,learn daily,self help,nonfiction,reading,focus,dopamine,habit,education app
```

**Research notes (manual, not paid tools):**

- Intent clusters: *learn daily*, *book summary*, *microlearning*, *stop doomscrolling*, *self improvement habit*
- Narrative terms (`tiktok`, `scrolling`) help relevance for ads + some search; keep 1–2 max so core education terms still fit
- Revisit after soft launch with App Store Search Ads / Play Console queries

---

## Promotional text (App Store, ≤170, editable anytime)

```
Tired of TikTok and Instagram eating your evening? BeSmart turns spare minutes into real knowledge — short book ideas, quizzes, and a daily streak that sticks.
```

(Chars: ~155)

---

## Full description (App Store + Play)

Paste-ready. Same body for both stores unless Play needs a shorter cut.

### Version A ★ — narrative-led (recommended)

```
Stop scrolling. Start getting smarter.

TikTok and Instagram are designed to steal your attention. BeSmart is designed to give it back — in short, satisfying sessions that make you sharper every day.

WHAT YOU GET
• Bite-sized ideas from great nonfiction books
• Interactive lessons you can finish in about 10 minutes
• Quizzes that help knowledge stick
• A daily streak so learning becomes a habit, not a chore

REPLACE THE SCROLL
Open BeSmart instead of another feed. Discover one idea, understand it, check yourself with a quick quiz, and move on with your day feeling smarter — not drained.

LEARN WHAT MATTERS
Psychology, productivity, business, history, and more — curated so you don’t waste time on fluff. Perfect for commutes, coffee breaks, or the moments you’d usually open Reels.

BUILT FOR CURIOUS MINDS
Whether you want better conversations, career edge, or just a healthier phone habit, BeSmart meets you in the minutes you already have.

Download BeSmart. Trade endless scrolling for ideas that actually stick.
```

### Version B — features-led (fallback)

```
BeSmart — daily microlearning for curious minds.

Learn something new in about 10 minutes: swipe through clear ideas from top books, take short quizzes, and build a streak that replaces doomscrolling with progress.

Features
• Book idea cards for fast discovery
• Short interactive lessons
• Quizzes for retention
• Progress, streaks, and a simple daily goal
• Topics from science and business to psychology and history

Stop the endless scroll. Become a little smarter every day with BeSmart.
```

---

## What’s New (1.0.0)

```
Welcome to BeSmart — bite-sized learning built to replace doomscrolling. Explore book ideas, short lessons, and quizzes. More books and polish coming soon.
```

---

## Screenshot plan (assets TBD)

Do **not** shoot yet — structure for when UI is launch-ready. Prefer real device UI; light narrative captions over feature dumps.

### Shot list (6–8 frames, 6.7" iPhone priority)

| # | Screen | Caption (on image) | Narrative job |
|---|--------|--------------------|---------------|
| 1 | Ideas feed / hero | `Stop scrolling. Get smarter.` | Hook |
| 2 | Idea card / book idea | `Big ideas in minutes` | Value |
| 3 | Lesson / slides | `Learn in ~10 minutes` | Habit fit |
| 4 | Quiz | `Make it stick` | Retention |
| 5 | Book hub / library | `Books worth your time` | Depth |
| 6 | Streak / profile | `Build a smarter daily habit` | Motivation |
| 7 *(optional)* | Onboarding welcome | `Replace the feed with learning` | Contrast vs social |
| 8 *(optional)* | Paywall (honest) | Only if premium is real IAP | Monetization |

**Specs (iOS):** 6.7" required; also 6.5"/5.5" if still required at submit — export from same Figma/frame set.  
**Android:** phone + 7" tablet if targeting tablets.

**Caption style:** short, sentence case or title case consistent; no walls of text; brand color accent `#FF7A50` sparingly.

**Folder (when ready):** `docs/store-assets/screenshots/` (create later; keep out of git if huge binaries — or use LFS).

---

## App preview video (TBD)

| Item | Direction |
|------|-----------|
| Length | 15–30s |
| Hook (0–3s) | Phone on TikTok/Reels-style scroll → cut to BeSmart Ideas |
| Middle | Open idea → quiz → streak |
| End | Logo + `Stop scrolling. Get smarter.` |
| Audio | Soft, no voiceover required for v1; captions on-screen |
| File | Later: `docs/store-assets/preview/` |

---

## Support / legal

| Field | Value |
|-------|--------|
| Support URL | Prefer a help page; until then use Privacy URL or `mailto:support@besmart.app` |
| Support email | `support@besmart.app` (set up inbox before launch) |
| Marketing URL | optional |
| Privacy Policy | `https://ilyadylko.github.io/besmart/legal/privacy.html` **required** — enable GitHub Pages (`docs/` folder); see `docs/legal/README.md` |
| Terms | `https://ilyadylko.github.io/besmart/legal/terms.html` |
| Copyright | `© 2026 BeSmart` |

In-app: Paywall + Profile link to the same URLs (`src/constants/legal.ts`).

---

## ASO checklist (submit day)

- [ ] Final subtitle + short description locked
- [ ] Keywords ≤100 pasted (no spaces after commas)
- [ ] Full description A or B pasted
- [ ] Screenshots uploaded (6.7" + required sizes)
- [ ] Preview video optional for soft launch
- [ ] Categories + age rating set
- [x] Privacy / Terms docs written (`docs/legal/`) — turn on GitHub Pages before store submit
- [ ] Privacy / support URLs live (Pages deploy)
- [ ] Localizations: EN done; RU/ES/… backlog

---

## Alternatives bank (ads / experiments)

Keep for Meta ads creatives and A/B subtitle tests:

- Stop doomscrolling. Start learning.
- Your feed made you tired. BeSmart makes you sharper.
- 10 minutes. One idea. Less guilt.
- Scroll less. Know more.
- The anti-doomscroll learning habit.

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-24 | Initial copy pack for P2-1 (screenshots / preview deferred to submit) |
| 2026-07-24 | Marked P2-1 done in RELEASE_READINESS |
| 2026-07-24 | Privacy / Terms URLs filled (P0-11 drafts + GitHub Pages path) |
