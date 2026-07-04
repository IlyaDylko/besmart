"""
Пайплайн генерации книжных саммари (формат Deepstash/Headway).
Версия под небольшой объём: ~20-30 книг.

Возможности:
  - Синхронный API: результат сразу, легко итерировать промпт и отлаживать.
  - Модель Opus 4.8 (на таком объёме цена несущественна, качество максимально).
  - Факт-чек проход на КАЖДУЮ книгу (дешёвой моделью Haiku).
  - Инкрементальность: перечитывает уже готовый JSON и генерирует ТОЛЬКО новые книги.
  - Устойчивость: ловит обрезку по max_tokens, проверяет полноту, повторяет,
    а упавшую книгу пропускает, не роняя весь прогон.

Запуск:
    pip install anthropic
    export ANTHROPIC_API_KEY=sk-ant-...
    python book_summary_pipeline.py

ВАЖНО (оригинальность/юр. чистота):
  - Системный промпт требует пересказывать идеи СВОИМИ словами, не копировать
    формулировки автора. Источник — знания модели о книге, а не её текст.
"""

import json

import anthropic

client = anthropic.Anthropic()  # ключ из ANTHROPIC_API_KEY

GEN_MODEL = "claude-opus-4-8"       # генерация: максимальное качество
CHECK_MODEL = "claude-haiku-4-5"    # факт-чек: дёшево и быстро
OUTPUT_LANGUAGE = "English"
OUTPUT_FILE = "summaries.jsonl"

# ---------------------------------------------------------------------------
# СХЕМА ВЫХОДА — структура одной книги (хук -> ключевые идеи -> у каждой
# текстовые экраны + карточка-итог). Передаётся как "инструмент",
# tool_choice форсирует вызов => на выходе всегда валидный JSON этой формы.
# ---------------------------------------------------------------------------
SUMMARY_TOOL = {
    "name": "save_book_summary",
    "description": "Сохранить структурированное саммари книги в базу приложения.",
    "input_schema": {
        "type": "object",
        "properties": {
            "hook": {
                "type": "string",
                "description": "Цепляющий заголовок-обещание для обложки (3-6 слов).",
            },
            "ideas": {
                "type": "array",
                "minItems": 6,
                "maxItems": 8,
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "read_minutes": {"type": "integer", "minimum": 3, "maximum": 6},
                        "screens": {
                            "type": "array",
                            "minItems": 2,
                            "maxItems": 3,
                            "items": {"type": "string"},
                            "description": (
                                "Более развернутые экраны: обычно 3-5 предложений, "
                                "живой и естественный тон, без шаблонной AI-подачи."
                            ),
                        },
                        "card": {
                            "type": "object",
                            "properties": {
                                "summary": {"type": "string"},
                                "bullets": {
                                    "type": "array",
                                    "minItems": 2,
                                    "maxItems": 4,
                                    "items": {"type": "string"},
                                },
                                "highlight": {
                                    "type": "string",
                                    "description": "Запоминающийся факт/принцип. Без длинных цитат.",
                                },
                            },
                            "required": ["summary", "bullets", "highlight"],
                        },
                    },
                    "required": ["title", "read_minutes", "screens", "card"],
                },
            },
        },
        "required": ["hook", "ideas"],
    },
}

