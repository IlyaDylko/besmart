#!/usr/bin/env python3
"""
Generate BeSmart book covers using whole_json_script/book_gen_google.py.

Prefer the unified pipeline:
  python3 generate_content_cursor.py --covers-only --skip-existing

This script is a thin wrapper for the same logic.

Requirements:
  pip install -r scripts/requirements-covers.txt
  cursor-agent login   # once, for illustration concepts
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from book_pipeline import cover_exists, ensure_cover, load_all_rows, load_catalog  # noqa: E402

STYLE_LABELS = {
    "besmart": "BeSmart — large title top, author below, full relevant illustration",
    "faber": "Faber — spot illustration, solid background, large type",
    "marber": "Marber — top typography grid + full illustration",
    "ast": "AST — art block + color bands, bold title",
    "penguin": "Penguin — tri-band horizontal stripes",
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate BeSmart book covers")
    parser.add_argument("--book", help="Generate only one book id")
    parser.add_argument("--skip-existing", action="store_true", help="Skip books with cover.png")
    parser.add_argument("--no-3d", action="store_true", help="Disable 3D mockup shading")
    parser.add_argument(
        "--style",
        choices=["besmart", "ast", "marber", "faber", "penguin"],
        help="Force a cover template",
    )
    parser.add_argument(
        "--ai-style",
        action="store_true",
        help="Let cursor-agent pick style (defaults to category mapping)",
    )
    args = parser.parse_args()

    catalog = load_catalog()
    by_id, order = load_all_rows()

    if args.book:
        if args.book not in by_id:
            raise SystemExit(f"Book not found in summaries: {args.book}")
        targets = [args.book]
    else:
        targets = order

    print(f"=== BESMART COVER GENERATION ({len(targets)} books) ===")
    if args.style:
        print(f"Style: {args.style.upper()} — {STYLE_LABELS[args.style]}")
    print("Concepts: cursor-agent | Art: Pollinations")

    done = 0
    for book_id in targets:
        if args.skip_existing and cover_exists(book_id):
            print(f"Skipping {book_id} (cover exists)")
            continue
        meta = catalog.get(book_id)
        if not meta:
            raise SystemExit(f"No catalog entry for {book_id}")
        print("\n========================================")
        print(f" {meta['title']} — {meta['author']}")
        print(f" id: {book_id} | category: {meta['category']}")
        print("========================================")
        ensure_cover(
            book_id,
            catalog,
            skip_existing=False,
            use_3d=not args.no_3d,
            force_style=args.style,
            use_ai_style=args.ai_style,
        )
        done += 1

    print(f"\n=== DONE ({done} covers) ===")
    print("Restart Metro with cache clear if the app is running: npx expo start --clear")


if __name__ == "__main__":
    main()
