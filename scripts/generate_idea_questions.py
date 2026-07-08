#!/usr/bin/env python3
"""
Generate 3 comprehension quiz questions per book idea in summaries.json.

Prefer the unified pipeline:
  python3 generate_content_cursor.py --questions-only --skip-existing

This script is a thin wrapper for the same logic.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from book_pipeline import (  # noqa: E402
    attach_metadata,
    ensure_questions,
    format_summaries,
    ideas_need_questions,
    load_all_rows,
    load_catalog,
    save_rows,
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

    if not args.all and not args.book and not args.skip_existing:
        raise SystemExit(
            "Pass --book ID, --skip-existing, or --all\n"
            "Or use: python3 generate_content_cursor.py --questions-only"
        )

    catalog = load_catalog()
    by_id, order = load_all_rows()
    targets = [args.book] if args.book else order

    if args.book and args.book not in by_id:
        raise SystemExit(f"Book not found: {args.book}")

    updated = 0
    for book_id in targets:
        row = by_id.get(book_id)
        if not row:
            continue
        if args.skip_existing and not ideas_need_questions(row):
            print(f"skip {book_id} (already has questions)")
            continue

        row = attach_metadata(row, catalog)
        print(f"generating questions for {book_id} ({len(row['data']['ideas'])} ideas)...")
        ensure_questions(row, force=args.all)
        by_id[book_id] = row
        updated += 1
        print(f"  ✓ wrote {len(row['data']['ideas'])} ideas × 3 questions")

    if updated:
        save_rows(by_id, order)
        format_summaries()

    print(f"Done. Updated {updated} book(s).")


if __name__ == "__main__":
    main()
