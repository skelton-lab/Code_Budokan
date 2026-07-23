# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [OCaml manual](https://ocaml.org/manual) | The anchored toolchain's own authoritative reference |
| *Real World OCaml* (Minsky, Madhavapeddy, Hickey) | Widely-recommended, freely available full introduction, including topics this guide only signposted |
| This series' [Scheme guide](../scheme/00-overview.md) | Closures, recursion, and pattern-matching-as-a-concept this guide assumed already familiar |
| This series' [Racket guide](../racket/02-contracts.md) | The module/interface comparison this guide's Module 4 drew on directly |
| This series' [Clojure guide](../clojure/06-value-vs-identity-atoms.md) | The `ref`-vs-`atom` parallel this guide's Module 7 drew on directly |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `ocamlc -i file.ml` — see inferred types with zero annotations written | Module 1 |
| `+`/`-`/`*`/`/` (int) vs. `+.`/`-.`/`*.`/`/.` (float) — never mixed implicitly | Module 1 |
| Strict evaluation ≠ left-to-right order (verified directly) | Module 1 |
| `type t = A of x | B of y \| ...` — variant types | Module 2 |
| Exhaustiveness checking — the compiler names the missing case | Module 2 |
| `let rec` — required for a function to call itself | Module 2 |
| `option` (`Some`/`None`) — failure as a real type, not an exception | Capstone 1 |
| `module type SIG = sig ... end` / `module M : SIG = struct ... end` | Module 4 |
| Abstract `type 'a t` in a signature — real, compiler-enforced hiding | Module 4 |
| `module Make (Param : SIG) = struct ... end` — functors, modules as functions | Module 5 |
| `ref`/`:=`/`!` — a shared, mutable identity, like Clojure's `atom` | Module 7 |
| `mutable` record field + `<-` — a second, field-scoped mutation mechanism | Module 7 |
| `exception Name of type` / `raise` / `try ... with` | Module 8 |
| `10 / 0` raises `Division_by_zero`; `10.0 /. 0.0` silently gives `inf` | Module 8 |

## A note on this guide's verification tier

Every code example in this guide was compiled with `ocamlopt` and run — no example was written from memory of the language's documentation and left unverified. This guide reported one topic (OCaml 5's effect handlers, Module 10) as explicitly **unverified** rather than either confirmed or silently omitted, when a direct attempt at a minimal working example didn't succeed — the same honesty standard this series applies to a caught bug, applied here to a claim that simply couldn't be substantiated in the time available.

## Where to go now

This guide is the first of two independent branches in this series' broader functional-programming coverage — **OCaml** (the direct ML lineage: strict, mutation-friendly, module-system-first) sits alongside the upcoming **Haskell** guide (a related but genuinely independent sibling: lazy, purity-enforced by the type system). From here: **Haskell**, this series' next guide, where nearly every design choice this guide made deliberately (strict evaluation, real mutation, exceptions) gets a direct, honest counterpoint — followed by **Forth**, looping back to pick up this series' last remaining genuinely distinct paradigm, stack-based concatenative programming.
