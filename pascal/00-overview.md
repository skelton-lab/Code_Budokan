# Pascal — A Session-Based Study Guide

**Promise:** read, write, and maintain structured Pascal — strong static typing, records, enumerated and subrange types, the built-in set type, and pointer-based dynamic data structures — understanding precisely what Niklaus Wirth simplified and fixed relative to ALGOL 60 when he designed it, and what he deliberately left out.

**Audience:** this series' existing reader, fresh off `algol/`. Pascal (1970) is Wirth's own direct answer to ALGOL 60/68's growing complexity — he sat on the ALGOL 68 design committee, disagreed with the direction it took, and built Pascal as a smaller, stricter, teaching-oriented alternative. This guide leans on that relationship directly: every module that has a clean ALGOL counterpart says so, and states precisely what changed, rather than re-explaining block structure or procedures from zero.

**Toolchain (anchored):** **Free Pascal 3.2.2** via Homebrew (`fpc`), confirmed installed and working, including its default `-Mfpc` mode. ISO-mode compilation (`-Miso`) was checked directly and works for the material this guide covers, but this guide anchors to FPC's own default mode — the actively-used, real-world way Pascal is compiled today — and names `-Miso`/`-Mtp`/`-Mdelphi` as available alternatives rather than building a parallel track across them.

**A methodology note specific to this guide:** the ALGOL guide (`algol/00-overview.md`) had to split nearly every module into executed-vs-documented, since no maintained ALGOL 60 compiler exists. Pascal has the opposite problem in the best way — Free Pascal is real, current, and fully capable of running every example in this guide. Every claim below is executed and verified, including the direct points of contrast with ALGOL that motivate several of this guide's sessions.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A structured control-flow refactor | `case`, `for`/`while`/`repeat`, value vs. `var` parameters — direct contrast with `algol/`'s call-by-name and missing `case` statement |
| 2 | A contact-record system | Records, enumerated types, subrange types — Pascal's strong-typing discipline |
| 3 | A character classifier | The built-in `set` type — genuinely distinctive, rare in mainstream languages since |
| 4 | A linked list, built by hand | Typed pointers, `New`/`Dispose` — contrasted directly with C's untyped, arithmetic-capable pointers |

## Module list

1. **Foundations: what Wirth changed** — Pascal's design goals versus ALGOL 60/68's, block structure inherited unchanged, `program`/`begin`/`end` → sets up Capstone 1
2. **Control flow, procedures, and parameters** — `case` (ALGOL 60 never had one), `for`/`while`/`repeat`, value vs. `var` parameters (contrasted with ALGOL's call-by-name) → feeds Capstone 1
3. **Capstone 1** — Structured control-flow refactor
4. **Records, enumerated types, and subrange types** — strong static typing → feeds Capstone 2
5. **Capstone 2** — Contact-record system
6. **Sets** — built-in set type and operators → feeds Capstone 3
7. **Capstone 3** — Character classifier
8. **Pointers and dynamic data structures** — `New`/`Dispose`, typed pointers → feeds Capstone 4
9. **Capstone 4** — Hand-built linked list
10. **Beyond this guide** — signposts only
11. **Final assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| The dangling-else problem, revisited | Directly relevant given `algol/`'s own module on it | **Full**, folded into Module 2 — a real, verified three-way contrast (ALGOL 60's ambiguity, ALGOL 68's fix, Pascal's choice) |
| Units / separate compilation | Doesn't touch any capstone at this guide's single-file scale | **Signpost** — and the direct, named reason Wirth designed Modula-2 next |
| Object Pascal / Delphi-style OOP extensions | Out of scope by design — this guide is standard procedural Pascal, not its later object-oriented descendants | **Signpost** |
| Strict ISO 7185 conformance | This guide's examples were checked directly against `-Miso` and work; deep conformance edge cases are not this guide's focus | **Signpost** |

## Setup

```bash
brew install fpc
fpc -iV   # confirmed: 3.2.2
```

```bash
fpc program.pas
./program
```
