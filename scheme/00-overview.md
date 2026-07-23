# Scheme — A Session-Based Study Guide

**Promise:** read, write, and reason about real Scheme — S-expressions as both code and data, recursion as the primary iteration mechanism (backed by *guaranteed* proper tail calls, not an optional compiler optimization), first-class continuations, and hygienic macros — capped by writing a small interpreter for a subset of Scheme *in Scheme itself*, the classic capstone that makes homoiconicity concrete rather than a slogan.

**Audience:** this series' existing reader, arriving with functional idioms already touched in Python and JavaScript, and Prolog's declarative paradigm already in hand. This is the first language in this series where code and data share literally the same representation — every previous language kept "the program" and "the data the program manipulates" as separate categories; Scheme doesn't.

**Toolchain (anchored):** **MIT/GNU Scheme 12.1** (Homebrew: `brew install mit-scheme`) — the implementation historically associated with *Structure and Interpretation of Computer Programs* (SICP), still actively maintained. Not strict R7RS in every corner (noted honestly where it diverges, not glossed over as if it were). Every example is run non-interactively: `mit-scheme --quiet < file.scm`, ending in an explicit `(exit)` — MIT Scheme drops into an interactive REPL by default and won't terminate on its own from piped input without it.

**A methodology note specific to this language:** four of this guide's five capstones lean on features verified directly before this guide's architecture was even finalized — exact rational arithmetic (`1/3 + 1/6` staying exactly `1/2`, not a float approximation), `call/cc`, `define-syntax`/`syntax-rules`, `define-record-type`, and genuinely stack-safe tail recursion to a million iterations, all confirmed against this exact toolchain before a single module got written. This series treats "the language spec says X" as a claim to verify, not a claim to trust — Scheme's own guarantee of proper tail calls (a semantic requirement of the standard, not a "the compiler probably does this" optimization most languages offer) makes that distinction unusually concrete here.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Symbolic Differentiation | S-expressions as data, recursion, `cond`-based dispatch on list structure, exact rational coefficients staying exact throughout |
| 2 | Continuations-Based Control Flow | `call/cc`, escape continuations, building early-exit/backtracking control flow by hand |
| 3 | A New Control-Flow Macro | `define-syntax`/`syntax-rules`, the concrete payoff of homoiconicity |
| 4 | Metacircular Evaluator | Closures, environments, recursion — a small Scheme interpreter written in Scheme |

## Module list

1. **Foundations: S-expressions, Pairs & Lists** — atoms, pairs, `cons`/`car`/`cdr`, `define`, `if`/`cond`, basic recursion → sets up Capstone 1
2. **Exact Numbers** — the numeric tower, exact rationals vs. inexact floats → feeds Capstone 1
3. **Data-Directed Recursion** — dispatching on list structure to process nested expressions → feeds Capstone 1
4. **Capstone 1** — Symbolic Differentiation
5. **Proper Tail Calls & Iteration** — named-`let`, `do`, why Scheme guarantees this rather than merely offering it → feeds Capstone 2
6. **Higher-Order Functions & Closures** — `lambda`, lexical scoping, `map`/`filter`/`fold` → feeds Capstone 2
7. **Continuations** — `call/cc`, escape continuations → feeds Capstone 2
8. **Capstone 2** — Continuations-Based Control Flow
9. **Hygienic Macros** — `define-syntax`/`syntax-rules`, macro vs. procedure → feeds Capstone 3
10. **Capstone 3** — A New Control-Flow Macro
11. **Environments & the Eval/Apply Cycle** — `define-record-type`, representing variable bindings → feeds Capstone 4
12. **Capstone 4** — Metacircular Evaluator
13. **Beyond This Guide** — signposts only
14. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Common Lisp vs. Scheme differences | Doesn't touch a capstone, but sets up how Racket/Clojure get framed later in this series | **Signpost** |
| R7RS `define-library` module system | MIT Scheme's own library support diverges from strict R7RS; not required by any capstone | **Signpost** |
| Full continuation theory (`dynamic-wind`, CPS transformation) | Capstone 2 only needs escape continuations | **Signpost** |
| Concurrency/threads | Doesn't touch a capstone | **Signpost** |
| FFI/C interop | Doesn't touch a capstone | **Signpost** |
| Generic/object systems beyond `define-record-type` | `define-record-type` alone is sufficient for Capstone 4's environment representation | **Signpost** |

## Setup

```bash
brew install mit-scheme
mit-scheme --version   # confirmed: MIT/GNU Scheme 12.1
```

Verification pattern used throughout this guide — every script ends in an explicit `(exit)`, since MIT Scheme's REPL doesn't terminate on its own from piped input:

```bash
mit-scheme --quiet < script.scm
```
