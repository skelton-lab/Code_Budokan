# Companion — OCaml (not in the original Budokan module list)

**Founding paper (theoretical root):** Milner, R. (1978). "A Theory of Type Polymorphism in Programming." *Journal of Computer and System Sciences*, 17(3), 348–375. — sourced directly from the Code Budokan Reading Workbook, Strand C, where it's named as "the mathematical foundation of ML, OCaml, Haskell, and — through their influence — Rust's type system and TypeScript's type inference."

**OCaml-specific history: independently supplied.** OCaml itself doesn't appear in the Budokan workbook's own module list — it predates the workbook's writing, added to `code-rookie` after the original plan was set. The direct lineage, confirmed via `ocaml/00-overview.md`'s own framing and independent knowledge of the ML family: ML (Robin Milner, Edinburgh, early 1970s, originally a tactic language for the LCF theorem prover) → Caml (INRIA, mid-1980s) → Caml Light → **OCaml** ("Objective Caml," 1996, adding object-oriented features to Caml), led by Xavier Leroy at INRIA.

## Historical note

Milner's own paper answers a real, practical tension that had no clean solution before it: static typing catches real bugs before a program runs, but requiring a programmer to write out every type annotation by hand is genuinely tedious, enough that dynamically-typed languages traded away compile-time safety specifically to avoid it. Milner's Hindley-Milner type inference algorithm — a compiler can infer the type of every expression in a program with no annotations at all, and do so efficiently — dissolved that tradeoff. `ocaml/00-overview.md` names Hindley-Milner inference directly as one of the guide's own four core pillars, alongside algebraic data types with compiler-checked exhaustive pattern matching and OCaml's own flagship feature: a genuine module system with functors (modules parameterized by other modules), covered in `ocaml/05-functors.md`.

OCaml's own real distinctiveness, relative to the ML lineage's other major branch (Haskell, companion: `haskell.md`), is a choice Milner's paper itself doesn't dictate: strict evaluation and real, first-class mutable state and exceptions, rather than laziness and enforced purity. `ocaml/00-overview.md` states this directly rather than glossing over it — "OCaml is deliberately *not* purely functional" — setting up the guide's own explicit contrast with Haskell as two genuinely different answers built on the identical Milner-derived type-inference foundation.

## Reflection prompts

- Milner's paper solves the "type annotations are tedious" problem specifically. `rust/00-overview.md` doesn't use full Hindley-Milner inference (Rust requires some annotations Haskell/OCaml don't) — read `rust/01-ownership-and-moves.md` and consider what Rust's own ownership system needed from its type system that a pure Hindley-Milner approach wouldn't have provided on its own.
- OCaml and Haskell share the identical theoretical foundation (Milner) but chose opposite defaults for evaluation strategy and purity. `ocaml/01-foundations-types-strict-eval.md`'s own verified finding — that OCaml's strict evaluation order is unspecified between subexpressions, contrary to what a reader might assume — complicates the "strict vs. lazy" contrast in a way worth sitting with directly. What does "strict" actually guarantee, if not left-to-right order?

## Short-answer questions

1. **What practical tension does Milner's 1978 Hindley-Milner type inference resolve, verified as one of OCaml's own core pillars?** That static typing catches real bugs before runtime but traditionally required tedious, hand-written type annotations — Milner's algorithm lets a compiler infer every expression's type with no annotations at all, as efficiently as a dynamically-typed language's own type-free convenience.
2. **What is OCaml's own direct lineage, from ML through to 1996?** ML (Robin Milner, Edinburgh, early 1970s) → Caml (INRIA, mid-1980s) → Caml Light → OCaml ("Objective Caml," 1996, adding object-oriented features), led by Xavier Leroy at INRIA.
3. **What genuine choice does `ocaml/00-overview.md` state directly, rather than glossing over, that separates OCaml from Haskell despite sharing Milner's own type-theoretic foundation?** That OCaml is deliberately not purely functional — real, first-class mutable state and exceptions are genuine, idiomatic parts of the language, unlike Haskell's enforced purity.
4. **What real, verified finding did `ocaml/01-foundations-types-strict-eval.md` establish about OCaml's own evaluation order, distinct from "strict vs. lazy"?** That OCaml's strict evaluation guarantees every subexpression genuinely runs, but not in a specified left-to-right order — verified directly with a side-effect example printing "evaluating b" before "evaluating a," contradicting the left-to-right assumption a reader coming from most other languages in this series would likely make.

## Links into the guide

- [`ocaml/04-modules-structures-signatures.md`](../ocaml/04-modules-structures-signatures.md) and [`ocaml/05-functors.md`](../ocaml/05-functors.md) — the module system Milner's own type theory made rigorous enough to build on.
- [`ocaml/01-foundations-types-strict-eval.md`](../ocaml/01-foundations-types-strict-eval.md) — the strict-but-not-ordered evaluation finding.

## Cross-thread connection

No direct AI-canon or Hunter-thread pairing exists in the Budokan workbook for OCaml specifically, since it isn't in the workbook's own original module list. The genuinely relevant connection is internal to `code-rookie` itself: `haskell/00-overview.md` is explicitly "written to be read *against*" OCaml, making this pair — unusually among this companion's entries — a comparison the guides themselves already make directly, rather than one this companion needs to supply.
