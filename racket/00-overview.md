# Racket — A Session-Based Study Guide

**Promise:** read, write, and reason about real Racket — leaning entirely into what's genuinely distinctive relative to Scheme, not re-teaching S-expressions, recursion, or closures. Modules with real runtime contracts, `racket/class`'s object system, `syntax-parse` macros with actual usable error messages, and — the flagship capability — building an entirely new, genuinely restricted language on top of Racket's own platform.

**Audience:** straight off this series' `scheme/` guide, so every foundational concept there is assumed, not repeated. This guide is entirely about what Racket adds on top of that shared Lisp-family foundation.

**Toolchain (anchored):** **Racket CS v9.2** (Homebrew: `brew install minimal-racket` — the CLI-only distribution; the full DrRacket GUI IDE is a separate cask, `brew install --cask racket`, and this guide doesn't need it). Confirmed running on **Chez Scheme** (`[cs]` appears in Racket's own startup banner) — the exact toolchain `scheme/99-resources.md` already flagged as a forward-pointer: Racket's own modern runtime is literally built on the Scheme implementation this series' previous guide anchored to.

**A methodology note specific to this language:** every one of this guide's four capstone features was verified directly, working, before this guide's architecture was even finalized — including the hardest one to get right: a custom `#lang`. The first working draft of that custom language provided its functions but forgot to re-export `#%app`/`#%datum` (the core forms that let a language's body even parse as function applications and literals at all) — it failed outright with `no #%app syntax transformer is bound`. Fixed by explicitly providing those forms, then verified a second time that the new language is *genuinely* restricted, not just Racket with extra names: `(+ 1 2)` inside it fails with `+: unbound identifier`, confirming it isn't secretly still plain Racket underneath.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Contracted Stack ADT | Modules (`require`/`provide`), `struct`, `racket/contract`, a real verified blame message on a contract violation |
| 2 | An Object Hierarchy | `racket/class`, inheritance, `define/override` — a new entry in this series' polymorphism thread |
| 3 | A Better Macro | `syntax-parse`, syntax classes, keyword arguments, and a direct, verified contrast against Scheme's `syntax-rules` error messages |
| 4 | A Custom `#lang` | `#%module-begin`/`#%app`/`#%datum`, `#lang s-exp` — a genuinely restricted DSL, verified as such |

## Module list

1. **Foundations: Modules & `#lang`** — `require`/`provide`, `struct` (mutable/immutable, `#:transparent`) → sets up Capstone 1
2. **Contracts** — `racket/contract`, `contract-out`, `->`/`and/c`/`or/c`, verified blame messages → feeds Capstone 1
3. **Capstone 1** — A Contracted Stack ADT
4. **Classes & Objects** — `racket/class`, `class`/`new`/`send`, inheritance, `define/override` → feeds Capstone 2
5. **Capstone 2** — An Object Hierarchy
6. **Beyond `syntax-rules`: `syntax-parse`** — syntax classes, keyword arguments, real compile-time errors → feeds Capstone 3
7. **Capstone 3** — A Better Macro
8. **Language-Oriented Programming** — `#%module-begin`, `#lang s-exp`, building a genuinely restricted language → feeds Capstone 4
9. **Capstone 4** — A Custom `#lang`
10. **Beyond This Guide** — signposts only
11. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Typed Racket | Doesn't touch a capstone; a substantial sub-language of its own | **Signpost** |
| `racket/gui`, DrRacket IDE | This series stays CLI-first, verified by actually running code | **Signpost** |
| `raco` (packaging, distribution) | Doesn't touch a capstone | **Signpost**, brief practical note |
| A truly custom *reader* (non-S-expression surface syntax) | Materially bigger than Capstone 4's `#lang s-exp` scope | **Signpost** — named as "the next level" |
| Concurrency (green threads, places) | Doesn't touch a capstone | **Signpost** |

## Setup

```bash
brew install minimal-racket
racket --version   # confirmed: Welcome to Racket v9.2 [cs].
```

Every example runs as `racket file.rkt`. Multi-file examples (Capstone 1 onward) are noted explicitly with their directory layout.
