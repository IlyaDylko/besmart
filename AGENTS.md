# BeSmart — AI project map

Educational app (Expo 56, React Native). Two content types:

- **Lessons** — topic-based slides + quiz (`src/data/lessons.ts`)
- **Books** — book summaries as swipeable ideas (`src/data/books.ts` + `summaries.json`)

## Stack

- Expo SDK 56, expo-router (file routes in `src/app/`)
- TypeScript strict, path alias `@/*` → `src/*`
- MobX + AsyncStorage persistence (`src/stores/user-store.ts`)
- Docs: https://docs.expo.dev/versions/v56.0.0/

## Directory map

| Path | Purpose |
|------|---------|
| `src/app/` | Routes (expo-router). Entry: `index.tsx` → onboarding or tabs |
| `src/app/(tabs)/` | Ideas, Library, Profile |
| `src/app/onboarding/` | Goals → paywall flow |
| `src/app/lesson/[id].tsx` | Lesson player (slides + quiz) |
| `src/app/book/[id]/` | Book hub: `index`, `ideas`, `feed` |
| `src/components/ui/` | Reusable UI (buttons, cards, progress) |
| `src/components/book/` | Book reader UI |
| `src/components/lesson/` | Lesson player UI |
| `src/data/` | Static content + loaders — see `src/data/index.ts` for public API |
| `src/types/` | `learning.ts`, `book.ts` — source of truth for shapes |
| `src/stores/` | MobX stores (persisted user state) |
| `src/context/` | React context wrapping stores for components |
| `src/constants/theme.ts` | BrandColors, BookColors, typography |
| `generate_content.py` | Offline pipeline: Anthropic API → `summaries.jsonl` |

## Navigation flow

```
index → onboarding? → (tabs)
(tabs)/index     — recommended lesson
(tabs)/ideas     — idea discovery (default)
(tabs)/library   — reading now + books by category
(tabs)/profile   — stats, reset
lesson/[id]      — completeLesson() → XP + streak
book/[id]/*      — completeIdea() → progress
```

Book stack (`book/[id]/_layout.tsx`): `index` → `ideas` → `feed` (fullScreenModal).

## State

Do not duplicate state in screens.

- `userStore` (MobX): onboarding, premium, streak, xp, `completedLessonIds`, `completedIdeaIds`
- Access via `useApp()` from `@/context/app-context`, not direct store in screens
- Idea progress keys: `bookId:ideaId`

## Content editing

| Task | Edit | Avoid |
|------|------|-------|
| New lesson | `src/data/lessons.ts` + topic in `topics.ts` | — |
| New book metadata | `src/data/book-catalog.ts` | — |
| Book slide content | Regenerate via `generate_content.py` → `summaries.json` | Hand-editing 90KB JSON |
| Types | `src/types/*.ts` first, then data | — |

See `docs/CONTENT_PIPELINE.md` for the book generation workflow.

## Conventions

- Functional components; `observer()` only where reading MobX
- iOS + Android only — no web target
- No new global state libs — extend `userStore` or use local state
- Minimize scope: match existing file patterns before adding abstractions
- Import data via `@/data` barrel or specific modules — don't bypass public loaders

## Maintaining this map

This file is a **stable skeleton**, not a changelog. Code is the source of truth.

**Update AGENTS.md / rules only when architecture changes:**

- New route section or navigation flow in `src/app/`
- New store, state pattern, or content type
- Stack change (Expo version, router, persistence)
- New top-level directory or public data API change

**Do not update after routine work:**

- New lesson, book, or screen in an existing flow
- UI tweaks, bug fixes, refactors within one area
- Renames or details that are obvious from the code

Keep this file under ~120 lines. Prefer scoped rules (`.cursor/rules/`) over growing AGENTS.md.

## Token-saving tips

- **Do not read** `src/data/summaries.json` (~90KB) wholesale — grep by book `id`, or read `books.ts` + types
- **Do not read** `src/data/lessons.ts` wholesale — grep by lesson `id`
- Lock files (`yarn.lock`, `package-lock.json`) and `assets/` are in `.cursorignore`
