#!/usr/bin/env python3
"""
Generate 16:9 slide illustrations for every book idea missing idea-N.png.

Uses Pollinations (same stack as cover art). Skips files that already exist.

  python3 scripts/generate_slide_images.py --skip-existing
  python3 scripts/generate_slide_images.py --book atomic_habits --skip-existing
  python3 scripts/generate_slide_images.py --limit 5   # dry-run small batch

After images are written, rewrites src/data/book-images.ts SLIDE_IMAGES from disk
and refreshes slide-image-manifest.json prompts for all ideas.
"""

from __future__ import annotations

import argparse
import json
import random
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from format_summaries import build_image_prompt  # noqa: E402

BOOKS_ROOT = ROOT / "assets" / "images" / "books"
SUMMARIES = ROOT / "src" / "data" / "summaries.json"
BOOK_IMAGES_TS = ROOT / "src" / "data" / "book-images.ts"
MANIFEST = ROOT / "src" / "data" / "slide-image-manifest.json"

WIDTH = 800
HEIGHT = 450

try:
    import certifi
    from PIL import Image

    _SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Install cover deps first: pip install -r scripts/requirements-covers.txt"
    ) from exc


def load_rows() -> list[dict]:
    return json.loads(SUMMARIES.read_text(encoding="utf-8"))


def idea_path(book_id: str, idea_index: int) -> Path:
    return BOOKS_ROOT / book_id / f"idea-{idea_index}.png"


def iter_targets(rows: list[dict], book_id: str | None) -> list[tuple[str, int, dict]]:
    out: list[tuple[str, int, dict]] = []
    for row in rows:
        bid = row["id"]
        if book_id and bid != book_id:
            continue
        ideas = row.get("data", {}).get("ideas") or []
        for idx, idea in enumerate(ideas):
            out.append((bid, idx, idea))
    return out


def fetch_image(prompt: str) -> Image.Image:
    full_prompt = urllib.parse.quote(prompt)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://pollinations.ai/",
    }
    last_error: Exception | None = None
    for attempt in range(6):
        try:
            seed = random.randint(1, 1_000_000)
            url = (
                f"https://image.pollinations.ai/prompt/{full_prompt}"
                f"?width={WIDTH}&height={HEIGHT}&seed={seed}&model=flux&nologo=true&enhance=false"
            )
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=90, context=_SSL_CONTEXT) as response:
                data = response.read()
            if len(data) < 8_000:
                raise RuntimeError(f"tiny response ({len(data)} bytes)")
            img = Image.open(BytesIO(data)).convert("RGB")
            if img.size != (WIDTH, HEIGHT):
                img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
            return img
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            print(f"    …attempt {attempt + 1} failed: {exc}", flush=True)
            # Pollinations rate-limits hard — back off longer on 429.
            delay = 8 + attempt * 5 if "429" in str(exc) else 3 + attempt
            time.sleep(delay)
    raise RuntimeError(f"Pollinations failed after retries: {last_error}")


def rewrite_slide_images_ts() -> int:
    """Replace SLIDE_IMAGES object with every idea-*.png found on disk."""
    entries: list[tuple[str, int, Path]] = []
    for path in sorted(BOOKS_ROOT.glob("*/idea-*.png")):
        book_id = path.parent.name
        match = re.fullmatch(r"idea-(\d+)\.png", path.name)
        if not match:
            continue
        entries.append((book_id, int(match.group(1)), path))

    entries.sort(key=lambda item: (item[0], item[1]))
    lines = ["export const SLIDE_IMAGES: Partial<Record<string, ImageSourcePropType>> = {"]
    for book_id, idx, path in entries:
        rel = path.relative_to(ROOT / "assets" / "images" / "books")
        # require path from @/assets/images/books/...
        require_path = f"@/assets/images/books/{rel.as_posix()}"
        lines.append(f"  '{book_id}:{idx}': require('{require_path}'),")
    lines.append("};")
    new_block = "\n".join(lines)

    text = BOOK_IMAGES_TS.read_text(encoding="utf-8")
    pattern = re.compile(
        r"export const SLIDE_IMAGES: Partial<Record<string, ImageSourcePropType>> = \{.*?\n\};",
        re.S,
    )
    if not pattern.search(text):
        raise SystemExit("Could not find SLIDE_IMAGES block in book-images.ts")
    BOOK_IMAGES_TS.write_text(pattern.sub(new_block, text), encoding="utf-8")
    return len(entries)


