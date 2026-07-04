"""
Генерация книжных саммари через Cursor CLI (в рамках подписки Cursor),
без прямого ключа Anthropic.

Как это работает:
  - Вместо anthropic.Anthropic() дёргаем локальный бинарь `cursor-agent`
    в headless-режиме: `cursor-agent -p --output-format json`.
  - Оплата идёт по твоему плану Cursor (те же пулы, что и в IDE):
      * модели Auto / Composer   -> щедрый included-пул (фактически «в подписке»)
      * премиальные (Claude/GPT) -> пул API ($20 на Pro, дальше pay-as-you-go)
  - Аутентификация один раз: `cursor-agent login` (вход через браузер).
    Ключ CURSOR_API_KEY тогда не нужен.

Отличие от версии с Anthropic API:
  - У агента НЕТ forced tool-calling со схемой. Поэтому просим модель вернуть
    СТРОГО один JSON-объект, парсим и валидируем его сами.
  - Модели задаются слагами Cursor CLI (не Anthropic API). Haiku 4.5 в CLI
    недоступен, поэтому факт-чек идёт на другой дешёвой модели.
  - Пишет в тот же summaries.jsonl и пропускает уже готовые книги (как оригинал).

Установка и вход (один раз):
    curl https://cursor.com/install -fsS | bash
    cursor-agent login
    cursor-agent models   # посмотреть точные слаги моделей для аккаунта

Запуск:
    python3 generate_content_cursor.py
"""

import json
import subprocess

# Модели как в оригинале (generate_content.py): генерация — Opus, факт-чек — дешёвая.
# Слаги взяты из `cursor-agent models` для этого аккаунта. В CLI нет плоского
# "claude-opus-4-8" — только с уровнем усилий (-low/-medium/-high/-xhigh/-max,
# опц. -thinking). Haiku 4.5 в CLI недоступен, поэтому факт-чек — на Sonnet.
# Дешевле для факт-чека: "gemini-3.5-flash", "gpt-5.4-mini-medium", "composer-2.5".
GEN_MODEL = "claude-opus-4-8-high"   # Opus 4.8, аналог исходного Opus (без thinking)
CHECK_MODEL = "claude-4.5-sonnet"    # дешёвый Claude вместо недоступного Haiku 4.5
OUTPUT_LANGUAGE = "English"
OUTPUT_FILE = "summaries.jsonl"  # тот же файл, что и у generate_content.py
CURSOR_BIN = "cursor-agent"   # если у тебя алиас `agent` — поменяй здесь
TIMEOUT_SEC = 600

# ---------------------------------------------------------------------------
# Описание структуры саммари (агент не умеет tool_choice, поэтому схема
# передаётся текстом в промпте, а валидируем результат уже в Python).
# ---------------------------------------------------------------------------
SCHEMA_HINT = """{
  "hook": "3-6 word cover promise",
  "ideas": [
    {
      "title": "idea title",
      "read_minutes": 3,
      "screens": ["3-5 sentence screen", "..."],   // 2-3 items
      "card": {
        "summary": "one fuller paragraph",
        "bullets": ["...", "..."],                  // 2-4 items
        "highlight": "one memorable principle, no long quotes"
      }
    }
    // ... total 6-8 ideas
  ]
}"""

