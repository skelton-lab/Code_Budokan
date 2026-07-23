# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [Free Pascal documentation](https://www.freepascal.org/docs.html) | The complete reference for this guide's entire anchored toolchain, including every compiler mode named across this guide |
| Jensen & Wirth, *Pascal User Manual and Report* | The closest primary source to Pascal as Wirth actually specified it |
| ISO/IEC 7185:1990 | The formal Pascal standard this guide checked its examples against via `-Miso`, without chasing every conformance edge case |
| This series' [ALGOL guide](../algol/00-overview.md) | The direct predecessor this entire guide was built in contrast to — block structure (unchanged), call-by-name (replaced), the dangling-else problem (handled a third way) |
| This series' [Modula-2 guide](../modula2/00-overview.md) | Wirth's own next language, picking up directly from this guide's units/separate-compilation signpost |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `program`/`const`/`var`/`begin...end.` — the final period is mandatory | Module 1 |
| `case` (with range labels) — a genuine Pascal addition, not inherited from ALGOL | Module 2, Capstone 1 |
| Value parameters (private copy) vs. `var` parameters (modifies the caller) | Module 2 |
| Dangling-else: Pascal resolves it by "nearest unmatched `if`," same as C, not ALGOL 68's mandatory-keyword fix | Module 2 |
| `record` — Pascal's `struct` equivalent, copied by value on assignment | Module 4 |
| Enumerated types + `Ord` | Module 4 |
| Subrange types — enforced for constants always; needs `-Cr` for runtime values | Module 4, Capstone 2 |
| `set of T`; `+` (union), `*` (intersection), `-` (difference), `in` (membership) | Module 6, Capstone 3 |
| `^T`, `New`/`Dispose` — typed, reject cross-type assignment at compile time | Module 8 |
| FPC's default mode allows pointer arithmetic; `-Miso` correctly rejects it | Module 8 |
| Self-referencing record + pointer type → linked list; `nil` marks the end | Module 8, Capstone 4 |

## Verification technique used throughout this guide

```bash
fpc program.pas
./program
fpc -Cr program.pas   # with runtime range checking
fpc -Miso program.pas  # strict ISO Pascal mode
```

Every code example in this guide was actually compiled and run with Free Pascal — including two real, precise findings that corrected an initially reasonable-sounding assumption: subrange types silently permitting an out-of-range runtime value with no error unless `-Cr` is explicitly passed, and FPC's default mode actually *allowing* pointer arithmetic on typed pointers, something ISO-standard Pascal (verified via `-Miso`) genuinely does not.

## Where to go now

This guide inserts Pascal between ALGOL and Simula in this series' stated sequencing, grouping Wirth's own procedural lineage together before the object-oriented fork — genuinely simpler and stricter than ALGOL wherever it mattered to Wirth's own stated teaching goals, and genuinely looser than expected in exactly the one place (FPC's default pointer-arithmetic extension) this guide's own verification caught directly. From here: **Modula-2** — Wirth's own next language, picking up the units/separate-compilation gap this guide named directly as the reason it exists.