SYSTEM_PROMPT = f"""You are an editor for a microlearning app that turns popular
non-fiction books into bite-sized summaries.

Write everything in {OUTPUT_LANGUAGE}.

STYLE:
- Write like a strong human non-fiction editor, not like an AI explainer.
- Sound natural, specific, and slightly opinionated where appropriate.
- Use second person ("you") when it helps, but do not force it into every paragraph.
- Each idea: a clear title, 2-3 screens, and a recap card
  (one paragraph + 2-4 bullets + one memorable principle).
- Vary rhythm aggressively: mix short punchy lines with longer reflective ones.
- Avoid generic motivational filler, empty hype, and repetitive transitions.
- Prefer concrete phrasing over abstract coaching language.
- Each idea should feel like a mini insight a smart friend is explaining clearly.

LENGTH:
- Make each screen about 50% longer than a short app blurb.
- Each screen should usually be 3-5 sentences.
- Let explanations breathe: add one extra example, contrast, or implication where useful.
- The recap card summary should also feel fuller and more natural, not compressed.

HUMANNESS:
- Write with natural asymmetry: some sentences can be blunt, others more reflective.
- Do not make every paragraph equally polished or equally structured.
- Do not sound like a productivity influencer, corporate coach, or therapy bot.
- Avoid repetitive openers like "Here's the thing", "The point is",
  "What this means is", or "In other words".
- Avoid a repetitive, templated "AI" voice.

LEGAL / ORIGINALITY (critical):
- Restate the book's IDEAS in your own words. Do NOT copy the author's phrasing.
- No verbatim quotes longer than a short phrase; attribute any quote you keep.

ACCURACY:
- Only include facts, names, and numbers you are confident are correct.
- If unsure about an anecdote or statistic, keep the idea general.

Call the save_book_summary tool with the structured result."""


def _is_complete(data: dict) -> bool:
    """Проверяет, что саммари не обрезано: есть hook и минимум 6 полных идей."""
    if not data.get("hook") or len(data.get("ideas", [])) < 6:
        return False
    for idea in data["ideas"]:
        if not idea.get("title") or not idea.get("screens") or not idea.get("card"):
            return False
    return True


def generate_summary(book: dict, retries: int = 2) -> dict:
    """Синхронно генерирует саммари одной книги. Повторяет при обрезке/неполноте."""
    for attempt in range(1, retries + 1):
        msg = client.messages.create(
            model=GEN_MODEL,
            max_tokens=8192,  # поднято под более длинный текст, иначе обрыв JSON
            system=SYSTEM_PROMPT,
            tools=[SUMMARY_TOOL],
            tool_choice={"type": "tool", "name": "save_book_summary"},
            messages=[{
                "role": "user",
                "content": f'Create a summary for "{book["title"]}" by {book["author"]}.',
            }],
        )
        # stop_reason == "max_tokens" => ответ обрезан, tool-JSON неполный
        if msg.stop_reason == "max_tokens":
            print(f"   ⚠ обрезано по max_tokens, попытка {attempt}/{retries}")
            continue
        tool_block = next((b for b in msg.content if b.type == "tool_use"), None)
        if tool_block and _is_complete(tool_block.input):
            return tool_block.input
        print(f"   ⚠ неполное саммари, попытка {attempt}/{retries}")
    raise RuntimeError(f"не удалось сгенерировать полное саммари: {book['title']}")


def fact_check(book: dict, summary: dict) -> list[str]:
    """Прогоняет готовое саммари через дешёвую модель, возвращает список замечаний."""
    msg = client.messages.create(
        model=CHECK_MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
                f'You know the popular book "{book["title"]}" by {book["author"]} '
                f"from your training. Using only your own knowledge, review the JSON "
                f"summary below and flag any claim you are CONFIDENT is factually wrong "
                f"(wrong names, dates, numbers, misattributed quotes, invented anecdotes).\n"
                f"Do NOT ask for the book's text — judge only what is provided.\n"
                f"If you find nothing you are confident is wrong, reply with exactly: OK\n\n"
                f"{json.dumps(summary, ensure_ascii=False)}"
            ),
        }],
    )
    text = "".join(b.text for b in msg.content if b.type == "text").strip()
    # модель часто отвечает "OK." или "OK" с пунктуацией — не считаем это ошибкой
    if text.rstrip(".!").strip().upper() == "OK":
        return []
    return [text]


