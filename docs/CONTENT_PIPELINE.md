# Book content pipeline

Books are generated offline and baked into the app as static JSON.

## Source of truth

| Artifact | Role |
|----------|------|
| **`src/data/summaries.json`** | **Canonical app content** — what `books.ts` loads and ships in the binary |
| `summaries.jsonl` | Append/upsert log used by the generator (synced into `summaries.json`) |
| `src/data/book-catalog.ts` | Book metadata (title, author, category, emoji) |
| `whole_json_script/` | **Legacy / scratch** — not imported by the app; do not edit as product content |

If `whole_json_script/summaries.json` disagrees with `src/data/summaries.json`, trust **`src/data/summaries.json`**.

## Files

| File | Role |
|------|------|
| `generate_content_cursor.py` | **Current** generator (Cursor CLI → summaries + format + covers) |
| `generate_content_api.py` | Alternate Anthropic API generator |
| `scripts/format_summaries.py` | Slide markdown formatting; `--repair-only` fixes `isn**t` artifacts |
| `summaries.jsonl` | Generator upsert log |
| `src/data/summaries.json` | Bundled app data (array of summary rows) |
| `src/data/book-catalog.ts` | Metadata per book id |
| `src/data/books.ts` | Merges catalog + summaries into `Book` objects |

## Adding a new book

1. Add entry to `BOOK_CATALOG` in `src/data/book-catalog.ts` (id must match).
2. Run:
   ```bash
   python3 generate_content_cursor.py --book your_book_id --skip-covers
   ```
3. Covers: add `assets/images/books/{id}/cover.png` and register in `src/data/book-images.ts`.
4. Fact-check `flags[]` should only contain real issues (empty if OK). Noisy “OK after essay” responses are scrubbed by `normalize_fact_check_response`.

## Repair / format

```bash
# Fix apostrophe-bold artifacts (isn**t → isn't) + scrub OK flags
python3 scripts/format_summaries.py --repair-only --scrub-flags

# Full re-format of slide emphasis (safe after apostrophe fix)
python3 scripts/format_summaries.py
```

## Summary row shape

```json
{
  "id": "atomic_habits",
  "data": {
    "hook": "...",
    "ideas": [
      {
        "title": "...",
        "read_minutes": 3,
        "screens": ["slide text 1", "slide text 2"],
        "card": { "summary": "...", "bullets": ["..."], "highlight": "..." }
      }
    ]
  },
  "flags": []
}
```

`books.ts` transforms each idea into `PresentationSlide[]` and builds `BookIdea` objects.

## Models (`generate_content_cursor.py`)

- Generation: `claude-opus-4-8-high`
- Fact-check: `claude-4.5-sonnet` (only real issues stored in `flags`)

## Do not

- Hand-edit large sections of `summaries.json` — regenerate or use `--repair-only`
- Add books to `summaries.json` without a matching `book-catalog.ts` entry
- Treat `whole_json_script/summaries.json` as shipped content
