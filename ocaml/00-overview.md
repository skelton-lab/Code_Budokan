# OCaml — A Session-Based Study Guide

**Promise:** read and write real OCaml — strict evaluation, strong Hindley-Milner type inference, algebraic data types with compiler-checked exhaustive pattern matching, and OCaml's flagship feature: a genuine module system with functors, modules parameterized by other modules. Real, first-class mutable state and exceptions are covered too — OCaml is deliberately *not* purely functional, a fact this guide states directly rather than glossing over, setting up an honest contrast with this series' next guide, Haskell.

**Audience:** this series' existing reader, arriving via the Lisp-family arc (Scheme/Racket/Clojure) with closures, recursion, and pattern-matching-as-a-concept already familiar. Hindley-Milner static type inference and a real module system are genuinely new territory this guide covers from first principles.

**Toolchain (anchored):** **OCaml 5.5.0** (Homebrew: `brew install ocaml dune`). Every example compiles with `ocamlopt file.ml -o binary` — native compilation, no `ocamlfind`/opam dependency needed for this guide's scope — then runs as an ordinary compiled binary, the same "compile and actually run it" discipline this series applied to `c/`/`cpp/`.

**A methodology note specific to this language:** this guide's own verification pass surfaced a genuinely interesting, real finding worth stating up front rather than saving for a pitfall callout: OCaml is **strict** (eager) — every subexpression really is evaluated, unlike the lazy evaluation this series' next guide, Haskell, defaults to — but that doesn't mean sibling subexpressions evaluate left-to-right. A direct test, `side_effect "a" 1 + side_effect "b" 2`, printed `evaluating b` *before* `evaluating a`. Strict and left-to-right are two separate guarantees; OCaml provides only the first.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Type-Safe Expression Evaluator | Algebraic data types, pattern matching, with the compiler's own exhaustiveness warning verified catching a forgotten case by name |
| 2 | Generic Data Structures via Functors | A module parameterized by another module, instantiated twice for genuinely different types with zero duplicated logic |
| 3 | A Stateful Simulation | `ref` cells, exceptions, and OCaml's verified-not-guaranteed evaluation order as a real, honest pitfall |

## Module list

1. **Foundations: Types, Let-Bindings, Strict Evaluation** — `let`, function syntax, type inference, the evaluation-order finding above → sets up Capstone 1
2. **Algebraic Data Types & Pattern Matching** — variant types, exhaustiveness checking → feeds Capstone 1
3. **Capstone 1** — A Type-Safe Expression Evaluator
4. **The Module System: Structures & Signatures** — `module`/`module type`, abstraction → feeds Capstone 2
5. **Functors: Modules as Functions** → feeds Capstone 2
6. **Capstone 2** — Generic Data Structures via Functors
7. **Mutable State: `ref` Cells** — `:=`, `!`, deliberately not purely functional → feeds Capstone 3
8. **Exceptions** — `raise`/`try`/`with` → feeds Capstone 3
9. **Capstone 3** — A Stateful Simulation
10. **Beyond This Guide** — signposts only
11. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| GADTs, polymorphic variants | Doesn't touch a capstone; genuinely deep type-system territory | **Signpost** |
| First-class modules | Doesn't touch a capstone | **Signpost** |
| OCaml 5's effect handlers (multicore) | Doesn't touch a capstone, but a real, modern feature this exact toolchain version supports | **Signpost**, named honestly |
| OCaml's object system (`class`) | Doesn't touch a capstone; rarely used in idiomatic modern OCaml despite the language's name | **Signpost** |
| Dune project structure in depth | This guide's capstones stay single-file, compiled directly | **Signpost** |

## Setup

```bash
brew install ocaml dune
ocaml -version   # confirmed: The OCaml toplevel, version 5.5.0
```

Verification pattern used throughout this guide:

```bash
ocamlopt file.ml -o binary && ./binary
```
