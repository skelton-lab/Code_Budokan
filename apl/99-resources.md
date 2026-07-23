# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [GNU APL documentation](https://www.gnu.org/software/apl/) | The anchored toolchain's own reference |
| Kenneth Iverson, *Notation as a Tool of Thought* (1979 Turing Award lecture) | The primary-source case for APL's own design, from its own creator |
| [Mastering Dyalog APL](https://www.dyalog.com/mastering-dyalog-apl.htm) | A fuller, free, dialect-specific textbook for continuing past this guide |
| This series' [Python guide](../python/08-numpy-vectorization.md) | The direct, verified destination of this guide's "no explicit loops" thread |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `⍳n` — generate `1 2 ... n` | Module 1 |
| `⍴` monadic — shape of; dyadic — reshape into | Module 1 |
| `¯5` (literal negative) vs. `3-8` (subtraction) — distinct glyphs | Module 1 |
| Elementwise arithmetic + scalar extension — no loop, ever | Module 1 |
| `+/`, `×/`, `⌈/`, `⌊/` — reduction: sum, product, max, min | Module 2 |
| `+\` — scan: running/cumulative result at every position | Module 2 |
| `+/` (last axis) vs. `+⌿` (first axis) — row sums vs. column sums | Module 2 |
| `{2×⍵}` monadic dfn, `{⍺+⍵}` dyadic dfn | Module 4 |
| Guard syntax (`cond:result`) — verified NOT to work in this guide's invocation mode | Module 4 |
| `a∘.op b` — outer product, every pairwise combination | Module 5 |
| `\|a∘.-b` — every pairwise absolute distance | Module 5 |
| `⍉` — transpose, genuinely changes shape | Module 5 |
| `⍋`/`⍒` — grade returns *positions*, not sorted values | Module 7 |
| `arr[⍒other]` — reorder one array by another's sort order | Module 7 |
| `mask/arr` — boolean compress (filter) | Module 7 |
| `⍋⍒scores` — grade of grade, each element's rank in original order | Capstone 3 |

## A note on this guide's verification tier

Every APL expression in this guide was run against GNU APL 1.9 — no symbol or example was copied from a reference table and assumed correct. This guide surfaced more real toolchain-specific findings than most in this series: the locale requirement (Module 0), the guard-syntax failure (Module 4), a hyphen-in-identifier parsing mistake caught live (Capstone 2), and a further structured-control-flow limitation (Module 9) — every one kept in and reported precisely, with the scope of the claim stated honestly (specific to this toolchain version and this invocation mode) rather than generalized beyond what was actually tested.

## Where to go now

APL sits, in this series' own sequencing, alongside `fortran/`/`cobol/` at the start — the oldest language by design in this whole series (1962), and the actual origin of the "whole-array operations, no explicit loop" idea `python/08-numpy-vectorization.md` covers as a modern library feature decades later. From here, `INDEX.md`'s remaining queued candidates include **Julia** (modern scientific computing, worth comparing directly against both this guide's array orientation and multiple dispatch from `clojure/`), **Erlang**, and the **Go**/**Rust** pairing.
