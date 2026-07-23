# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [GnuCOBOL documentation](https://gnucobol.sourceforge.io/) | The anchored toolchain's own reference — compiler flags, dialects, and the `-Wcolumn-overflow`/`text-column` behavior this guide verified directly in Module 1 |
| ISO/IEC 1989:2014 (COBOL 2014 standard) | The formal language definition, including the object-oriented syntax Module 13 confirmed GnuCOBOL doesn't implement |
| *COBOL for the 21st Century* (Nancy Stern, Robert Stern, James Ley) | A modern, widely-used textbook covering the same fixed-form, file-oriented style this guide anchors to |
| This series' [Fortran guide](../fortran/00-overview.md) | COBOL's contemporary from computing's founding era — business data processing alongside Fortran's scientific computing |
| This series' [SQL guide](../sql/00-overview.md) | The direct successor to Module 8's indexed-file record-key lookups |
| This series' [C guide](../c/00-overview.md) | Module 10's C-interop extension is a direct, real instance of this series' C-as-FFI-target thread |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Only `IDENTIFICATION DIVISION` and `PROCEDURE DIVISION` are required | Module 1 |
| Area A = columns 8–11 (DIVISION/SECTION/paragraph headers, `01`/`77` levels); Area B = columns 12–72 (everything else) | Module 1 |
| Text past column 72 is silently truncated, verified directly | Module 1 |
| `PIC S9(7)V99` — `V` is implied, no storage; `S` makes it signed | Module 1–2 |
| `COMPUTE ... ROUNDED`, `ON SIZE ERROR` — unguarded overflow silently keeps only low-order digits | Module 2 |
| `COMP-3` — packed decimal, ~half the storage of `DISPLAY` usage, same value/arithmetic | Module 2 |
| Fixed-decimal `PIC` arithmetic never has binary float's `0.1 + 0.2 ≠ 0.3` problem | Module 2 |
| `EVALUATE TRUE WHEN condition` — an if/elif chain in switch clothing | Module 3 |
| `PERFORM VARYING x FROM 1 BY 1 UNTIL x > n` — checked before each iteration | Module 3 |
| 88-level condition names — `IF WS-ACTIVE` instead of `IF WS-STATUS = 1` | Module 3 |
| `SELECT ... ASSIGN TO ... ORGANIZATION IS LINE SEQUENTIAL` + `FD` + record layout | Module 5 |
| `PERFORM UNTIL WS-EOF` / `READ ... AT END ... NOT AT END` — the canonical read loop | Module 5 |
| `OCCURS n TIMES` — fixed-size table, no runtime resizing | Module 6 |
| Edited `PICTURE`: `$$$,$$9.99`, `CR`/`DB` — display-only, never used in arithmetic directly | Module 6 |
| Control break: detect a key-field change, print subtotal, reset accumulator, plus one final print after the loop | Module 6 |
| `SORT ... USING ... GIVING ...` needs its own `SD` + `FILE-CONTROL` entry | Module 6 |
| `ORGANIZATION IS INDEXED`, `RECORD KEY IS field` — `READ`/`REWRITE`/`DELETE` by key, guarded by `INVALID KEY` | Module 8 |
| `SEARCH` (linear) vs. `SEARCH ALL` (binary, requires real `ASCENDING KEY` order) | Module 8 |
| `REDEFINES` — same storage, different `PIC` view, like a C `union` | Module 8 |
| `STRING ... DELIMITED BY SIZE INTO` / `UNSTRING ... DELIMITED BY "," INTO` | Module 8 |
| `COPY "file.cpy"` — textual inclusion at compile time, not a runtime import | Module 10 |
| `CALL "PROG" USING args` / `LINKAGE SECTION` / `GOBACK` — parameters matched by position | Module 10 |
| `PERFORM para-1 THRU para-3` — runs every paragraph in between too, fall-through | Module 10 |
| `CALL "c_function" USING args` — GnuCOBOL calls plain C directly, no FFI layer needed | Module 10 |
| `GO TO`-based loops trace across paragraphs; `ALTER` silently retargets a `GO TO` from elsewhere in the source | Module 12 |
| Hand-built verification: run, capture output, `diff` against an expected file | Capstone 2 |

## A note on this guide's verification tier

Every code example in this guide was compiled and run against GnuCOBOL 3.2.0 — no example was written from memory of the language spec and left unverified. One genuine self-correction happened along the way: Module 1's first attempt to test column-72 truncation behavior produced a plausible-looking but wrong conclusion, caught only by re-testing with exact per-column character inspection rather than trusting a visual line-length count — kept in as teaching material rather than quietly smoothed over, following this series' own standing practice.

## Where to go now

This guide sits alongside `fortran/` at the very start of this series' stated sequencing — Fortran for scientific computing, COBOL for business data processing, ALGOL (next) for the theoretical/structured-programming lineage the series' historical guides trace in depth. From here, follow `INDEX.md`'s own stated sequencing forward into the ALGOL → Pascal → Modula-2 → Simula → Smalltalk → C++ lineage, or jump directly to whichever guide's cross-referenced thread caught your interest along the way — Module 8's `RECORD KEY`/`PRIMARY KEY` connection to `sql/`, or Module 10's C-interop connection to `c/`, are both real, load-bearing pointers, not decorative ones.
