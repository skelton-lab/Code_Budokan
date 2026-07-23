# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [GHC User's Guide](https://downloads.haskell.org/ghc/latest/docs/users_guide/) | The anchored toolchain's own authoritative reference |
| *Learn You a Haskell for Great Good!* (Miran Lipovača) | Freely available online, the canonical friendly full introduction |
| *Real World Haskell* | Freely available online; its performance chapter covers the space-leak gap this guide named honestly |
| This series' [OCaml guide](../ocaml/00-overview.md) | The direct, matched counterpoint this entire guide was written against |
| This series' [Clojure guide](../clojure/08-sequence-abstraction-laziness.md) | The opt-in-laziness comparison Capstone 1 drew on directly |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Laziness is the default for every expression — no opt-in required | Module 1 |
| A value can sit unevaluated forever, even one that would crash if forced | Module 1 |
| `xs = ys : xs`-style self-referential infinite structures | Module 1–2 |
| `zipWith`/list comprehensions for building lazy infinite sequences | Module 2 |
| `class`/`instance` with default methods — resolved by the type checker, not the programmer or the runtime | Module 4 |
| `forall a. Shape a => AnyShape a` — existential wrapper for heterogeneous lists | Capstone 2 |
| `Maybe`/`Either` + do-notation — automatic short-circuit propagation | Module 6 |
| `Either String a` — failure with a real message, not bare absence | Module 6 |
| `IO a` — a value describing an action, not a statement that performs one | Module 8 |
| `seq` forces evaluation, not execution — a real, verified distinction | Module 8 |
| An `IO` action only runs if reachable from `main` | Module 8 |
| Keep business logic pure (`Either`), push `IO` to the edges | Capstone 4 |

## A note on this guide's verification tier

Every code example in this guide was compiled with `ghc` and run — no example was written from memory of the language's documentation and left unverified. This guide's central finding (Module 8's `seq`/inert-`IO` demonstration) went beyond the commonly-repeated beginner summary of Haskell's purity guarantee, verified directly rather than restated from received wisdom — the same standard this series has applied to every language's own folklore, from COBOL's column-72 truncation to APL's guard-syntax claims.

## Where to go now

This guide is the second half of a deliberately matched pair — **OCaml** (strict, mutation-friendly, module-system-first) and **Haskell** (lazy, purity-enforced, type-class-first) — both descending from the same 1973 ML root, diverging sharply. From here, per your stated plan: **Forth**, looping back to pick up this series' last remaining genuinely distinct paradigm — stack-based, concatenative programming — closing out the functional-language path this series opened with `scheme/`.
