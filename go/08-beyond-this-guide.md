# Module 8 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's three capstones. Each entry states what it is, why it matters, and where to go deeper.

### Generics (type parameters)

**What it is:** a relatively recent Go feature (added in Go 1.18) letting a function or type be written generically over a type parameter — verified directly:
```go
func Map[T, U any](items []T, f func(T) U) []U {
    result := make([]U, len(items))
    for i, item := range items {
        result[i] = f(item)
    }
    return result
}
nums := []int{1, 2, 3, 4}
doubled := Map(nums, func(n int) int { return n * 2 })
```
```
[2 4 6 8]
```
Confirmed working — a real, useful capability genuinely absent from earlier Go versions, but none of this guide's three capstones needed a generic function or type to demonstrate their core ideas.

**Why it matters:** worth knowing given how many real Go codebases use it for reusable data structures and utility functions, but a substantial enough topic to deserve its own dedicated treatment beyond a single signpost.

**Where to go next:** the official Go documentation's "An Introduction to Generics."

### The race detector

**What it is:** `go run -race` (or `go test -race`, `go build -race`) instruments a program to detect genuine data races — concurrent, unsynchronized access to the same memory — at runtime, verified directly against a deliberately unsynchronized counter incremented by 100 goroutines: it correctly reported multiple real `WARNING: DATA RACE` messages, naming the exact file and line where the conflicting accesses occurred.

**Why it matters:** Capstone 1's worker pool used channels throughout specifically to avoid this exact class of bug — the race detector is the real, practical tool for confirming a concurrent Go program genuinely has no unsynchronized shared-memory access, worth running against any concurrent Go code before trusting it.

**Where to go next:** the official Go documentation's Race Detector guide; running `go run -race` against your own Capstone 1 worker pool to confirm it reports no races.

### Go modules and dependency management

**What it is:** `go.mod`/`go.sum` and the `go mod` command family — Go's own dependency-management and versioning system, roughly analogous to `dune` (`ocaml/`), `cabal`/`stack` (`haskell/`), or `npm` (`javascript/`).

**Why it matters:** genuinely necessary the moment a real Go project needs external dependencies or multi-file organization, neither of which this guide's single-file capstones required.

**Where to go next:** the official Go documentation's "Using Go Modules" tutorial.

### The `context` package

**What it is:** Go's standard mechanism for carrying cancellation signals, deadlines, and request-scoped values across API boundaries and goroutines — genuinely central to real, production concurrent Go code (especially networked services).

**Why it matters:** Capstone 1's worker pool ran to completion unconditionally; a real production version would very likely need `context` to support cancellation (stopping in-flight work early) or timeouts, neither of which this guide's own scope required.

**Where to go next:** the official Go documentation's `context` package reference.

## The wider ecosystem

- **[The Go documentation](https://go.dev/doc/)** — the anchored toolchain's own authoritative reference.
- **_The Go Programming Language_** (Donovan & Kernighan) — the widely-recommended standard textbook.
- **This series' [C guide](../c/00-overview.md)** — Ken Thompson's own earlier language, the direct lineage this guide's overview named.
- **This series' [Docker guide](../docker/00-overview.md)** — written in Go, the practical hook this guide opened with.
- **This series' [Erlang guide](../erlang/07-capstone-self-healing-supervisor.md)** — the supervisor-pattern comparison Capstone 3 drew on directly.
