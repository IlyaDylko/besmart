#!/usr/bin/env python3
"""Shared helpers for BeSmart book content: summaries, questions, covers, formatting."""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
WHOLE_JSON = ROOT / "whole_json_script"
SUMMARIES_JSONL = ROOT / "summaries.jsonl"
SUMMARIES_JSON = ROOT / "src/data/summaries.json"
CATALOG = ROOT / "src/data/book-catalog.ts"
COVERS_ROOT = ROOT / "assets/images/books"
MANIFEST = ROOT / "src/data/slide-image-manifest.json"

QUESTIONS_MODEL = "composer-2.5"

STYLE_BY_CATEGORY: dict[str, str] = {
    "HABITS": "besmart",
    "GROWTH": "besmart",
    "COMMUNICATION": "besmart",
    "MONEY": "besmart",
    "BUSINESS": "besmart",
    "PSYCHOLOGY": "besmart",
    "DECISIONS": "besmart",
}


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

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


def is_summary_complete(data: dict) -> bool:
    if not isinstance(data, dict) or not data.get("hook"):
        return False
    ideas = data.get("ideas")
    if not isinstance(ideas, list) or len(ideas) < 6:
        return False
    for idea in ideas:
        if not isinstance(idea, dict):
            return False
        if not idea.get("title") or not idea.get("read_minutes"):
            return False
        screens = idea.get("screens")
        if not isinstance(screens, list) or len(screens) < 2:
            return False
        card = idea.get("card")
        if not isinstance(card, dict):
            return False
        if not card.get("summary") or not card.get("bullets") or not card.get("highlight"):
            return False
        if not validate_questions(idea.get("questions")):
            return False
    return True


def ideas_need_questions(row: dict) -> bool:
    ideas = row.get("data", {}).get("ideas") or []
    return any(not validate_questions(idea.get("questions")) for idea in ideas)


# ---------------------------------------------------------------------------
# Catalog + storage
# ---------------------------------------------------------------------------

def load_catalog() -> dict[str, dict[str, str]]:
    text = CATALOG.read_text(encoding="utf-8")
    catalog: dict[str, dict[str, str]] = {}
    for match in re.finditer(
        r"(\w+):\s*\{[^}]*title:\s*['\"](.+?)['\"][^}]*author:\s*['\"](.+?)['\"][^}]*category:\s*['\"](\w+)['\"]",
        text,
        re.DOTALL,
    ):
        catalog[match.group(1)] = {
            "title": match.group(2),
            "author": match.group(3),
            "category": match.group(4),
        }
    return catalog


def catalog_books() -> list[dict[str, str]]:
    catalog = load_catalog()
    return [
        {"id": book_id, **meta}
        for book_id, meta in sorted(catalog.items())
    ]


def load_all_rows() -> tuple[dict[str, dict], list[str]]:
    by_id: dict[str, dict] = {}
    order: list[str] = []

    if SUMMARIES_JSON.exists():
        for row in json.loads(SUMMARIES_JSON.read_text(encoding="utf-8")):
            by_id[row["id"]] = row
            order.append(row["id"])

    if SUMMARIES_JSONL.exists():
        for line in SUMMARIES_JSONL.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            book_id = row.get("id")
            if not book_id:
                continue
            if book_id not in by_id:
                order.append(book_id)
            by_id[book_id] = row

    return by_id, order


def save_rows(by_id: dict[str, dict], order: list[str]) -> None:
    rows = [by_id[book_id] for book_id in order if book_id in by_id]
    SUMMARIES_JSON.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    SUMMARIES_JSONL.write_text(
        "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
        encoding="utf-8",
    )


def upsert_row(row: dict) -> None:
    by_id, order = load_all_rows()
    book_id = row["id"]
    if book_id not in by_id:
        order.append(book_id)
    by_id[book_id] = row
    save_rows(by_id, order)


def attach_metadata(row: dict, catalog: dict[str, dict[str, str]]) -> dict:
    meta = catalog.get(row["id"], {})
    row["title"] = meta.get("title", row.get("title", row["id"]))
    row["author"] = meta.get("author", row.get("author", "Unknown"))
    return row


# ---------------------------------------------------------------------------
# Questions
# ---------------------------------------------------------------------------

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


def build_questions_prompt(row: dict) -> str:
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