def rewrite_manifest(rows: list[dict]) -> int:
    images: dict[str, dict] = {}
    for row in rows:
        book_id = row["id"]
        ideas = row.get("data", {}).get("ideas") or []
        for idx, idea in enumerate(ideas):
            key = f"{book_id}:{idx}"
            images[key] = {
                "book_id": book_id,
                "idea_index": idx,
                "idea_title": idea.get("title", ""),
                "file": f"assets/images/books/{book_id}/idea-{idx}.png",
                "register_as": (
                    f"'{key}': require('@/assets/images/books/{book_id}/idea-{idx}.png')"
                ),
                "prompt": build_image_prompt(book_id, idea),
                "exists": idea_path(book_id, idx).exists(),
            }
    manifest = {
        "version": 2,
        "note": (
            "Prompts for all ideas. App loads images via SLIDE_IMAGES in book-images.ts "
            "(hasSlideImage). Generate with scripts/generate_slide_images.py."
        ),
        "images": images,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(images)


def generate_one(book_id: str, idx: int, idea: dict, sleep_s: float) -> tuple[str, bool, str]:
    """Returns (key, ok, message)."""
    key = f"{book_id}:{idx}"
    path = idea_path(book_id, idx)
    title = idea.get("title", "")
    try:
        prompt = build_image_prompt(book_id, idea)
        img = fetch_image(prompt)
        path.parent.mkdir(parents=True, exist_ok=True)
        img.save(path, format="PNG", optimize=True)
        if sleep_s > 0:
            time.sleep(sleep_s)
        return key, True, f"✓ {key} — {title}"
    except Exception as exc:  # noqa: BLE001
        return key, False, f"✗ {key} — {exc}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate missing idea slide images")
    parser.add_argument("--book", help="Only this book id")
    parser.add_argument("--skip-existing", action="store_true", help="Skip idea-N.png that exist")
    parser.add_argument("--limit", type=int, default=0, help="Max new images to generate (0=all)")
    parser.add_argument(
        "--register-only",
        action="store_true",
        help="Only rewrite SLIDE_IMAGES + manifest from disk / summaries",
    )
    parser.add_argument("--sleep", type=float, default=0.4, help="Pause after each successful download")
    parser.add_argument("--workers", type=int, default=4, help="Parallel Pollinations requests")
    args = parser.parse_args()

    rows = load_rows()
    targets = iter_targets(rows, args.book)
    print(f"Ideas in scope: {len(targets)}", flush=True)

    if args.register_only:
        n = rewrite_slide_images_ts()
        m = rewrite_manifest(rows)
        print(f"Registered {n} SLIDE_IMAGES; manifest entries {m}", flush=True)
        return

    pending: list[tuple[str, int, dict]] = []
    skipped = 0
    for book_id, idx, idea in targets:
        if args.skip_existing and idea_path(book_id, idx).exists():
            skipped += 1
            continue
        pending.append((book_id, idx, idea))
        if args.limit and len(pending) >= args.limit:
            break

    print(
        f"To generate: {len(pending)} | skip existing: {skipped} | workers: {args.workers}",
        flush=True,
    )

    generated = 0
    failed = 0
    completed = 0

    from concurrent.futures import ThreadPoolExecutor, as_completed

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = [
            pool.submit(generate_one, book_id, idx, idea, args.sleep)
            for book_id, idx, idea in pending
        ]
        for future in as_completed(futures):
            _key, ok, message = future.result()
            completed += 1
            if ok:
                generated += 1
            else:
                failed += 1
            print(f"[{completed}/{len(pending)}] {message}", flush=True)
            if generated > 0 and generated % 20 == 0:
                n = rewrite_slide_images_ts()
                print(f"   …checkpoint: SLIDE_IMAGES={n}", flush=True)

    n = rewrite_slide_images_ts()
    m = rewrite_manifest(rows)
    print(
        f"\nDone. generated={generated} skipped={skipped} failed={failed} "
        f"SLIDE_IMAGES={n} manifest={m}",
        flush=True,
    )


if __name__ == "__main__":
    main()
