#!/usr/bin/env python3
"""
Полный пайплайн добавления книг в BeSmart через Cursor CLI.

Что делает для каждой новой книги:
  1. Генерирует саммари (идеи + recap + 3 вопроса на идею)
  2. Факт-чек
  3. Сохраняет в summaries.jsonl + src/data/summaries.json
  4. Форматирует текст слайдов (bold, bullets)
  5. Догенерирует вопросы, если их нет в ответе модели
  6. Генерирует обложку (assets/images/books/{id}/cover.png)

Единственный источник списка книг — src/data/book-catalog.ts.
Добавил книгу в каталог → запустил скрипт.

Установка (один раз):
    curl https://cursor.com/install -fsS | bash
    cursor-agent login
    pip install -r scripts/requirements-covers.txt   # для обложек (Pollinations)

Примеры:
    # Все новые книги из каталога (пропускает уже готовые)
    python3 generate_content_cursor.py

    # Одна книга целиком: текст + вопросы + обложка
    python3 generate_content_cursor.py --book my_new_book

    # Только обложки для книг без cover.png
    python3 generate_content_cursor.py --covers-only --skip-existing

    # Только вопросы (если саммари есть, а quiz нет)
    python3 generate_content_cursor.py --questions-only --skip-existing

    # Перегенерировать саммари принудительно
    python3 generate_content_cursor.py --book my_book --force

Флаги:
    --book ID           только одна книга
    --force             перегенерировать саммари даже если уже есть
    --skip-covers       не генерировать обложки
    --skip-questions    не догенерировать вопросы отдельным вызовом
    --force-questions   перегенерировать вопросы
    --covers-only       только обложки
    --questions-only    только вопросы
    --format-only       только форматирование summaries.json
    --skip-existing     для covers/questions: пропускать готовое
    --no-3d             обложка без 3D-мокапа
    --style STYLE       шаблон обложки: besmart | ast | marber | faber | penguin
    --ai-style          cursor-agent выбирает шаблон обложки
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "scripts"))

from book_pipeline import (  # noqa: E402
    attach_metadata,
    catalog_books,
    ensure_cover,
    ensure_questions,
    format_summaries,
    ideas_need_questions,
    is_summary_complete,
    load_all_rows,
    load_catalog,
    normalize_fact_check_response,
    upsert_row,
    validate_questions,
)

GEN_MODEL = "claude-opus-4-8-high"
CHECK_MODEL = "claude-4.5-sonnet"
OUTPUT_LANGUAGE = "English"
CURSOR_BIN = "cursor-agent"
TIMEOUT_SEC = 600

SCHEMA_HINT = """{
  "hook": "3-6 word cover promise",
  "ideas": [
    {
      "title": "idea title",
      "read_minutes": 3,
      "screens": ["3-5 sentence screen", "..."],
      "card": {
        "summary": "one fuller paragraph",
        "bullets": ["...", "..."],
        "highlight": "one memorable principle, no long quotes"
      },
      "questions": [
        {
          "question": "comprehension question",
          "options": ["...", "...", "...", "..."],
          "correctIndex": 0,
          "explanation": "one sentence"
        }
      ]
    }
  ]
}"""

STYLE_PROMPT = f"""You are an editor for a microlearning app that turns popular
non-fiction books into bite-sized summaries. Write everything in {OUTPUT_LANGUAGE}.

IDEAS FEED (critical — this is how most people first see an idea):
- Each idea appears on a discovery feed as: TITLE + first ~2–3 lines of the first screen.
- Titles must work as HOOKS, not chapter labels. Prefer curiosity, tension, contrast, or a sharp claim.
- Good title vibes: "Stop Building Until You Know This", "The Metric That Lies to You",
  "Why Shipping Faster Feels Wrong (and Works)".
- Bad titles: "Build, Measure, Learn", "Validated Learning", "The MVP Concept",
  "Innovation Accounting" — too textbook / summary-like.
- The FIRST screen must open with a hook line that creates pull on its own —
  a surprising claim, a concrete tension, or a vivid scenario. Do NOT open with
  "In this idea…", "Ries argues…", "The book says…", or a dry definition.
- Front-load the payoff: the first 1–2 sentences should make someone want to tap.

STYLE:
- Write like a strong human non-fiction editor, not like an AI explainer.
- Sound natural, specific, and slightly opinionated where appropriate.
- Each idea: a hooky title, 2-3 screens, a recap card
  (one paragraph + 2-4 bullets + one memorable principle),
  and exactly 3 multiple-choice comprehension questions (4 options each).
- Questions must test understanding of the idea, not book trivia.
- Vary rhythm: mix short punchy lines with longer reflective ones.
- Avoid generic motivational filler and repetitive transitions.

