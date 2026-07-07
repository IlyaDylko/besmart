#!/usr/bin/env python3
"""Add title + author to each row in summaries.json and summaries.jsonl from book-catalog.ts."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/data/book-catalog.ts"
SUMMARIES_JSON = ROOT / "src/data/summaries.json"
SUMMARIES_JSONL = ROOT / "summaries.jsonl"


def load_catalog() -> dict[str, dict[str, str]]:
    text = CATALOG.read_text(encoding="utf-8")
    catalog: dict[str, dict[str, str]] = {}
    for match in re.finditer(
        r"(\w+):\s*\{\s*title:\s*['\"](.+?)['\"],\s*author:\s*['\"](.+?)['\"]",
        text,
        re.DOTALL,
    ):
        catalog[match.group(1)] = {
            "title": match.group(2),
            "author": match.group(3),
        }
    return catalog


def main() -> None:
    catalog = load_catalog()
    rows = json.loads(SUMMARIES_JSON.read_text(encoding="utf-8"))

    updated = 0
    for row in rows:
        meta = catalog.get(row["id"])
        if not meta:
            print(f"Warning: no catalog entry for {row['id']}")
            continue
        row["title"] = meta["title"]
        row["author"] = meta["author"]
        updated += 1

    SUMMARIES_JSON.write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    if SUMMARIES_JSONL.exists():
        lines = []
        for row in rows:
            lines.append(json.dumps(row, ensure_ascii=False))
        SUMMARIES_JSONL.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Updated {updated} books with title + author")
    print(f"Wrote {SUMMARIES_JSON.relative_to(ROOT)}")
    if SUMMARIES_JSONL.exists():
        print(f"Wrote {SUMMARIES_JSONL.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
