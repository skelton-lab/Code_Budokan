# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [The Go documentation](https://go.dev/doc/) | The anchored toolchain's own authoritative reference |
| *The Go Programming Language* (Donovan & Kernighan) | The widely-recommended standard textbook |
| This series' [C guide](../c/00-overview.md) | Ken Thompson's own earlier language, the direct lineage this guide's overview named |
| This series' [Docker guide](../docker/00-overview.md) | Written in Go, the practical hook this guide opened with |
| This series' [Erlang guide](../erlang/07-capstone-self-healing-supervisor.md) | The supervisor-pattern comparison Capstone 3 drew on directly |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `go functionCall()` — a lightweight, runtime-managed goroutine | Module 1 |
| Unbuffered channel — synchronous rendezvous, genuinely blocks | Module 1 |
| Buffered channel + worker pool — multiple goroutines sharing one channel | Module 1 |
| Concurrency isn't free — measure, don't assume (6700×→11× echoes `julia/`) | Capstone 1 |
| Interfaces satisfied implicitly, checked at compile time | Module 3 |
| A type can satisfy standard-library interfaces (`Stringer`) with zero registration | Capstone 2 |
| `(result, error)` — failure as an ordinary, easily-ignorable value | Module 5 |
| `_` discards an error silently — zero warning, zero error | Module 5 |
| `defer` — LIFO order, arguments evaluated immediately | Module 6 |
| `panic`/`recover` — for genuinely unexpected failures, not routine ones | Module 6 |
| Per-item `recover` vs. Erlang's per-process supervisor restart | Capstone 3 |

## A note on this guide's verification tier

Every code example in this guide was run with `go run` — no example was written from memory of the language's documentation and left unverified. Capstone 1's central finding was measured twice, deliberately, against two different inputs, specifically to avoid presenting a one-sided "concurrency is faster" claim the way a less careful guide might have — the honest result (slower for small work, faster for large work) is the actual finding, not an inconvenience to average away.

## Where to go now

This guide closes out the `docker/` connection this series carried unstated since that guide was written, and extends the C lineage thread (`INDEX.md`'s "ALGOL's three lineages") forward through Ken Thompson's own later work. From here, `INDEX.md`'s remaining queued candidates — Rust and Rails — are both still open, with Rust proposed specifically as the compile-time-safety foil to `c/`/`cpp/`'s own sanitizer-verified story.
