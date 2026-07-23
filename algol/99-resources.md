# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| ["Report on the Algorithmic Language ALGOL 60"](https://www.masswerk.at/algol60/report.htm) (Naur et al., 1960) | The primary source for everything in Modules 4–5's documented (not-executed) content |
| [Algol 68 Genie](https://jmvdveer.home.algol68genie.nl/) documentation | The toolchain this guide actually runs against |
| Donald Knuth, "A History of Writing Compilers" and related retrospectives | Good secondary material on why ALGOL 60's design decisions mattered as much as they did |
| This series' [C guide](../c/00-overview.md) | Where ALGOL's block-structure lineage lands most directly, via BCPL/B |
| This series' [Simula guide](../simula/00-overview.md) | The *other* branch from this guide's Module 2 — Module 8's signpost depends on it directly |
| This series' [Smalltalk guide](../smalltalk/00-overview.md) | The branch Simula didn't take — Module 8's contrast depends on this one too |

## One-page cheat sheet

| Idea | Snippet (verified in `a68g` unless noted) |
|---|---|
| Program skeleton | `BEGIN ... END` — uppercase keywords required by this guide's stropping convention |
| Variable declaration | `INT x := 42;` |
| Nested block / shadowing | `BEGIN INT x := 1; BEGIN INT x := 2; ... END END` |
| Procedure | `PROC name = (INT n) INT: ... ;` |
| Recursion | `PROC fact = (INT n) INT: IF n <= 1 THEN 1 ELSE n * fact(n-1) FI;` |
| Conditional | `IF cond THEN ... ELSE ... FI` — mandatory `FI` |
| Loop | `FOR i FROM 1 TO 5 DO ... OD` |
| Array | `[1:5] INT arr := (10, 20, 30, 40, 50);` |
| Call-by-name (*documented, not executable here*) | Parameter re-evaluated as a live expression on every reference, not copied once |
| Jensen's Device (*documented*) | A summation procedure parameterized entirely by a by-name expression argument |

## Where to go now

Per your own sequencing: [`simula/`](../simula/00-overview.md) next, then [`smalltalk/`](../smalltalk/00-overview.md) — both now built, both directly continuing the block-structure thread from Module 2 into the class concept that led Stroustrup to C++. This guide's job was to make sure that thread has real roots under it before you get there, and Module 8 names exactly which module in each guide picks the thread up.
