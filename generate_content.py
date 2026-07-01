"""
Пайплайн генерации книжных саммари (формат Deepstash/Headway).
Версия под небольшой объём: ~20-30 книг.

Отличия от батч-версии:
  - Синхронный API: результат сразу, легко итерировать промпт и отлаживать.
  - Модель Opus 4.8 (на таком объёме цена несущественна, качество максимально).
  - Факт-чек проход на КАЖДУЮ книгу (дешёвой моделью Haiku).
  - Простой последовательный цикл — 30 вызовов это быстро.

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
                            "description": "Короткие экраны, 2-3 предложения, разговорный тон.",
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
- Conversational, energetic, second person ("you"). Like explaining to a friend.
- Each idea: a clear title, 2-3 short screens (2-3 sentences each), and a
  recap card (one paragraph + 2-4 bullets + one memorable principle).
- Vary sentence rhythm and openings across ideas and across books — avoid a
  repetitive, templated "AI" voice.

LEGAL / ORIGINALITY (critical):
- Restate the book's IDEAS in your own words. Do NOT copy the author's phrasing.
- No verbatim quotes longer than a short phrase; attribute any quote you keep.

ACCURACY:
- Only include facts, names, and numbers you are confident are correct.
- If unsure about an anecdote or statistic, keep the idea general.

Call the save_book_summary tool with the structured result."""


def generate_summary(book: dict) -> dict:
    """Синхронно генерирует саммари одной книги, возвращает dict по схеме."""
    msg = client.messages.create(
        model=GEN_MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=[SUMMARY_TOOL],
        tool_choice={"type": "tool", "name": "save_book_summary"},
        messages=[{
            "role": "user",
            "content": f'Create a summary for "{book["title"]}" by {book["author"]}.',
        }],
    )
    tool_block = next(b for b in msg.content if b.type == "tool_use")
    return tool_block.input


def fact_check(book: dict, summary: dict) -> list[str]:
    """Прогоняет готовое саммари через дешёвую модель, возвращает список замечаний."""
    msg = client.messages.create(
        model=CHECK_MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
                f'Book: "{book["title"]}" by {book["author"]}.\n'
                f"Below is a generated summary. List any factual errors, "
                f"misattributed quotes, wrong names, or dubious statistics. "
                f"If everything looks correct, reply exactly: OK.\n\n"
                f"{json.dumps(summary, ensure_ascii=False)}"
            ),
        }],
    )
    text = "".join(b.text for b in msg.content if b.type == "text").strip()
    return [] if text == "OK" else [text]


# ---------------------------------------------------------------------------
# ВХОД: список книг. На 20-30 штук удобно держать прямо здесь или в CSV.
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
]


def main():
    results = []
    for i, book in enumerate(BOOKS, 1):
        print(f"[{i}/{len(BOOKS)}] {book['title']}...")
        summary = generate_summary(book)
        flags = fact_check(book, summary)
        if flags:
            print(f"   ⚠ факт-чек: {flags}")
        results.append({"id": book["id"], "data": summary, "flags": flags})

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for row in results:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    flagged = [r["id"] for r in results if r["flags"]]
    print(f"\nГотово: {len(results)} саммари -> {OUTPUT_FILE}")
    if flagged:
        print(f"Требуют ручной проверки ({len(flagged)}): {flagged}")


if __name__ == "__main__":
    main()