def generate_questions_for_row(row: dict, *, model: str = QUESTIONS_MODEL) -> dict[str, list]:
    sys.path.insert(0, str(WHOLE_JSON))
    from cursor_llm import ask_json  # noqa: E402

    system = (
        "You write short comprehension quizzes for a microlearning app. "
        "English only. Respond with valid JSON only."
    )
    payload = ask_json(system, build_questions_prompt(row), model=model)
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


def ensure_questions(row: dict, *, force: bool = False, model: str = QUESTIONS_MODEL) -> bool:
    if not force and not ideas_need_questions(row):
        return False
    by_title = generate_questions_for_row(row, model=model)
    apply_questions(row, by_title)
    return True


# ---------------------------------------------------------------------------
# Formatting
# ---------------------------------------------------------------------------

def format_summaries() -> None:
    sys.path.insert(0, str(SCRIPTS))
    from format_summaries import process_summaries, write_prompts_doc  # noqa: E402

    rows = json.loads(SUMMARIES_JSON.read_text(encoding="utf-8"))
    rows, manifest = process_summaries(rows)
    SUMMARIES_JSON.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_prompts_doc(manifest)


# ---------------------------------------------------------------------------
# Covers
# ---------------------------------------------------------------------------

def cover_exists(book_id: str) -> bool:
    return (COVERS_ROOT / book_id / "cover.png").exists()


def build_cover_context(book_id: str) -> str:
    by_id, _ = load_all_rows()
    row = by_id.get(book_id) or {}
    data = row.get("data") or {}
    ideas = data.get("ideas") or []
    snippets: list[str] = []

    if data.get("hook"):
        snippets.append(f"Hook: {data['hook']}")

    for idea in ideas[:4]:
        card = idea.get("card") or {}
        title = idea.get("title", "")
        summary = card.get("summary") or ""
        if title or summary:
            snippets.append(f"- {title}: {summary[:220]}")

    return "\n".join(snippets)


def generate_cover(
    book: dict[str, str],
    *,
    use_3d: bool = True,
    force_style: str | None = None,
    use_ai_style: bool = False,
) -> None:
    sys.path.insert(0, str(WHOLE_JSON))
    from book_gen_google import BookGenerator  # noqa: E402

    class BeSmartCoverGenerator(BookGenerator):
        def __init__(self, output_dir: Path):
            super().__init__(width=600, height=900, use_3d=use_3d)
            self.output_dir = output_dir

        def finalize_and_save(self, img, filename_base, title):
            self.output_dir.mkdir(parents=True, exist_ok=True)
            save_path = self.output_dir / "cover.png"
            final_img = self.apply_3d_mockup(img) if self.use_3d else img
            final_img.save(save_path)
            print(f"   ✓ cover saved ({final_img.size[0]}x{final_img.size[1]}): {save_path}")

    print(f"   → cover: {book['title']}")
    gen = BeSmartCoverGenerator(output_dir=COVERS_ROOT / book["id"])
    summary_context = build_cover_context(book["id"])

    previous_cwd = Path.cwd()
    os.chdir(WHOLE_JSON)
    try:
        if force_style:
            style = force_style
        elif use_ai_style:
            style = gen.get_recommended_style(book["title"], book["author"])
        else:
            style = STYLE_BY_CATEGORY.get(book["category"], "besmart")

        print(f"   → template: {style.upper()}")
        if style == "besmart":
            gen.use_3d = False
            gen.create_besmart(book["title"], book["author"], summary_context=summary_context)
        elif style == "ast":
            gen.create_ast(book["title"], book["author"])
        elif style == "marber":
            gen.create_marber(book["title"], book["author"])
        elif style == "faber":
            gen.create_faber(book["title"], book["author"])
        else:
            gen.create_penguin(book["title"], book["author"])
    finally:
        os.chdir(previous_cwd)


def ensure_cover(
    book_id: str,
    catalog: dict[str, dict[str, str]],
    *,
    skip_existing: bool = True,
    use_3d: bool = True,
    force_style: str | None = None,
    use_ai_style: bool = False,
) -> bool:
    if skip_existing and cover_exists(book_id):
        print(f"   skip cover ({book_id}: already exists)")
        return False
    meta = catalog.get(book_id)
    if not meta:
        raise ValueError(f"No catalog entry for {book_id}")
    generate_cover(
        {"id": book_id, **meta},
        use_3d=use_3d,
        force_style=force_style,
        use_ai_style=use_ai_style,
    )
    return True
