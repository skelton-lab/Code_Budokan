# Companion — COBOL (not in the original Budokan module list)

**Founding document: independently supplied, though closely connected to material already in the Budokan history.** The CODASYL Committee's 1959–60 specification process produced COBOL directly; Grace Hopper's own earlier paper — Hopper, G. (1952). "The Education of a Computer." *Proceedings of the 1952 ACM Annual Meeting* — already appears in the Code Budokan History-of-Computing document's own reading list ([item 9](history/reading-list.md), [Era III](history/era-3-electronic-computer.md)), describing the first compiler and the philosophy that led directly to COBOL. COBOL itself doesn't appear in the workbook's own module list — added to `code-rookie` after the original plan was set.

## Historical note

The History-of-Computing document's own [Hopper biography](history/era-3-electronic-computer.md) states the chain precisely: Hopper led development of FLOW-MATIC (the first English-language programming language), which "directly led to the development of COBOL (1959), which Hopper championed" against real institutional resistance — a widely-held belief at the time that programming languages needed to look like mathematics, not English, to be taken seriously. COBOL's own defining, load-bearing design choice — fixed-decimal `PICTURE`-clause arithmetic for money, rather than a general-purpose floating-point numeric type — was a deliberate, 1959-era decision to avoid an entire class of error `cobol/02-arithmetic-picture-clauses.md` verifies directly by comparing it side-by-side against Python's own `0.1 + 0.2` float-approximation result: COBOL's decimal fields were designed specifically to prevent that exact failure mode for financial data, sixty-plus years before most other languages treated "exact decimal arithmetic" as something worth a dedicated numeric type.

`cobol/00-overview.md`'s own real number is worth sitting with directly: COBOL "processes an estimated $3 trillion in daily financial transactions," per the History-of-Computing document's own figure — not a historical curiosity, a language genuinely still running a large share of the world's core banking, insurance, and government infrastructure today.

## Reflection prompts

- Hopper's own real institutional battle was convincing people that an English-like programming language could be taken seriously. `python/00-overview.md` and every other guide in this series takes readable, English-like syntax for granted. What would it mean to actually have to argue for that, against a genuine, widely-held belief that "real" programming required looking mathematical?
- `cobol/02-arithmetic-picture-clauses.md`'s own comparison to Python's `0.1 + 0.2` float result is a direct, cross-guide verification. Find one other place in `code-rookie` where a numeric type "quietly did something the value on paper didn't expect" (companion hint: Python's own NumPy `int64` overflow finding) — what's the common thread across all three findings, sixty years apart?

## Short-answer questions

1. **What direct chain does the Code Budokan history draw from Hopper's own 1952 work to COBOL's own 1959 creation?** Hopper led development of FLOW-MATIC (the first English-language programming language), which directly led to COBOL — which Hopper then championed against real, widely-held institutional resistance to English-like programming languages.
2. **What real, deliberate design choice does COBOL's own `PICTURE`-clause arithmetic represent, verified directly in `cobol/02-arithmetic-picture-clauses.md`?** Fixed-decimal arithmetic for money, chosen specifically from 1959 to avoid the exact class of floating-point approximation error `cobol/02-arithmetic-picture-clauses.md` verifies directly by comparing against Python's own `0.1 + 0.2` result.
3. **What real figure does `cobol/00-overview.md` cite for COBOL's own continued, present-day economic footprint?** An estimated $3 trillion in daily financial transactions, per the Code Budokan History-of-Computing document's own figure — a language still running a large share of the world's core banking, insurance, and government back-end systems today, not merely a historical artifact.

## Links into the guide

- [`cobol/02-arithmetic-picture-clauses.md`](../cobol/02-arithmetic-picture-clauses.md) — fixed-decimal arithmetic, verified directly against Python's own float-approximation finding.
- [`cobol/00-overview.md`](../cobol/00-overview.md) — the $3 trillion figure, and the guide's own framing of COBOL as a genuinely still-load-bearing system, not a museum piece.

## Cross-thread connection

No direct Budokan-workbook pairing exists for COBOL specifically, since it isn't in the workbook's own original module list. The genuinely relevant connection is internal to `code-rookie` itself: `cobol/08-indexed-files-search.md` names the direct parallel between COBOL's own `RECORD KEY` (fast lookup of one specific record) and SQL's `PRIMARY KEY` (companion: `sql.md`) — decades apart, the same underlying problem, solved first at the file-system level and later at the full relational-query-engine level.