STYLE_PROMPT = f"""You are an editor for a microlearning app that turns popular
non-fiction books into bite-sized summaries. Write everything in {OUTPUT_LANGUAGE}.

STYLE:
- Write like a strong human non-fiction editor, not like an AI explainer.
- Sound natural, specific, and slightly opinionated where appropriate.
- Each idea: a clear title, 2-3 screens, and a recap card
  (one paragraph + 2-4 bullets + one memorable principle).
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
    """Запускает cursor-agent в headless-режиме и возвращает финальный текст ответа."""
    proc = subprocess.run(
        # --trust: не спрашивать доверие к папке в headless-режиме (иначе зависнет).
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
    # финальный ответ модели лежит в поле "result"
    if isinstance(envelope, dict):
        return envelope.get("result", "")
    return str(envelope)


def extract_json(text: str) -> dict:
    """Достаёт JSON-объект из ответа модели, снимая возможные ```json``` ограждения."""
    text = text.strip()
    if text.startswith("```"):
        # ```json\n{...}\n```  ->  {...}
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.lstrip().lower().startswith("json"):
            text = text.lstrip()[4:]
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


def _is_complete(data: dict) -> bool:
    """Проверяет, что саммари не обрезано: hook + 6-8 полных идей."""
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
    return True


def generate_summary(book: dict, retries: int = 3) -> dict:
    """Генерирует саммари одной книги через Cursor, повторяя при неполноте/ошибке парсинга."""
    for attempt in range(1, retries + 1):
        prompt = (
            f"{STYLE_PROMPT}\n\n"
            f'Create a summary for the book "{book["title"]}" by {book["author"]}.\n\n'
            f"Respond with ONE raw JSON object and NOTHING else — no prose, no code fences.\n"
            f"It MUST match exactly this shape (6-8 ideas):\n{SCHEMA_HINT}"
        )
        if attempt > 1:
            prompt += "\n\nYour previous answer was incomplete or invalid JSON. Return the FULL object."
        try:
            data = extract_json(run_cursor(prompt, GEN_MODEL))
        except (json.JSONDecodeError, RuntimeError) as e:
            print(f"   ⚠ ошибка разбора ответа ({e}), попытка {attempt}/{retries}")
            continue
        if _is_complete(data):
            return data
        print(f"   ⚠ неполное саммари, попытка {attempt}/{retries}")
    raise RuntimeError(f"не удалось сгенерировать полное саммари: {book['title']}")


def fact_check(book: dict, summary: dict) -> list[str]:
    """Прогоняет готовое саммари через модель, возвращает список замечаний ([] если всё ок)."""
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
    if text.rstrip(".!").strip().upper() == "OK":
        return []
    return [text]


def load_existing_ids(path: str) -> set[str]:
    """Возвращает id только ПОЛНЫХ записей — неполные будут перегенерированы."""
    done: set[str] = set()
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if _is_complete(row.get("data", {})):
                    done.add(row["id"])
    except FileNotFoundError:
        pass
    return done


def append_rows(path: str, rows: list[dict]) -> None:
    """Дозапись новых саммари. Гарантирует перевод строки, чтобы записи не склеивались."""
    if not rows:
        return
    try:
        with open(path, "rb") as f:
            f.seek(-1, 2)
            needs_nl = f.read(1) != b"\n"
    except (FileNotFoundError, OSError):
        needs_nl = False
    with open(path, "a", encoding="utf-8") as f:
        if needs_nl:
            f.write("\n")
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


# ---------------------------------------------------------------------------
# ВХОД: список книг. Закомментированные можно включать по мере надобности —
# скрипт пропустит уже готовые (полные) записи.
# ---------------------------------------------------------------------------
BOOKS = [
    # --- Привычки и продуктивность ---
    {"id": "atomic_habits", "title": "Atomic Habits", "author": "James Clear"},
    {"id": "power_of_habit", "title": "The Power of Habit", "author": "Charles Duhigg"},
    {"id": "deep_work", "title": "Deep Work", "author": "Cal Newport"},
    {"id": "seven_habits", "title": "The 7 Habits of Highly Effective People", "author": "Stephen R. Covey"},
    {"id": "eat_that_frog", "title": "Eat That Frog!", "author": "Brian Tracy"},
    # --- Деньги и финансы ---
    {"id": "psychology_of_money", "title": "The Psychology of Money", "author": "Morgan Housel"},
    {"id": "rich_dad_poor_dad", "title": "Rich Dad Poor Dad", "author": "Robert Kiyosaki"},
    {"id": "richest_man_babylon", "title": "The Richest Man in Babylon", "author": "George S. Clason"},
    {"id": "think_and_grow_rich", "title": "Think and Grow Rich", "author": "Napoleon Hill"},
    # --- Психология и мышление ---
    {"id": "thinking_fast_slow", "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman"},
    {"id": "influence", "title": "Influence: The Psychology of Persuasion", "author": "Robert B. Cialdini"},
    {"id": "mindset", "title": "Mindset", "author": "Carol S. Dweck"},
    {"id": "emotional_intelligence", "title": "Emotional Intelligence", "author": "Daniel Goleman"},
    {"id": "predictably_irrational", "title": "Predictably Irrational", "author": "Dan Ariely"},
    # --- Бизнес и успех ---
    {"id": "lean_startup", "title": "The Lean Startup", "author": "Eric Ries"},
    {"id": "zero_to_one", "title": "Zero to One", "author": "Peter Thiel"},
    {"id": "good_to_great", "title": "Good to Great", "author": "Jim Collins"},
    {"id": "four_hour_workweek", "title": "The 4-Hour Workweek", "author": "Timothy Ferriss"},
    {"id": "start_with_why", "title": "Start with Why", "author": "Simon Sinek"},
    # --- Коммуникация и отношения ---
    {"id": "win_friends", "title": "How to Win Friends and Influence People", "author": "Dale Carnegie"},
    {"id": "never_split_difference", "title": "Never Split the Difference", "author": "Chris Voss"},
    {"id": "crucial_conversations", "title": "Crucial Conversations", "author": "Kerry Patterson"},
    # --- Мышление и саморазвитие ---
    {"id": "subtle_art", "title": "The Subtle Art of Not Giving a F*ck", "author": "Mark Manson"},
    {"id": "cant_hurt_me", "title": "Can't Hurt Me", "author": "David Goggins"},
    {"id": "mans_search_meaning", "title": "Man's Search for Meaning", "author": "Viktor E. Frankl"},
    {"id": "power_of_now", "title": "The Power of Now", "author": "Eckhart Tolle"},
    {"id": "ikigai", "title": "Ikigai", "author": "Hector Garcia and Francesc Miralles"},
    {"id": "daring_greatly", "title": "Daring Greatly", "author": "Brene Brown"},
    {"id": "compound_effect", "title": "The Compound Effect", "author": "Darren Hardy"},
    {"id": "grit", "title": "Grit", "author": "Angela Duckworth"},
    # --- Решения и неопределённость ---
    {"id": "thinking_in_bets", "title": "Thinking in Bets", "author": "Annie Duke"},
    {"id": "superforecasting", "title": "Superforecasting", "author": "Philip E. Tetlock"},
    {"id": "antifragile", "title": "Antifragile", "author": "Nassim Nicholas Taleb"},
    {"id": "great_mental_models", "title": "The Great Mental Models", "author": "Shane Parrish"},
    {"id": "poor_charlies_almanack", "title": "Poor Charlie's Almanack", "author": "Charlie Munger"},
    {"id": "decisive", "title": "Decisive", "author": "Chip Heath and Dan Heath"},
    {"id": "high_output_management", "title": "High Output Management", "author": "Andrew S. Grove"},
]


def main():
    existing_ids = load_existing_ids(OUTPUT_FILE)
    new_books = [b for b in BOOKS if b["id"] not in existing_ids]

    if not new_books:
        print("Новых книг нет, всё уже сгенерировано.")
        return

    print(f"К генерации: {len(new_books)} (пропущено готовых: {len(existing_ids)})")

    results, failed = [], []
    for i, book in enumerate(new_books, 1):
        print(f"[{i}/{len(new_books)}] {book['title']}...")
        try:
            summary = generate_summary(book)
        except RuntimeError as e:
            print(f"   ✗ пропущено: {e}")
            failed.append(book["id"])
            continue
        flags = fact_check(book, summary)
        if flags:
            print(f"   ⚠ факт-чек: {flags}")
        results.append({"id": book["id"], "data": summary, "flags": flags})

    append_rows(OUTPUT_FILE, results)

    flagged = [r["id"] for r in results if r["flags"]]
    print(f"\nДобавлено: {len(results)} саммари -> {OUTPUT_FILE}")
    if flagged:
        print(f"Требуют ручной проверки ({len(flagged)}): {flagged}")
    if failed:
        print(f"Не сгенерированы ({len(failed)}): {failed}")


if __name__ == "__main__":
    main()