# Rust — A Session-Based Study Guide

**Promise:** read and write real Rust — leaning into what's genuinely distinctive: ownership and move semantics, the borrow checker, `Option`/`Result` replacing null and exceptions, traits, and "fearless concurrency" — verified directly, not asserted from the language's own reputation, including a real data race caught by the compiler before a binary even exists.

**Audience:** this series' existing reader, arriving with real hooks already in hand: `c/`/`cpp/` used `clang`'s ASan/UBSan sanitizers to catch memory errors *at runtime, after compiling and running*; Rust's whole pitch is catching the same class of bug *at compile time*, before a binary ever exists. `go/` (just completed) used a runtime `-race` detector to catch a real data race only after running the program; this guide verifies the identical bug class rejected by `rustc` outright. And `ocaml/`/`haskell/` already established algebraic data types, pattern matching, and no-null-by-design — Rust's `enum`, `match`, and `Option` are a third syntax on the same idea, this time in a language with manual memory management underneath.

**Toolchain (anchored):** **Rust 1.96.0** (Homebrew: `brew install rust`). Every module example compiles with `rustc file.rs -o binary && ./binary`; the Testing module and Capstone 4 use `cargo test` directly, matching this series' own testing-module convention in `python/`, `javascript/`, `ruby/`, and `prolog/`.

**A methodology note specific to this language:** the central "fearless concurrency" claim wasn't taken on faith. A deliberately unsynchronized shared counter, incremented from ten threads with no `Arc`/`Mutex` anywhere, was compiled directly:

```rust
let mut counter = 0;
for _ in 0..10 {
    thread::spawn(|| { counter += 1; });
}
```

`rustc` refused to produce a binary at all — three separate compile errors (`E0373`, `E0499`, `E0502`), the closure's implicit borrow of `counter` flagged as unable to outlive the loop and unable to be borrowed mutably more than once. This is a sharper claim than Go's `go run -race`, verified in the guide just before this one: Go's race detector catches the same bug class *after compiling and running* the program; Rust's compiler rejects it before either happens. Capstone 3 makes this the centerpiece, not a footnote.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | Ownership-Safe Contact Book | Ownership, moves, borrowing, structs/enums/pattern matching, `Option`/`Result` — the foundational safety rules, forcing real design choices from the first line |
| 2 | Polymorphic Shapes via Traits | `trait`/`impl`/`dyn Shape` — this series' 12th polymorphism-thread entry: nominal (explicit `impl`) but compile-time-checked and dynamically dispatched, a genuine third position |
| 3 | A Concurrent Counter, and the Data Race Rust Won't Compile | `Arc`/`Mutex`/`mpsc`, and the verified compile-time-rejected data race — "fearless concurrency" demonstrated, not asserted |
| 4 | A Robust Record Processor | Lifetimes, iterator chains, `Result`/`?`-based validation, closed out with real `cargo test` unit tests |

## Module list

1. **Ownership and Moves** — `String` moves, the verified `E0382` use-after-move error → feeds Capstone 1
2. **Borrowing and the Borrow Checker** — `&`/`&mut`, the verified `E0499` two-mutable-borrows error → feeds Capstone 1
3. **Structs, Enums, and Pattern Matching** — algebraic data types, `match` exhaustiveness (`E0004`) → feeds Capstone 1, Capstone 2
4. **Option, Result, and Panics** — no null, no exceptions, `unwrap()`'s real panic message → feeds Capstone 1, Capstone 4
5. **Capstone 1** — Ownership-Safe Contact Book
6. **Traits and Dynamic Dispatch** — `trait`, `impl Trait for Type`, `dyn Trait`, compared directly to Go's implicit interfaces → feeds Capstone 2
7. **Capstone 2** — Polymorphic Shapes via Traits
8. **Fearless Concurrency: Threads, `Arc`/`Mutex`, Channels** → feeds Capstone 3
9. **Capstone 3** — A Concurrent Counter, and the Data Race Rust Won't Compile
10. **Lifetimes** — the verified `E0106`/`E0597` dangling-reference errors → feeds Capstone 4
11. **Iterators, Closures, and `?`** — adaptor chains, the `?` operator → feeds Capstone 4
12. **Capstone 4** — A Robust Record Processor
13. **Testing with `cargo test`** (extends Capstone 4) — real passing and real failing assertions, verified
14. **Beyond This Guide** — signposts only
15. **Final Assessment** + **Resources**

## Ecosystem-breadth triage

| Topic | Capstone-impact test | Treatment |
|---|---|---|
| `async`/`await`, Tokio | Doesn't touch a capstone; all concurrency here is plain OS threads | **Signpost** |
| `unsafe`, raw pointers, FFI | Doesn't touch a capstone, but real and connects directly to this series' C-as-FFI-target thread and `cobol/`'s C-interop capstone | **Signpost**, with a verified minimal snippet |
| `macro_rules!` / procedural macros | `#[derive(Debug)]` is taught inline where first used (Module 3); hand-written macros aren't required by any capstone | **Signpost** |
| Cargo workspaces, crates.io, publishing | Capstones stay single-file/single-crate, matching this series' `rustc`-direct convention | **Signpost** |
| `no_std` / embedded | Genuine ecosystem breadth, no capstone touches it | **Signpost** |
| Generics beyond trait objects (`impl Trait`, monomorphization) | Trait objects cover the capstone need | **Signpost** |

## Setup

```bash
brew install rust
rustc --version   # confirmed: rustc 1.96.0 (Homebrew)
cargo --version   # confirmed: cargo 1.96.0 (Homebrew)
```

Verification pattern used throughout this guide:

```bash
rustc file.rs -o binary && ./binary
```

The Testing module and Capstone 4 additionally use:

```bash
cargo test
```
