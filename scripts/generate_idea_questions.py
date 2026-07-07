#!/usr/bin/env python3
"""
Generate 3 comprehension quiz questions per book idea in summaries.json.

Uses cursor-agent (same as generate_content_cursor.py). Run once per book or all:

  python3 scripts/generate_idea_questions.py --book atomic_habits
  python3 scripts/generate_idea_questions.py --skip-existing
  python3 scripts/generate_idea_questions.py --all
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "whole_json_script"))

from cursor_llm import ask_json  # noqa: E402

SUMMARIES_JSON = ROOT / "src/data/summaries.json"
SUMMARIES_JSONL = ROOT / "summaries.jsonl"
MODEL = "composer-2.5"

QUESTION_SCHEMA = """{
  "ideas": [
    {
      "title": "exact idea title from input",
      "questions": [
        {
          "question": "clear comprehension question",
          "options": ["option A", "option B", "option C", "option D"],
          "correctIndex": 0,
          "explanation": "one sentence why the answer is correct"
        }
      ]
    }
  ]
}"""


def validate_questions(questions: list) -> bool:
    if not isinstance(questions, list) or len(questions) != 3:
        return False
    for item in questions:
        if not isinstance(item, dict):
            return False
        if not item.get("question") or not item.get("explanation"):
            return False
        options = item.get("options")
        if not isinstance(options, list) or len(options) != 4:
            return False
        correct = item.get("correctIndex")
        if not isinstance(correct, int) or correct < 0 or correct > 3:
            return False
    return True


def build_prompt(row: dict) -> str:
    ideas = row["data"]["ideas"]
    compact = []
    for idea in ideas:
        card = idea.get("card") or {}
        compact.append(
            {
                "title": idea["title"],
                "screens": idea.get("screens") or [],
                "summary": card.get("summary", ""),
                "bullets": card.get("bullets") or [],
                "highlight": card.get("highlight", ""),
            }
        )

    return (
        f'Book: "{row.get("title", row["id"])}" by {row.get("author", "unknown")}\n\n'
        f"Ideas JSON:\n{json.dumps(compact, ensure_ascii=False, indent=2)}\n\n"
        "For EACH idea, write exactly 3 multiple-choice questions that test whether "
        "the reader understood the key point — not trivia about the author or book meta.\n"
        "Questions must be answerable from the idea content above.\n"
        "Use plausible wrong options (common misconceptions), not joke answers.\n"
        "Return JSON matching this shape:\n"
        f"{QUESTION_SCHEMA}"
    )


def generate_for_book(row: dict) -> dict[str, list]:
    system = (
        "You write short comprehension quizzes for a microlearning app. "
        "English only. Respond with valid JSON only."
    )
    payload = ask_json(system, build_prompt(row), model=MODEL)
    ideas_out = payload.get("ideas")
    if not isinstance(ideas_out, list):
        raise ValueError("missing ideas array in model response")

    by_title: dict[str, list] = {}
    for entry in ideas_out:
        title = entry.get("title")
        questions = entry.get("questions")
        if not title or not validate_questions(questions):
            raise ValueError(f"invalid questions for idea: {title!r}")
        by_title[title] = questions
    return by_title


def apply_questions(row: dict, by_title: dict[str, list]) -> int:
    updated = 0
    for idea in row["data"]["ideas"]:
        title = idea["title"]
        if title not in by_title:
            raise ValueError(f"model omitted idea: {title!r}")
        idea["questions"] = by_title[title]
        updated += 1
    return updated


def save_rows(rows: list) -> None:
    SUMMARIES_JSON.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if SUMMARIES_JSONL.exists():
        SUMMARIES_JSONL.write_text(
            "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
            encoding="utf-8",
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate idea quiz questions")
    parser.add_argument("--book", help="Single book id")
    parser.add_argument("--all", action="store_true", help="Regenerate all books")
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Only books whose ideas lack questions",
    )
    args = parser.parse_args()

    rows = json.loads(SUMMARIES_JSON.read_text(encoding="utf-8"))
    targets = rows

    if args.book:
        targets = [row for row in rows if row["id"] == args.book]
        if not targets:
            raise SystemExit(f"Book not found: {args.book}")

    for row in targets:
        ideas = row["data"]["ideas"]
        if args.skip_existing and all(idea.get("questions") for idea in ideas):
            print(f"skip {row['id']} (already has questions)")
            continue
        if not args.all and not args.book and not args.skip_existing:
            raise SystemExit("Pass --book ID, --skip-existing, or --all")

        print(f"generating questions for {row['id']} ({len(ideas)} ideas)...")
        by_title = generate_for_book(row)
        count = apply_questions(row, by_title)
        save_rows(rows)
        print(f"  ✓ wrote {count} ideas × 3 questions")

    print(f"Done. Updated {SUMMARIES_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
