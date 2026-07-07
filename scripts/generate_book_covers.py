#!/usr/bin/env python3
"""
Generate BeSmart book covers using whole_json_script/book_gen_google.py.

Reads title + author + category from src/data/summaries.json + book-catalog.ts.
Style is picked by category (not always Penguin). Art concepts via cursor-agent.

Requirements:
  pip install -r scripts/requirements-covers.txt
  cursor-agent login   # once, for illustration concepts only

Usage:
  python3 scripts/generate_book_covers.py
  python3 scripts/generate_book_covers.py --book atomic_habits
  python3 scripts/generate_book_covers.py --style faber
  python3 scripts/generate_book_covers.py --ai-style   # let cursor-agent pick style
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WHOLE_JSON = ROOT / "whole_json_script"
sys.path.insert(0, str(WHOLE_JSON))

from book_gen_google import BookGenerator  # noqa: E402

SUMMARIES = ROOT / "src/data/summaries.json"
CATALOG = ROOT / "src/data/book-catalog.ts"
OUTPUT_ROOT = ROOT / "assets/images/books"

# BeSmart categories -> cover templates (avoid Penguin stripes as default)
STYLE_BY_CATEGORY: dict[str, str] = {
    "HABITS": "faber",
    "GROWTH": "faber",
    "COMMUNICATION": "faber",
    "MONEY": "marber",
    "BUSINESS": "marber",
    "PSYCHOLOGY": "ast",
    "DECISIONS": "ast",
}

STYLE_LABELS = {
    "faber": "Faber — spot illustration, solid background, large type",
    "marber": "Marber — top typography grid + full illustration",
    "ast": "AST — art block + color bands, bold title",
    "penguin": "Penguin — tri-band horizontal stripes",
}


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


def load_books() -> list[dict[str, str]]:
    catalog = load_catalog()
    rows = json.loads(SUMMARIES.read_text(encoding="utf-8"))
    books: list[dict[str, str]] = []
    for row in rows:
        book_id = row["id"]
        meta = catalog.get(book_id)
        if not meta:
            raise SystemExit(f"No catalog entry for {book_id}")
        books.append(
            {
                "id": book_id,
                "title": row.get("title") or meta["title"],
                "author": row.get("author") or meta["author"],
                "category": meta["category"],
            }
        )
    return books


def pick_style(book: dict[str, str], *, force_style: str | None, use_ai: bool, gen: BookGenerator) -> str:
    if force_style:
        return force_style
    if use_ai:
        return gen.get_recommended_style(book["title"], book["author"])
    return STYLE_BY_CATEGORY.get(book["category"], "faber")


class BeSmartCoverGenerator(BookGenerator):
    def __init__(self, output_dir: Path, *, use_3d: bool = True):
        super().__init__(width=680, height=900, use_3d=use_3d)
        self.output_dir = output_dir

    def finalize_and_save(self, img, filename_base, title):
        self.output_dir.mkdir(parents=True, exist_ok=True)
        save_path = self.output_dir / "cover.png"

        final_img = img
        if self.use_3d:
            final_img = self.apply_3d_mockup(final_img)

        final_img.save(save_path)
        print(f" -> Saved cover ({final_img.size[0]}x{final_img.size[1]}) to: {save_path}")


def generate_cover(
    book: dict[str, str],
    *,
    use_3d: bool,
    force_style: str | None,
    use_ai_style: bool,
) -> None:
    print("\n========================================")
    print(f" {book['title']} — {book['author']}")
    print(f" id: {book['id']} | category: {book['category']}")
    print("========================================")

    gen = BeSmartCoverGenerator(
        output_dir=OUTPUT_ROOT / book["id"],
        use_3d=use_3d,
    )

    title = book["title"]
    author = book["author"]

    previous_cwd = Path.cwd()
    os.chdir(WHOLE_JSON)
    try:
        style = pick_style(book, force_style=force_style, use_ai=use_ai_style, gen=gen)
        print(f" -> Template: {style.upper()} — {STYLE_LABELS[style]}")

        if style == "ast":
            gen.create_ast(title, author)
        elif style == "marber":
            gen.create_marber(title, author)
        elif style == "faber":
            gen.create_faber(title, author)
        else:
            gen.create_penguin(title, author)
    finally:
        os.chdir(previous_cwd)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate BeSmart book covers")
    parser.add_argument("--book", help="Generate only one book id")
    parser.add_argument("--skip-existing", action="store_true", help="Skip books with cover.png")
    parser.add_argument("--no-3d", action="store_true", help="Disable 3D mockup shading")
    parser.add_argument(
        "--style",
        choices=["ast", "marber", "faber", "penguin"],
        help="Force a cover template",
    )
    parser.add_argument(
        "--ai-style",
        action="store_true",
        help="Let cursor-agent pick style (defaults to category mapping)",
    )
    args = parser.parse_args()

    books = load_books()

    if args.book:
        books = [book for book in books if book["id"] == args.book]
        if not books:
            raise SystemExit(f"Book not found: {args.book}")

    print(f"=== BESMART COVER GENERATION ({len(books)} books) ===")
    print("Styles: category map | Concepts: cursor-agent | Art: Pollinations")

    for book in books:
        output_path = OUTPUT_ROOT / book["id"] / "cover.png"
        if args.skip_existing and output_path.exists():
            print(f"Skipping {book['id']} (cover exists)")
            continue

        generate_cover(
            book,
            use_3d=not args.no_3d,
            force_style=args.style,
            use_ai_style=args.ai_style,
        )

    print("\n=== DONE ===")
    print("Restart Metro with cache clear if the app is running: npx expo start --clear")


if __name__ == "__main__":
    main()