def load_existing_ids(path: str) -> set[str]:
    """Читает уже сгенерированные записи и возвращает набор book id."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return {json.loads(line)["id"] for line in f if line.strip()}
    except FileNotFoundError:
        return set()


# ---------------------------------------------------------------------------
# ВХОД: список книг. Закомментированные строки можно включать по мере надобности —
# скрипт всё равно пропустит уже сгенерированные (см. инкрементальность в main).
# ---------------------------------------------------------------------------
BOOKS = [
    # --- Привычки и продуктивность ---
    {"id": "atomic_habits", "title": "Atomic Habits", "author": "James Clear"},
    # {"id": "power_of_habit", "title": "The Power of Habit", "author": "Charles Duhigg"},
    # {"id": "deep_work", "title": "Deep Work", "author": "Cal Newport"},
    # {"id": "seven_habits", "title": "The 7 Habits of Highly Effective People", "author": "Stephen R. Covey"},
    # {"id": "eat_that_frog", "title": "Eat That Frog!", "author": "Brian Tracy"},
    # --- Деньги и финансы ---
    {"id": "psychology_of_money", "title": "The Psychology of Money", "author": "Morgan Housel"},
    # {"id": "rich_dad_poor_dad", "title": "Rich Dad Poor Dad", "author": "Robert Kiyosaki"},
    # {"id": "richest_man_babylon", "title": "The Richest Man in Babylon", "author": "George S. Clason"},
    # {"id": "think_and_grow_rich", "title": "Think and Grow Rich", "author": "Napoleon Hill"},
    # --- Психология и мышление ---
    {"id": "thinking_fast_slow", "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman"},
    # {"id": "influence", "title": "Influence: The Psychology of Persuasion", "author": "Robert B. Cialdini"},
    # {"id": "mindset", "title": "Mindset", "author": "Carol S. Dweck"},
    # {"id": "emotional_intelligence", "title": "Emotional Intelligence", "author": "Daniel Goleman"},
    # {"id": "predictably_irrational", "title": "Predictably Irrational", "author": "Dan Ariely"},
    # --- Бизнес и успех ---
    {"id": "lean_startup", "title": "The Lean Startup", "author": "Eric Ries"},
    # {"id": "zero_to_one", "title": "Zero to One", "author": "Peter Thiel"},
    # {"id": "good_to_great", "title": "Good to Great", "author": "Jim Collins"},
    # {"id": "four_hour_workweek", "title": "The 4-Hour Workweek", "author": "Timothy Ferriss"},
    # {"id": "start_with_why", "title": "Start with Why", "author": "Simon Sinek"},
    # --- Коммуникация и отношения ---
    {"id": "win_friends", "title": "How to Win Friends and Influence People", "author": "Dale Carnegie"},
    # {"id": "never_split_difference", "title": "Never Split the Difference", "author": "Chris Voss"},
    # {"id": "crucial_conversations", "title": "Crucial Conversations", "author": "Kerry Patterson"},
    # --- Мышление и саморазвитие ---
    {"id": "subtle_art", "title": "The Subtle Art of Not Giving a F*ck", "author": "Mark Manson"},
    # {"id": "cant_hurt_me", "title": "Can't Hurt Me", "author": "David Goggins"},
    # {"id": "mans_search_meaning", "title": "Man's Search for Meaning", "author": "Viktor E. Frankl"},
    # {"id": "power_of_now", "title": "The Power of Now", "author": "Eckhart Tolle"},
    # {"id": "ikigai", "title": "Ikigai", "author": "Hector Garcia and Francesc Miralles"},
    # {"id": "daring_greatly", "title": "Daring Greatly", "author": "Brene Brown"},
    # {"id": "compound_effect", "title": "The Compound Effect", "author": "Darren Hardy"},
    # {"id": "grit", "title": "Grit", "author": "Angela Duckworth"},
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
    new_books = [book for book in BOOKS if book["id"] not in existing_ids]

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

    # дозапись: не перетираем уже готовые саммари
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        for row in results:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    flagged = [r["id"] for r in results if r["flags"]]
    print(f"\nДобавлено: {len(results)} саммари -> {OUTPUT_FILE}")
    if flagged:
        print(f"Требуют ручной проверки ({len(flagged)}): {flagged}")
    if failed:
        print(f"Не сгенерированы ({len(failed)}): {failed}")


if __name__ == "__main__":
    main()