# Module 8 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's three capstones. Each entry states what it is, why it matters, and where to go deeper.

### Macros and metaprogramming

**What it is:** `macro name(args) ... end`, invoked with `@name`, transforms unevaluated code before it runs — genuinely similar in spirit to Scheme/Racket's macro systems (`scheme/09-hygienic-macros.md`, `racket/06-syntax-parse-macros.md`), operating on Julia's own code-as-data (`Expr` objects) rather than S-expressions directly.

**Why it matters, verified directly:**
```julia
macro sayhi(name)
    return :(println("Hi, ", $name, "!"))
end
@sayhi "Ada"
```
```
Hi, Ada!
```
Confirmed working — real Julia metaprogramming, genuinely powerful, but none of this guide's three capstones needed code transformation at compile time.

**Where to go next:** the Julia manual's Metaprogramming chapter.

### Parametric types in depth

**What it is:** this guide's `struct`s (Module 1) were all concrete, non-parametric types — Julia also supports parametric types (`struct Point{T} x::T; y::T end`, generic over `T`), interacting with multiple dispatch in genuinely deep ways.

**Why it matters:** a real, substantial extension of everything Module 1 covered, letting a single type definition work correctly and efficiently across many concrete types — out of scope for this guide's own three-capstone focus.

**Where to go next:** the Julia manual's Types chapter, particularly the section on parametric types.

### Multi-threading and distributed computing

**What it is:** Julia has built-in support for both multi-threading (`Threads.@threads`) and distributed computing across multiple processes/machines (`Distributed` standard library) — a real, first-class part of the language's own design, not a bolted-on library.

**Why it matters:** genuinely central to why Julia is used for large-scale scientific/numerical computing in practice, but none of this guide's capstones needed concurrent or parallel execution to be correct or complete.

**Where to go next:** the Julia manual's Multi-Threading and Distributed Computing chapters.

### The package ecosystem

**What it is:** this guide stayed entirely within Base Julia — no external packages were installed or used. Real Julia work leans heavily on packages like DataFrames.jl (tabular data, a direct analog to Python's pandas), Plots.jl (visualization), and the broader SciML ecosystem (differential equations, machine learning).

**Why it matters:** genuinely how most real Julia programs are actually built, but this guide's own scope (the language's core distinctive features) didn't require installing anything beyond Base Julia itself.

**Where to go next:** the Julia package registry at `julialang.org/packages`; `Pkg.add("DataFrames")` as a first, real next step.

## The wider ecosystem

- **[The Julia manual](https://docs.julialang.org/)** — the anchored toolchain's own authoritative documentation.
- **This series' [APL guide](../apl/03-capstone-statistics-engine.md)** — the exact statistics computation this guide's Capstone 3 reproduced independently, verified to match.
- **This series' [Python guide](../python/08-numpy-vectorization.md)** — NumPy's library-level version of the same array-oriented instinct.
- **This series' [Clojure guide](../clojure/04-multimethods.md)** — the direct dispatch-mechanism comparison Module 2 drew on throughout.
