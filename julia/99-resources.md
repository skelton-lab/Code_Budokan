# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [The Julia manual](https://docs.julialang.org/) | The anchored toolchain's own authoritative documentation |
| *Think Julia* (Ben Lauwens, Allen Downey) | Freely available online, a full friendly introduction |
| This series' [APL guide](../apl/03-capstone-statistics-engine.md) | The exact statistics computation Capstone 3 independently reproduced and verified against |
| This series' [Python guide](../python/08-numpy-vectorization.md) | NumPy's library-level version of the array-oriented instinct this guide's Module 6 traces |
| This series' [Clojure guide](../clojure/04-multimethods.md) | The direct dispatch-mechanism comparison Module 2 drew on throughout |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `struct`/`abstract type`/`<:` — type hierarchies | Module 1 |
| Multiple dispatch — every argument's type matters, for every function, by default | Module 1 |
| Untyped parameter = catch-all fallback, like Clojure's `:default` | Module 2 |
| Julia's own `+`, `-`, etc. go through the same dispatch mechanism user code does | Module 2 |
| `Base.return_types(f, (ArgTypes,))` — check type stability directly | Module 4 |
| `@elapsed`, with a warm-up call first — fair Julia benchmarking | Module 4 |
| A single type-changing line (even `/ 1`) can destabilize a whole function | Capstone 2 |
| `.+`/`.*`/`.^`/`f.(v)` — opt-in, visible-at-the-call-site broadcasting | Module 6 |
| `sum(m, dims=1)` vs. `dims=2)` — axis-controlled reduction | Module 6 |
| Column-major array storage — `reshape` fills differently than NumPy's row-major default | Module 6 |

## A note on this guide's verification tier

Every code example in this guide was run against Julia 1.12.6 — no example was written from memory of the language's documentation and left unverified. Every performance claim was measured directly on this machine, not quoted from Julia's own marketing, including the honest observation that the *magnitude* of the type-instability performance tax varies by real, measured factors (6700× in one case, 11× in another) rather than being one fixed number this guide could have simply asserted.

## Where to go now

This guide closes a three-way loop this series opened with `apl/` (the 1962-era origin of whole-array, no-explicit-loop programming) and continued through `python/`'s NumPy module (the library-level realization of the same idea) — Julia's broadcasting is a third, genuinely distinct design point on that same spectrum. From here, `INDEX.md`'s remaining queued candidates — Erlang, Go, Rust, and Rails — are all still open.
