#!/usr/bin/env python3
"""
Format slide text in summaries.json for RichText (**bold**, *italic*, bullets via •).
Build slide-image-manifest.json with prompts (~1 image per 3 ideas).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUMMARIES = ROOT / "src/data/summaries.json"
MANIFEST = ROOT / "src/data/slide-image-manifest.json"
PROMPTS_DOC = ROOT / "docs/SLIDE_IMAGES.md"

# RichText supports **bold**, *italic*, paragraphs via \n\n, bullets as lines starting with •

VISUAL_KEYWORDS = re.compile(
    r"\b(loop|framework|rule|law|model|system|matrix|cycle|flywheel|"
    r"habit|mindset|equation|formula|trap|bias|engine|lever|principle|"
    r"method|process|steps|layers|zones?|curve|chart|scale|spectrum)\b",
    re.I,
)

ALREADY_FORMATTED = re.compile(r"\*\*[^*]+\*\*")

# Broken output from treating apostrophes as quote delimiters: isn**t, It**s, China**s
APOSTROPHE_BOLD_ARTIFACT = re.compile(r"\b([A-Za-z]{1,24})\*\*([a-z]{1,6})\b")


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", text.strip())
    return [p.strip() for p in parts if p.strip()]


def bold_phrase(match: re.Match) -> str:
    inner = match.group(1)
    if inner.startswith("**"):
        return match.group(0)
    return f"**{inner}**"


def repair_apostrophe_artifacts(text: str) -> str:
    """Fix isn**t / It**s / China**s left by older format_summaries runs."""
    return APOSTROPHE_BOLD_ARTIFACT.sub(r"\1'\2", text)


def strip_markdown(text: str) -> str:
    """Remove ** and * markers for re-processing."""
    text = repair_apostrophe_artifacts(text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    return text


def emphasize_terms(text: str) -> str:
    if "**" in text:
        return text
    # Double-quoted terms only. Do NOT match '...' — apostrophes in
    # isn't / It's / China's were incorrectly wrapped as ** and produced isn**t.
    text = re.sub(r'"([^"]{2,60})"', bold_phrase, text)
    # called X / known as X
    text = re.sub(
        r"\b(called|named|known as)\s+([\"']?)([A-Z][^,.\"']{2,40})\2",
        lambda m: f"{m.group(1)} **{m.group(3).strip()}**",
        text,
    )
    # numbers with units / multipliers
    text = re.sub(
        r"\b(\d+(?:\.\d+)?(?:%|x| times)?(?:\s+better|\s+worse)?)\b",
        bold_phrase,
        text,
        count=2,
    )
    return text


def should_use_bullets(sentences: list[str]) -> bool:
    if len(sentences) < 3:
        return False
    starters = [s.split()[0].lower() if s.split() else "" for s in sentences]
    # parallel imperatives / you-statements
    you_count = sum(1 for s in sentences if s.lower().startswith("you "))
    if you_count >= 3:
        return True
    # short punchy lines
    if len(sentences) >= 3 and all(len(s) < 120 for s in sentences):
        shared = max(starters.count(st) for st in set(starters) if st)
        if shared >= 2:
            return True
    return False


def to_bullets(sentences: list[str]) -> str:
    lines: list[str] = []
    for s in sentences:
        s = emphasize_terms(s)
        if "**" not in s:
            # bold a meaningful phrase: text before em-dash, or first clause
            if " — " in s:
                head, tail = s.split(" — ", 1)
                s = f"**{head.strip()}** — {tail.strip()}"
            else:
                m = re.match(r"^([^.!?]{8,45}[.!?]?)\s*", s)
                if m and len(m.group(1)) < len(s) * 0.6:
                    lead = m.group(1).strip().rstrip(".!?")
                    rest = s[len(m.group(1)) :].strip()
                    s = f"**{lead}** — {rest}" if rest else f"**{lead}**"
        lines.append(f"• {s}")
    return "\n".join(lines)


def format_paragraphs(sentences: list[str]) -> str:
    chunks: list[str] = []
    i = 0
    while i < len(sentences):
        group = sentences[i : i + 2]
        chunk = " ".join(emphasize_terms(s) for s in group)
        # bold opening clause of first paragraph chunk on multi-chunk screens
        if i == 0 and len(sentences) > 2 and "**" not in chunk.split(".")[0]:
            first = group[0]
            m = re.match(r"^([^.!?]{10,50}[.!?])", first)
            if m:
                lead = m.group(1).strip()
                rest_first = first[len(m.group(1)) :].strip()
                chunk = f"**{lead.rstrip('.!?')}**. {emphasize_terms(rest_first)}"
                if len(group) > 1:
                    chunk += " " + emphasize_terms(group[1])
        chunks.append(chunk)
        i += 2
    return "\n\n".join(chunks)


def format_screen(text: str, *, is_first: bool, idea_title: str) -> str:
    text = strip_markdown(text.strip())
    if not text:
        return text
    sentences = split_sentences(text)
    if not sentences:
        return emphasize_terms(text)
    if should_use_bullets(sentences):
        body = to_bullets(sentences)
    else:
        body = format_paragraphs(sentences)
    if is_first and idea_title and not body.startswith("**"):
        # hook: bold idea-aligned opener when short
        first_line = body.split("\n\n")[0]
        words = first_line.split()
        if len(words) >= 4:
            pass  # already handled in paragraphs
    return body


def format_card_summary(text: str) -> str:
    text = strip_markdown(text)
    sentences = split_sentences(text)
    if not sentences:
        return emphasize_terms(text)
    first = emphasize_terms(sentences[0])
    if not first.startswith("**") and len(sentences[0]) > 20:
        m = re.match(r"^(.{15,55}?[.!?])\s*", sentences[0])
        if m:
            lead = m.group(1).strip().rstrip(".!?")
            rest = sentences[0][len(m.group(1)) :].strip()
            first = f"**{lead}**. {emphasize_terms(rest)}" if rest else f"**{lead}**"
        else:
            first = emphasize_terms(sentences[0])
    rest = " ".join(emphasize_terms(s) for s in sentences[1:])
    return first + (" " + rest if rest else "")


def format_card_bullets(bullets: list[str]) -> list[str]:
    out: list[str] = []
    for b in bullets:
        b = strip_markdown(b.strip())
        # bold the leading phrase before em dash or colon
        for sep in (" — ", " - ", ": "):
            if sep in b:
                head, tail = b.split(sep, 1)
                out.append(f"**{head.strip()}**{sep}{tail.strip()}")
                break
        else:
            words = b.split()
            if len(words) > 5:
                out.append(f"**{' '.join(words[:3])}** — {' '.join(words[3:])}")
            else:
                out.append(f"**{b}**" if len(b) < 40 else emphasize_terms(b))
    return out


def format_highlight(text: str) -> str:
    text = strip_markdown(text.strip())
    return f"**{text.rstrip('.')}**"


def score_visual_idea(idea: dict) -> int:
    """Higher = better candidate for a slide illustration."""
    title = idea.get("title", "")
    hook = (idea.get("screens") or [""])[0]
    score = 0
    if VISUAL_KEYWORDS.search(title):
        score += 3
    if VISUAL_KEYWORDS.search(hook[:200]):
        score += 1
    # concrete metaphors in title
    if re.search(r"\b(mirror|barbell|flywheel|loop|ladder|iceberg|map|bridge|wheel|chain|stack|funnel)\b", title, re.I):
        score += 2
    return score


def pick_idea_for_image(ideas: list[dict]) -> int | None:
    """At most one illustration per book — pick the most visual idea, or skip if none stand out."""
    if not ideas:
        return None
    scored = [(i, score_visual_idea(idea)) for i, idea in enumerate(ideas)]
    best_index, best_score = max(scored, key=lambda x: x[1])
    if best_score >= 2:
        return best_index
    # fallback: first idea only for books with 3+ ideas (hero concept)
    if len(ideas) >= 3:
        return 0
    return None


def wants_slide_image(book_id: str, idea_index: int, idea: dict, chosen_index: int | None) -> bool:
    return chosen_index is not None and idea_index == chosen_index


def build_image_prompt(book_id: str, idea: dict) -> str:
    title = idea["title"]
    hook = (idea.get("screens") or [""])[0][:180]
    return (
        "Horizontal 16:9 illustration for a microlearning slide. "
        "Minimal editorial flat style, warm cream #FDF6F0 background, "
        "brown #5C3D3A accents, soft shadows. "
        f'Topic from book "{book_id.replace("_", " ")}": {title}. '
        f"Visual metaphor for: {hook[:120]}. "
        "NO text, NO logos, NO typography. Abstract symbolic scene, original artwork."
    )


def repair_text_tree(value: object) -> object:
    """Recursively repair apostrophe-bold artifacts in nested summary strings."""
    if isinstance(value, str):
        return repair_apostrophe_artifacts(value)
    if isinstance(value, list):
        return [repair_text_tree(item) for item in value]
    if isinstance(value, dict):
        return {key: repair_text_tree(item) for key, item in value.items()}
    return value


def process_summaries(rows: list[dict], *, reformat: bool = True) -> tuple[list[dict], dict]:
    manifest_images: dict = {}
    for row in rows:
        # Always repair shipped text, even when skipping full reformat.
        if "data" in row:
            row["data"] = repair_text_tree(row["data"])  # type: ignore[assignment]

        book_id = row["id"]
        ideas = row.get("data", {}).get("ideas") or []
        chosen_image_index = pick_idea_for_image(ideas)
        for idea_index, idea in enumerate(ideas):
            if reformat:
                screens = idea.get("screens") or []
                idea["screens"] = [
                    format_screen(
                        s,
                        is_first=(i == 0),
                        idea_title=idea.get("title", ""),
                    )
                    for i, s in enumerate(screens)
                ]
                card = idea.get("card") or {}
                if card.get("summary"):
                    card["summary"] = format_card_summary(card["summary"])
                if card.get("bullets"):
                    card["bullets"] = format_card_bullets(card["bullets"])
                if card.get("highlight"):
                    card["highlight"] = format_highlight(card["highlight"])
                idea["card"] = card

            if wants_slide_image(book_id, idea_index, idea, chosen_image_index):
                key = f"{book_id}:{idea_index}"
                manifest_images[key] = {
                    "book_id": book_id,
                    "idea_index": idea_index,
                    "idea_title": idea.get("title", ""),
                    "file": f"assets/images/books/{book_id}/idea-{idea_index}.png",
                    "register_as": f"'{key}': require('@/assets/images/books/{book_id}/idea-{idea_index}.png')",
                    "prompt": build_image_prompt(book_id, idea),
                }
    manifest = {
        "version": 1,
        "note": "Register generated files in src/data/book-images.ts SLIDE_IMAGES. Keys match books.ts slide.image on first screen only.",
        "images": manifest_images,
    }
    return rows, manifest


def write_prompts_doc(manifest: dict) -> None:
    lines = [
        "# Slide image generation queue",
        "",
        "One illustration per selected idea (first content slide only). "
        "Generate PNG at **800×450** (16:9), then register in `src/data/book-images.ts`.",
        "",
        f"**Total queued:** {len(manifest['images'])}",
        "",
        "## Register pattern",
        "",
        "```typescript",
        "// src/data/book-images.ts → SLIDE_IMAGES",
        "'atomic_habits:0': require('@/assets/images/books/atomic_habits/idea-0.png'),",
        "```",
        "",
        "## Prompts",
        "",
    ]
    by_book: dict[str, list] = {}
    for key, entry in sorted(manifest["images"].items()):
        by_book.setdefault(entry["book_id"], []).append((key, entry))

    for book_id, items in sorted(by_book.items()):
        lines.append(f"### `{book_id}`")
        lines.append("")
        for key, entry in items:
            lines.append(f"#### `{key}` — {entry['idea_title']}")
            lines.append("")
            lines.append(f"- **File:** `{entry['file']}`")
            lines.append(f"- **Prompt:** {entry['prompt']}")
            lines.append("")
    PROMPTS_DOC.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repair-only",
        action="store_true",
        help="Only fix isn**t / It**s artifacts; do not re-run emphasize/bullet formatting",
    )
    parser.add_argument(
        "--scrub-flags",
        action="store_true",
        help="Normalize flags[] (drop OK / all-clear essays); can combine with --repair-only",
    )
    args = parser.parse_args()

    rows = json.loads(SUMMARIES.read_text(encoding="utf-8"))
    rows, manifest = process_summaries(rows, reformat=not args.repair_only)

    flags_changed = 0
    if args.scrub_flags or args.repair_only:
        sys.path.insert(0, str(ROOT / "scripts"))
        from book_pipeline import scrub_row_flags  # noqa: E402

        for row in rows:
            if scrub_row_flags(row):
                flags_changed += 1

    SUMMARIES.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not args.repair_only:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        write_prompts_doc(manifest)
        print(f"Formatted {len(rows)} books")
        print(f"Slide images queued: {len(manifest['images'])}")
        print(f"Wrote {MANIFEST.relative_to(ROOT)}")
        print(f"Wrote {PROMPTS_DOC.relative_to(ROOT)}")
    else:
        print(f"Repaired apostrophe artifacts in {len(rows)} books (no reformat)")
    if args.scrub_flags or args.repair_only:
        print(f"Scrubbed flags on {flags_changed} books")


if __name__ == "__main__":
    main()
