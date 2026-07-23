# Companion — Go (Budokan Module 16)

**Founding document:** Donovan, A.A.H. & Kernighan, B.W. *The Go Programming Language*, and the Go specification itself (2009). — sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Go's own creators are named directly in the Code Budokan history's [Era IV profile of Ken Thompson](history/era-4-software-revolution.md): Thompson (C's own co-creator, alongside Ritchie, forty years earlier) and Rob Pike designed Go together in 2009, the same pair who created UTF-8 encoding together in 1992. `go/00-overview.md` states the same lineage as this guide's own real "hook": Ken Thompson, "B's own creator and half of C's origin story," co-designed Go decades later — meaning `code-rookie`'s own ALGOL's-three-lineages thread (companion: `algol.md`'s cross-thread note traces this to Turing) has a genuine, direct fourth generation: ALGOL 60 → CPL → BCPL → B (Thompson) → C (Ritchie, with Thompson) → **Go** (Thompson, with Pike), one person's own career spanning from B to Go, roughly forty years apart.

Go's own real design bet, distinct from C's — verified directly in `go/01-foundations-goroutines-channels.md` — is CSP-based concurrency: goroutines (lightweight, runtime-managed, not OS threads) and channels, offering a genuine third point of comparison in this series' own concurrency thread, alongside Clojure's shared-memory `atom` and Erlang's asynchronous actor mailboxes (companion: `erlang.md`). `go/00-overview.md`'s own methodology note states the guide's central honest finding directly: Go's explicit, simple error-handling philosophy has a real, verified cost — `result, _ := safeDivide(10, 0)` compiles and runs with zero warning, silently producing a value indistinguishable from success.

## Reflection prompts

- Ken Thompson's own career spans B (late 1960s) to C (1972, with Ritchie) to Go (2009, with Pike) — roughly forty years, one person, three languages, all systems-programming-oriented. What stayed constant in his own design instincts across four decades, and what genuinely changed?
- `go/00-overview.md`'s own methodology note treats a verified, honest cost (the silently-discarded error) as central material, not something to omit. Compare this directly to Rust's own compile-time-enforced answer to a related problem (companion: `rust.md`) — what would Go's own design have to change to make the silent-discard case a compile error instead of a silent runtime possibility?

## Short-answer questions

1. **Who designed Go, and what earlier, unrelated collaboration did the same two people already have, per the Code Budokan history?** Ken Thompson and Rob Pike, in 2009 — the same pair co-created UTF-8 encoding together in 1992, seventeen years earlier.
2. **What four-generation lineage does `go/00-overview.md`'s own framing extend, tracing back through this series' own ALGOL's-three-lineages thread?** ALGOL 60 → CPL → BCPL → B (Thompson) → C (Ritchie, with Thompson) → Go (Thompson, with Pike) — one branch of ALGOL's own descendants, spanning roughly fifty years and, for its middle-to-end stretch, one person's own career.
3. **What real, verified cost does `go/05-error-handling-explicit-returns.md` establish about Go's own error-handling philosophy?** That `result, _ := safeDivide(10, 0)` compiles cleanly and runs with zero warning of any kind, silently producing a legitimate-looking zero value rather than any signal that the operation actually failed.

## Links into the guide

- [`go/01-foundations-goroutines-channels.md`](../go/01-foundations-goroutines-channels.md) — CSP-based concurrency, the third point in this series' own concurrency-philosophy comparison.
- [`go/05-error-handling-explicit-returns.md`](../go/05-error-handling-explicit-returns.md) — the verified, honest cost of Go's own explicit-error philosophy.

## Cross-thread connection

The Budokan workbook's own master table pairs Go with Park et al.'s 2023 Generative Agents paper — "concurrent agent loops." The connection is genuine: goroutines and channels are, structurally, a real, practical implementation of exactly the kind of concurrent, communicating-but-independent unit Park et al.'s own generative agents need to be built from at a higher level of abstraction — many independent processes, each with their own state, coordinating through explicit message-passing (channels) rather than shared memory, is the same underlying shape whether the "processes" are goroutines running Go code or LLM-powered characters running in a simulated town.
