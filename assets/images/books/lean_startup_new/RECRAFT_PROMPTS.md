# Lean Startup (New) — Recraft prompts for Ideas feed

**Format:** Square **1:1** (recommend **1024×1024** PNG)  
**Use:** Ideas discovery cards (`card-0.png` … `card-6.png`)  
**Not for:** reader slides (those stay 16:9 / `idea-N.png` if needed)

Shared style for every prompt:
- minimal editorial flat illustration
- warm cream `#FDF6F0` background
- brown `#5C3D3A` accents
- soft shadows, one bold central metaphor
- generous negative space (must read at ~112×112 pt)
- NO text, NO logos, NO typography, NO people, NO faces

After generating, save as:
`assets/images/books/lean_startup_new/card-{n}.png`
then register in `src/data/book-images.ts` → `IDEA_CARD_IMAGES`.

---

## 0 — Stop Building Until You Know This
File: `card-0.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: a polished finished product box sitting unused beside a simple compass and blank blueprint — building before knowing what to build. Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## 1 — Your Best Guesses Are Hiding a Trap
File: `card-1.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: a neat business-plan folder with one corner lifted, revealing a small spring-loaded trap underneath — unexamined assumptions as hidden danger. Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## 2 — Ship Something Embarrassing on Purpose
File: `card-2.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: a rough cardboard prototype rocket next to a glossy finished rocket, linked by a short measuring tape — MVP as fastest learning tool. Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## 3 — The Metric That Lies to You
File: `card-3.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: a vanity gauge stuck at maximum, with a cracked mirror behind it reflecting a quiet downward arrow — metrics that only rise and hide the truth. Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## 4 — When Grinding Harder Is the Wrong Move
File: `card-4.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: a stone grindstone pressing against a locked door, while a clear open side path appears in soft light — pivot as changing the path, not pushing harder. Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## 5 — Why Shipping Faster Feels Wrong (and Works)
File: `card-5.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: one huge tangled rope knot versus a neat sequence of small loops being untied one by one — small batches and early feedback. Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## 6 — The Machine That Turns Failure Into Fuel
File: `card-6.png`

```
Square 1:1 editorial illustration, 1024x1024. Minimal flat style, warm cream #FDF6F0 background, brown #5C3D3A accents, soft shadows. One bold centered metaphor: a circular three-station machine — clay lump, measuring scale, glowing lightbulb — looping so failure fuels the next cycle (Build-Measure-Learn). Large simple shapes, lots of empty space, readable as a tiny app thumbnail. NO text, NO logos, NO people, NO faces. Abstract symbolic still-life.
```

---

## Register checklist

```ts
// src/data/book-images.ts → IDEA_CARD_IMAGES
'lean_startup_new:0': require('@/assets/images/books/lean_startup_new/card-0.png'),
'lean_startup_new:1': require('@/assets/images/books/lean_startup_new/card-1.png'),
'lean_startup_new:2': require('@/assets/images/books/lean_startup_new/card-2.png'),
'lean_startup_new:3': require('@/assets/images/books/lean_startup_new/card-3.png'),
'lean_startup_new:4': require('@/assets/images/books/lean_startup_new/card-4.png'),
'lean_startup_new:5': require('@/assets/images/books/lean_startup_new/card-5.png'),
'lean_startup_new:6': require('@/assets/images/books/lean_startup_new/card-6.png'),
```
