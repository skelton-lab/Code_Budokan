# COBOL — A Session-Based Study Guide

**Promise:** read, write, and maintain real COBOL as it's actually used in production — fixed-decimal financial arithmetic, file/record-based data processing, DIVISION-structured programs — well enough to recognize why a 1959 language is still running a large share of the world's core banking, insurance, and government back-end systems, not a toy subset of the syntax.

**Audience:** this series' existing reader, arriving with Fortran's fixed-form heritage, C's manual data layout, and SQL's relational/transactional model already in hand. Nothing here re-teaches "what is a loop" — every module leans directly into what's actually distinctive about COBOL: the four-DIVISION program shape, `PICTURE` clauses and fixed-decimal arithmetic as a genuine, load-bearing design choice for money (not an afterthought bolted onto a general-purpose numeric type), `COPY`-shared record layouts, and file/record I/O as the *default* data model rather than a library import.

**Toolchain (anchored):** **GnuCOBOL 3.2.0** (Homebrew: `brew install gnucobol`), which compiles COBOL to C and then to a native binary — the modern, actively maintained, real-world-relevant open-source COBOL implementation. Every example in this guide is written in traditional **fixed-form** (the Area A/B column discipline real legacy COBOL is written in), not GnuCOBOL's free-form extension — this series values authenticity over convenience, and a reader who's going to encounter real COBOL will encounter fixed-form far more often. Free-form gets a one-line name-check in Module 1, not a parallel track.

**A methodology note specific to this language:** GnuCOBOL ships no standard xUnit-style test runner the way this series' other guides had `pytest`, `minitest`, or `plunit` on hand. Capstone 2's own module builds a verification pattern by hand — run the program, capture its output, diff it against an expected file — because this series' verification-discipline thread (every guide ties its testing session back to the same idea in a different syntax) doesn't get to skip a language just because that language didn't ship the tooling for free.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Loan/Interest Calculator | DIVISION structure, `PICTURE` clauses, fixed-decimal money arithmetic (`COMPUTE`, `ROUNDED`, `ON SIZE ERROR`), basic control flow |
| 2 | Sales Batch Report | Sequential file I/O, the `PERFORM UNTIL` end-of-file read loop, control-break reporting, `OCCURS` tables, edited `PICTURE` report formatting, `SORT` |
| 3 | Customer Master File Maintenance | Indexed file organization, random access, `REWRITE`/`DELETE`/`INVALID KEY`, `SEARCH`/`SEARCH ALL`, `REDEFINES`, `STRING`/`UNSTRING` |
| 4 | Modular Billing System | `COPY`-shared copybooks, `CALL`/`USING` subprograms, `PERFORM THRU`, structuring for maintainability — with an optional C-called subroutine |

## Module list

1. **Foundations & Divisions** — the four DIVISIONs, fixed-form columns, `WORKING-STORAGE`, `PIC` clauses, `MOVE`/`DISPLAY`/`ACCEPT` → sets up Capstone 1
2. **Arithmetic & Fixed-Decimal Money** — `COMPUTE`/`ADD`/`ROUNDED`/`ON SIZE ERROR`, `COMP`/`COMP-3`, why COBOL never uses a float for money → feeds Capstone 1
3. **Control Flow** — `IF`/`EVALUATE`/`PERFORM` (basic, `UNTIL`, `VARYING`), 88-level condition names → feeds Capstone 1
4. **Capstone 1** — Loan/Interest Calculator
5. **Sequential File I/O** — `FILE SECTION`/`FD`, `SELECT`/`ASSIGN`, `OPEN`/`READ`/`WRITE`/`AT END` → feeds Capstone 2
6. **Tables & Control Breaks** — `OCCURS`, the control-break pattern, edited `PICTURE` report output, `SORT` → feeds Capstone 2
7. **Capstone 2** — Sales Batch Report, with a hand-built output-diff verification pattern
8. **Indexed Files & Search** — `ORGANIZATION IS INDEXED`, random access, `REWRITE`/`DELETE`/`INVALID KEY`, `SEARCH`/`SEARCH ALL`, `REDEFINES`, `STRING`/`UNSTRING` → feeds Capstone 3
9. **Capstone 3** — Customer Master File Maintenance
10. **Copybooks & Subprograms** — `COPY`, `CALL`/`USING`, `PERFORM THRU`, multi-program structuring, GnuCOBOL's native C interop → feeds Capstone 4
11. **Capstone 4** — Modular Billing System, with an optional C-language subroutine
12. **Reading Legacy-Style COBOL** — `GO TO`-based control flow, altered `PERFORM` chains, reasoning about safe refactoring — the "maintain" half of the stated promise
13. **Beyond This Guide** — signposts only
14. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Legacy/`GO TO`-era code reading | "Maintain" is explicit in the stated promise; can't maintain real COBOL without recognizing pre-structured idioms | **Full module (12)** |
| Hand-built output-diff verification | This series' verification-discipline thread requires a real testing session; GnuCOBOL has no standard framework | **Full**, as a Capstone 2 extension |
| CICS / mainframe JCL / transaction processing | How most production COBOL is actually invoked, but IBM-mainframe-specific with no installable toolchain to verify against | **Signpost** |
| Report Writer facility | Older declarative alternative to hand-written control-break logic; superseded in modern practice | **Signpost** |
| Screen Section (terminal I/O) | GnuCOBOL supports it, but it's not core to the batch/file-processing promise | **Signpost** |
| Object-oriented COBOL (2014 standard) | Real but rarely used in production; worth naming precisely rather than teaching in depth | **Signpost**, with an explicit callback to this series' polymorphism thread |

## Setup

```bash
brew install gnucobol
cobc --version   # confirmed: cobc (GnuCOBOL) 3.2.0
```

Verification pattern used throughout this guide — compile a fixed-form `.cbl` source to an executable, then run it and inspect the actual output:

```bash
cobc -x -free off -o program program.cbl   # -free off is the default; stated for clarity
./program
```

GnuCOBOL also accepts `-Wall` for stricter compile-time warnings, used wherever a module deliberately demonstrates a pitfall (comparing the "compiles but wrong" case against the "warns and wrong" case is itself worth seeing).