LENGTH:
- Each screen should usually be 3-5 sentences.
- Let explanations breathe: add one example, contrast, or implication where useful.

HUMANNESS:
- Avoid repetitive openers like "Here's the thing", "The point is", "In other words".
- Do not sound like a productivity influencer or corporate coach.

LEGAL / ORIGINALITY (critical):
- Restate the book's IDEAS in your own words. Do NOT copy the author's phrasing.
- No verbatim quotes longer than a short phrase.

ACCURACY:
- Only include facts, names, and numbers you are confident are correct.
- If unsure about an anecdote or statistic, keep the idea general."""


def run_cursor(prompt: str, model: str) -> str:
    proc = subprocess.run(
        [CURSOR_BIN, "-p", "--trust", "--output-format", "json", "--model", model, prompt],
        capture_output=True,
        text=True,
        timeout=TIMEOUT_SEC,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"cursor-agent вернул код {proc.returncode}: {proc.stderr.strip()[:300]}"
        )
    envelope = json.loads(proc.stdout)
    if isinstance(envelope, dict):
        return envelope.get("result", "")
    return str(envelope)


def extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.lstrip().lower().startswith("json"):
            text = text.lstrip()[4:]
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


def generate_summary(book: dict, retries: int = 3) -> dict:
    for attempt in range(1, retries + 1):
        prompt = (
            f"{STYLE_PROMPT}\n\n"
            f'Create a summary for the book "{book["title"]}" by {book["author"]}.\n\n'
            f"Respond with ONE raw JSON object and NOTHING else — no prose, no code fences.\n"
            f"It MUST match exactly this shape (6-8 ideas, 3 questions per idea):\n{SCHEMA_HINT}"
        )
        if attempt > 1:
            prompt += "\n\nYour previous answer was incomplete or invalid JSON. Return the FULL object."
        try:
            data = extract_json(run_cursor(prompt, GEN_MODEL))
        except (json.JSONDecodeError, RuntimeError) as e:
            print(f"   ⚠ ошибка разбора ответа ({e}), попытка {attempt}/{retries}")
            continue
        if is_summary_complete(data):
            return data
        print(f"   ⚠ неполное саммари, попытка {attempt}/{retries}")
    raise RuntimeError(f"не удалось сгенерировать полное саммари: {book['title']}")


def fact_check(book: dict, summary: dict) -> list[str]:
    prompt = (
        f'You know the popular book "{book["title"]}" by {book["author"]} from your training. '
        f"Using only your own knowledge, review the JSON summary below and flag any claim you "
        f"are CONFIDENT is factually wrong (wrong names, dates, numbers, misattributed quotes, "
        f"invented anecdotes). Do NOT ask for the book's text — judge only what is provided. "
        f"If you find nothing you are confident is wrong, reply with exactly: OK\n\n"
        f"{json.dumps(summary, ensure_ascii=False)}"
    )
    try:
        text = run_cursor(prompt, CHECK_MODEL).strip()
    except RuntimeError as e:
        return [f"fact-check недоступен: {e}"]
    return normalize_fact_check_response(text)


def filter_books(
    *,
    book_id: str | None,
    force: bool,
) -> list[dict[str, str]]:
    catalog = load_catalog()
    by_id, _ = load_all_rows()
    candidates: list[dict[str, str]] = []

    for entry in catalog_books():
        if book_id and entry["id"] != book_id:
            continue
        if book_id is None and not force:
            row = by_id.get(entry["id"])
            if row and is_summary_complete(row.get("data", {})):
                continue
        candidates.append(entry)

    if book_id and not candidates:
        if book_id not in catalog:
            raise SystemExit(f"Книга {book_id!r} не найдена в book-catalog.ts")
        raise SystemExit(f"Книга {book_id!r} уже полностью сгенерирована (используй --force)")

    return candidates


def process_summary_book(
    book: dict[str, str],
    catalog: dict[str, dict[str, str]],
    *,
    skip_questions: bool,
    force_questions: bool,
    skip_covers: bool,
    skip_existing_covers: bool,
    use_3d: bool,
    cover_style: str | None,
    ai_style: bool,
) -> None:
    print(f"\n=== {book['title']} ({book['id']}) ===")

    summary = generate_summary(book)
    flags = fact_check(book, summary)
    if flags:
        print(f"   ⚠ факт-чек: {flags}")

    row = attach_metadata(
        {"id": book["id"], "data": summary, "flags": flags},
        catalog,
    )

    if not skip_questions:
        if force_questions or ideas_need_questions(row):
            print("   → generating quiz questions...")
            ensure_questions(row, force=force_questions)
            print("   ✓ questions ready")
        elif all(validate_questions(i.get("questions")) for i in row["data"]["ideas"]):
            print("   ✓ questions included in summary")

    upsert_row(row)
    print("   ✓ saved summaries.json + summaries.jsonl")

    print("   → formatting slide text...")
    format_summaries()
    print("   ✓ formatted")

    if not skip_covers:
        ensure_cover(
            book["id"],
            catalog,
            skip_existing=skip_existing_covers,
            use_3d=use_3d,
            force_style=cover_style,
            use_ai_style=ai_style,
        )


def run_questions_only(
    *,
    book_id: str | None,
    skip_existing: bool,
    force: bool,
) -> None:
    catalog = load_catalog()
    by_id, order = load_all_rows()
    from book_pipeline import save_rows  # noqa: E402

    targets = [book_id] if book_id else order
    updated = 0

    for bid in targets:
        row = by_id.get(bid)
        if not row:
            print(f"skip {bid} (no summary)")
            continue
        if skip_existing and not ideas_need_questions(row):
            print(f"skip {bid} (questions ok)")
            continue
        if not force and not ideas_need_questions(row):
            continue

        row = attach_metadata(row, catalog)
        print(f"generating questions for {bid}...")
        ensure_questions(row, force=force)
        by_id[bid] = row
        updated += 1

    if updated:
        save_rows(by_id, order)
        format_summaries()
    print(f"Done. Updated questions for {updated} book(s).")


def run_covers_only(
    *,
    book_id: str | None,
    skip_existing: bool,
    use_3d: bool,
    cover_style: str | None,
    ai_style: bool,
) -> None:
    catalog = load_catalog()
    by_id, order = load_all_rows()
    targets = [book_id] if book_id else order

    done = 0
    for bid in targets:
        if bid not in by_id:
            print(f"skip {bid} (no summary)")
            continue
        if ensure_cover(
            bid,
            catalog,
            skip_existing=skip_existing,
            use_3d=use_3d,
            force_style=cover_style,
            use_ai_style=ai_style,
        ):
            done += 1

    print(f"Done. Generated {done} cover(s).")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="BeSmart book pipeline: summary + questions + cover via Cursor CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--book", help="Process a single book id from book-catalog.ts")
    parser.add_argument("--force", action="store_true", help="Regenerate summary even if complete")
    parser.add_argument("--skip-covers", action="store_true", help="Skip cover generation")
    parser.add_argument("--skip-questions", action="store_true", help="Skip question backfill")
    parser.add_argument("--force-questions", action="store_true", help="Regenerate quiz questions")
    parser.add_argument("--covers-only", action="store_true", help="Only generate covers")
    parser.add_argument("--questions-only", action="store_true", help="Only generate questions")
    parser.add_argument("--format-only", action="store_true", help="Only run format_summaries")
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="With --covers-only / --questions-only: skip books that already have output",
    )
    parser.add_argument("--no-3d", action="store_true", help="Flat cover without 3D mockup")
    parser.add_argument(
        "--style",
        choices=["besmart", "ast", "marber", "faber", "penguin"],
        help="Force cover template",
    )
    parser.add_argument("--ai-style", action="store_true", help="Let cursor-agent pick cover style")
    args = parser.parse_args()

    if args.format_only:
        print("Formatting summaries.json...")
        format_summaries()
        print("Done.")
        return

    if args.covers_only:
        run_covers_only(
            book_id=args.book,
            skip_existing=args.skip_existing,
            use_3d=not args.no_3d,
            cover_style=args.style,
            ai_style=args.ai_style,
        )
        return

    if args.questions_only:
        run_questions_only(
            book_id=args.book,
            skip_existing=args.skip_existing,
            force=args.force_questions,
        )
        return

    books = filter_books(book_id=args.book, force=args.force)
    if not books:
        print("Новых книг нет — всё из каталога уже сгенерировано.")
        print("Добавь запись в src/data/book-catalog.ts или используй --force --book ID")
        return

    catalog = load_catalog()
    print(f"К генерации: {len(books)} книг(и)")

    for i, book in enumerate(books, 1):
        print(f"\n[{i}/{len(books)}]", end="")
        try:
            process_summary_book(
                book,
                catalog,
                skip_questions=args.skip_questions,
                force_questions=args.force_questions,
                skip_covers=args.skip_covers,
                skip_existing_covers=args.skip_existing,
                use_3d=not args.no_3d,
                cover_style=args.style,
                ai_style=args.ai_style,
            )
        except RuntimeError as e:
            print(f"   ✗ ошибка: {e}")

    print("\n=== ГОТОВО ===")
    print("Перезапусти Metro при необходимости: npx expo start --clear")


if __name__ == "__main__":
    main()
