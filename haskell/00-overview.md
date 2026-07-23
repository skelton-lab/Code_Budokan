# Haskell — A Session-Based Study Guide

**Promise:** read and write real Haskell — laziness as the language's *default* evaluation strategy (not an opt-in library feature the way Clojure's `lazy-seq` was), type classes as a genuinely distinct third polymorphism mechanism, `Maybe`/`Either` with do-notation for safe, automatically-short-circuiting composition, and IO as a real value in the type system — the direct, honest counterpoint this series' `ocaml/` guide set up explicitly.

**Audience:** straight off `ocaml/`, with every contrast point already primed: strict vs. lazy, real mutation vs. enforced purity, exceptions vs. typed failure. This guide is written to be read *against* that one, not in isolation.

**Toolchain (anchored):** **GHC 9.14.1** (Homebrew: `brew install ghc`). Every example compiles with `ghc -o binary file.hs` and runs as an ordinary compiled binary — the same discipline this series applied throughout, including `ocaml/`'s own `ocamlopt` invocation.

**A methodology note specific to this language:** this guide's own verification pass surfaced something sharper than a simple "IO and pure code are separate" rule. A function typed `Int -> Int` (claiming purity) was written to embed `putStrLn "sneaky!"` via `seq`, forcing evaluation of the IO action as a *value*. It compiled — Haskell's type system genuinely permits this. But running it never printed anything at all: `seq` only forces an `IO` action to a value (weak head normal form), it doesn't *run* it — actually performing an IO action requires it to be threaded into `main`'s own IO chain. This is a real, verified, sharper truth than "pure functions can't do IO": an IO action is inert data until connected to `main`, not a statement that fires the moment it's merely evaluated.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Infinite Lazy Sequences, Proven | Self-referential infinite lists, a lazy sieve of Eratosthenes, and a verified demonstration that a value which would crash if evaluated can sit unevaluated forever |
| 2 | A Polymorphic Shape Library | Type classes with default methods — the third entry in this series' cross-guide polymorphism comparison, alongside OCaml's functors and Clojure's protocols/multimethods |
| 3 | Safe Composition with `Either` | An expression evaluator directly mirroring `ocaml/03-capstone-expression-evaluator.md`, upgraded with real error messages and do-notation's automatic short-circuiting |
| 4 | IO as a Value, Made Concrete | A real interactive program, built on the verified `seq`/inert-IO-value finding as its conceptual anchor |

## Module list

1. **Foundations: Laziness by Default** — self-referential infinite lists, the error-avoidance proof → sets up Capstone 1
2. **Building Infinite Sequences** — `zipWith`, the sieve of Eratosthenes → feeds Capstone 1
3. **Capstone 1** — Infinite Lazy Sequences, Proven
4. **Type Classes** — `class`/`instance`, default methods → feeds Capstone 2
5. **Capstone 2** — A Polymorphic Shape Library
6. **`Maybe`, `Either`, and Do-Notation** — safe composition, automatic short-circuiting → feeds Capstone 3
7. **Capstone 3** — Safe Composition with `Either`
8. **IO as a Value** — the `seq`/inert-IO finding, the purity boundary → feeds Capstone 4
9. **Capstone 4** — IO as a Value, Made Concrete
10. **Beyond This Guide** — signposts only
11. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Functor/Applicative/Monad hierarchy in full | This guide uses `Maybe`/`Either`/`IO` concretely without the full abstract hierarchy | **Signpost** |
| Monad transformers | Doesn't touch a capstone | **Signpost** |
| Space leaks / lazy-evaluation performance pitfalls | This guide focuses on correctness, not performance | **Signpost**, named honestly as a real gap |
| GADTs | Doesn't touch a capstone | **Signpost** |
| Stack/Cabal project tooling | This guide's capstones stay single-file, compiled directly, like `ocaml/`'s | **Signpost** |

## Setup

```bash
brew install ghc
ghc --version   # confirmed: The Glorious Glasgow Haskell Compilation System, version 9.14.1
```

Verification pattern used throughout this guide:

```bash
ghc -o binary file.hs && ./binary
```
