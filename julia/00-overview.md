# Julia — A Session-Based Study Guide

**Promise:** read and write real Julia — leaning into its three genuinely distinctive pillars: multiple dispatch as the language's *native, default* polymorphism mechanism, JIT-compiled performance that depends critically on a real, measurable property called type stability, and array broadcasting that closes a three-way loop this series opened with `apl/` and continued with `python/`'s NumPy module.

**Audience:** this series' existing reader. The polymorphism thread (`INDEX.md`, now nine guides deep) and the array-oriented programming thread (`apl/` → `python/08-numpy-vectorization.md`) are both already primed for a direct third comparison point — this guide provides it.

**Toolchain (anchored):** **Julia 1.12.6** (Homebrew: `brew install julia`). Every example runs via `julia file.jl`.

**A methodology note specific to this language:** this guide's central performance claim wasn't estimated or quoted from Julia's own marketing ("as fast as C") — it was measured directly, on this exact machine. Two versions of the identical summing loop, one where the accumulator's type never changes and one where it silently changes from `Int` to `Float64` partway through, were run back to back: `4.208e-6` seconds versus `0.0284` seconds — roughly **6700× slower** for the type-unstable version, doing the same arithmetic. This is the concrete, checkable meaning behind "type stability matters" — not a claim to trust, a number to verify.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Multiple Dispatch: A Polymorphic Library | The 10th entry in this series' polymorphism thread — dispatch on *every* argument's type, as the language's default, not an opt-in mechanism |
| 2 | Measuring Type Stability | A real, measured ~6700× performance gap between a type-stable and type-unstable version of the identical loop |
| 3 | Array-Oriented Computation with Broadcasting | Dot-syntax broadcasting, closing the loop `apl/` opened and `python/`'s NumPy module continued |

## Module list

1. **Foundations: Types, Functions, and Multiple Dispatch** — `struct`, abstract types, multiple dispatch verified directly → sets up Capstone 1
2. **Comparing Dispatch Mechanisms** — Julia's native dispatch vs. Clojure's opt-in multimethods → feeds Capstone 1
3. **Capstone 1** — Multiple Dispatch: A Polymorphic Library
4. **Type Stability and the JIT** — `@elapsed`, warm-up, the measured stable-vs-unstable finding → feeds Capstone 2
5. **Capstone 2** — Measuring Type Stability
6. **Broadcasting: The Dot Syntax** — `.+`, `.*`, `f.(v)`, axis-controlled reduction → feeds Capstone 3
7. **Capstone 3** — Array-Oriented Computation
8. **Beyond This Guide** — signposts only
9. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Macros/metaprogramming (`@macro`, `Expr`, `quote`) | Doesn't touch a capstone; real, Lisp-inspired territory | **Signpost** |
| Parametric types in depth | Doesn't touch a capstone | **Signpost** |
| Multi-threading/distributed computing | Doesn't touch a capstone | **Signpost** |
| Package ecosystem (DataFrames.jl, Plots.jl, etc.) | This guide stays in Base Julia throughout | **Signpost** |

## Setup

```bash
brew install julia
julia --version   # confirmed: julia version 1.12.6
```

Verification pattern used throughout this guide:

```bash
julia file.jl
```
