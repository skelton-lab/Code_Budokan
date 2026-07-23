# APL — A Session-Based Study Guide

**Promise:** read and write real APL — leaning entirely into what's genuinely distinctive: whole-array operations that replace explicit loops outright, reduction and scan, outer product, and sorting via grade-up/down — direct, verified proof that "vectorized, no-loop" array programming isn't a NumPy invention. It's a 1962 design (Kenneth Iverson's notation, first implemented 1966), older than every other language in this series.

**Audience:** this series' existing reader, arriving with `python/08-numpy-vectorization.md`'s whole-array operations already familiar as a *destination*. This guide shows the *origin* — the same instinct (operate on entire arrays, not element by element with an explicit loop), expressed directly as the language's core design, decades before NumPy existed.

**Toolchain (anchored):** **GNU APL 1.9** (Homebrew: `brew install gnu-apl`). A real, verified toolchain gotcha worth knowing before writing a single example: GNU APL **hangs indefinitely with zero output** under the default `C` locale — every example in this guide is run as `LC_ALL=en_US.UTF-8 apl -s --safe -f script.apl`, and both the locale setting and `--safe` (which disables the shared-variable server that otherwise prints spurious connection-failure warnings on every startup) were confirmed necessary, not cosmetic, by testing their absence directly.

**A methodology note specific to this language:** APL's entire notation is built from symbols outside ASCII (`⍳`, `⍴`, `⌽`, `⍋`, and dozens more) — every single symbol shown in this guide's code blocks was verified to actually execute correctly against GNU APL 1.9, not copied from a reference table and assumed correct. This matters more here than in any other guide in this series: a single mistyped or visually-similar Unicode glyph produces a real, different error, not a typo a reader could easily spot and correct by eye the way a misspelled English keyword usually can be.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Statistics Engine, No Loops | `+/`, `÷`, `≢` — mean, variance, and standard deviation over a real dataset with zero explicit iteration |
| 2 | A Distance/Multiplication Table | Outer product (`∘.`), axis-controlled reduction (`+/` vs. `+⌿`), transpose (`⍉`) |
| 3 | A Ranking System, No Sort Algorithm Written | Grade-up/down (`⍋`/`⍒`) plus bracket indexing — sorting without implementing any comparison logic at all |

## Module list

1. **Foundations: Arrays, Shape, and Whole-Array Operations** — `⍳`, `⍴`, elementwise arithmetic → sets up Capstone 1
2. **Reduction and Scan** — `+/`, axis control (`+/` vs. `+⌿`) → feeds Capstone 1
3. **Capstone 1** — A Statistics Engine, No Loops
4. **dfns: Defining Your Own Functions** — `{⍵}` (monadic), `{⍺ ⍵}` (dyadic) → feeds Capstone 2
5. **Outer Product, Transpose, Reshape** — `∘.`, `⍉`, `⍴` as a function → feeds Capstone 2
6. **Capstone 2** — A Distance/Multiplication Table
7. **Grade-Up/Down and Boolean Masking** — `⍋`/`⍒`, bracket indexing, `/` as compress → feeds Capstone 3
8. **Capstone 3** — A Ranking System
9. **Beyond This Guide** — signposts only
10. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Structured control flow (`:If`/`:While`/`:For`) | This guide's entire point is that array operations replace most loop-shaped code | **Signpost** |
| Nested/enclosed arrays | Doesn't touch a capstone; a genuinely deep topic | **Signpost** |
| Tacit/point-free programming (trains) | Doesn't touch a capstone | **Signpost** |
| GNU APL's native-function/shared-variable system | Explicitly disabled via `--safe` throughout this guide | **Signpost** |
| Dyalog APL vs. GNU APL dialect differences | Doesn't touch a capstone | **Signpost**, named honestly |

## Setup

```bash
brew install gnu-apl
LC_ALL=en_US.UTF-8 apl -s --safe --version   # confirmed: GNU APL 1.9
```

Verification pattern used throughout this guide:

```bash
LC_ALL=en_US.UTF-8 apl -s --safe -f script.apl
```

Every script ends in `)OFF` to terminate cleanly — without it, GNU APL drops into its interactive REPL and waits indefinitely for more input.
