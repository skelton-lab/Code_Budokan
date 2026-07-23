# Go — A Session-Based Study Guide

**Promise:** read and write real Go — leaning into CSP-based concurrency (goroutines and channels, a genuine third point of comparison after Clojure's shared-memory `atom` and Erlang's asynchronous actor mailboxes), implicit-but-statically-checked interface satisfaction (an 11th, precisely distinct entry in this series' polymorphism thread), and Go's deliberately plain, explicit error-handling philosophy — including its real, honestly-verified cost.

**Audience:** this series' existing reader, with two real hooks already in hand: Ken Thompson — co-creator of B, C's own direct predecessor (`INDEX.md`'s "ALGOL's three lineages" thread) — co-designed Go decades later; and Docker itself, this series' own `docker/` guide, is written in Go.

**Toolchain (anchored):** **Go 1.26.5** (Homebrew: `brew install go`). Every example runs via `go run file.go`.

**A methodology note specific to this language:** this guide's central error-handling finding wasn't asserted from Go's own reputation — it was verified directly. `result, _ := safeDivide(10, 0)` — deliberately discarding the returned error with `_` — compiles cleanly, runs with **zero warning of any kind**, and silently produces `0` (the zero-value default for `int`), printed as if it were a legitimate result. This is the concrete, checkable version of the most common real criticism of Go's error-handling design: nothing in the language stops a programmer from ignoring an error entirely, and the resulting behavior looks exactly like success.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Concurrent Worker Pool | Goroutines, buffered and unbuffered channels, verified synchronous-rendezvous blocking — a third point of comparison alongside `clojure/06-value-vs-identity-atoms.md` and `erlang/04-actor-model-processes.md` |
| 2 | A Polymorphic Shape Library | Implicit interface satisfaction, verified checked at compile time, not runtime — an 11th precisely-distinguished entry in the polymorphism thread |
| 3 | Robust Error Handling | Explicit `if err != nil`, the verified "silently ignored error" finding, and `defer`/`panic`/`recover` for genuinely exceptional cases |

## Module list

1. **Foundations: Goroutines & Channels** — `go`, buffered vs. unbuffered channels → sets up Capstone 1
2. **Capstone 1** — A Concurrent Worker Pool
3. **Interfaces: Implicit, Statically-Checked Satisfaction** → feeds Capstone 2
4. **Capstone 2** — A Polymorphic Shape Library
5. **Error Handling: Explicit Return Values** — `if err != nil`, the ignored-error finding → feeds Capstone 3
6. **Defer, Panic, and Recover** — genuinely exceptional cases → feeds Capstone 3
7. **Capstone 3** — Robust Error Handling
8. **Beyond This Guide** — signposts only
9. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| Generics (type parameters) | Doesn't touch a capstone; a real, relatively recent Go feature | **Signpost** |
| Go modules / dependency management | This guide stays single-file throughout | **Signpost** |
| The `context` package | Doesn't touch a capstone | **Signpost** |
| The race detector (`go run -race`) | Doesn't touch a capstone, but genuinely useful given Capstone 1's concurrency focus | **Signpost**, named directly |

## Setup

```bash
brew install go
go version   # confirmed: go version go1.26.5 darwin/arm64
```

Verification pattern used throughout this guide:

```bash
go run file.go
```
