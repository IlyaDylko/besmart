# Book content pipeline

Books are generated offline and baked into the app as static JSON.

## Files

| File | Role |
|------|------|
| `generate_content.py` | Generates summaries via Anthropic API |
| `summaries.jsonl` | Append-only output (one JSON object per line) |
| `src/data/summaries.json` | Bundled app data (array of summary rows) |
| `src/data/book-catalog.ts` | Metadata per book id (title, author, category, emoji) |
| `src/data/books.ts` | Merges catalog + summaries into `Book` objects |

## Adding a new book

1. Add entry to `BOOK_CATALOG` in `src/data/book-catalog.ts` (id must match).
2. Uncomment/add book in `BOOKS` list inside `generate_content.py`.
3. Run:
   ```bash
   pip install anthropic
   export ANTHROPIC_API_KEY=sk-ant-...
   python generate_content.py
   ```
4. Convert `summaries.jsonl` → `src/data/summaries.json` (JSON array of all lines).
5. Optionally add cover/slide images in `src/data/book-images.ts`.

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

## Models

- Generation: `claude-opus-4-8` (tool call enforces JSON schema)
- Fact-check: `claude-haiku-4-5` (flags stored in row, review manually)

## Do not

- Hand-edit large sections of `summaries.json` — regenerate instead
- Add books to `summaries.json` without a matching `book-catalog.ts` entry
