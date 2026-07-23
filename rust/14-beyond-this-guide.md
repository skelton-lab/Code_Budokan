# Module 14 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones. Each entry states what it is, why it matters, and where to go deeper.

### `unsafe`: what safe Rust opts out of

**What it is:** an `unsafe` block or function unlocks a small set of additional capabilities the borrow checker can't verify automatically — dereferencing raw pointers, calling `extern "C"` functions (this series' C-as-FFI-target thread), mutating a `static` variable, and a few others. Verified directly:

```rust
fn main() {
    let mut num = 5;
    let r1 = &num as *const i32;
    let r2 = &mut num as *mut i32;
    unsafe {
        println!("r1 is: {}", *r1);
        *r2 = 10;
        println!("r2 is: {}", *r2);
    }
}
```

```
r1 is: 5
r2 is: 10
```

And the reverse — confirmed directly that dereferencing a raw pointer *outside* an `unsafe` block genuinely fails to compile: `error[E0133]: dereference of raw pointer is unsafe and requires unsafe function or block`.

**Why it matters:** `unsafe` is not "turn off the type system" — every other rule from Modules 1–11 still applies inside an `unsafe` block; it unlocks specifically the operations the compiler can't verify statically, and the responsibility for their correctness shifts to the programmer for just those operations. This is the real boundary this series' C-as-FFI-target thread points at from the Rust side: calling into a C library, or being called from one, genuinely requires `unsafe` somewhere.

**Where to go next:** the official Rust documentation's "Unsafe Rust" chapter in *The Rust Programming Language*; `cobol/10-copybooks-subprograms.md`'s own C-interop capstone extension, for the C side of this exact boundary.

### `async`/`await` and async runtimes

**What it is:** `async fn` and `.await` — syntax for writing code that can pause at an `.await` point without blocking the underlying OS thread, backed by a runtime (Tokio is the dominant one) that schedules many such paused tasks onto a small pool of real threads.

**Why it matters:** genuinely the standard approach for I/O-bound concurrent Rust (network services, in particular) — but every capstone in this guide used plain OS threads via `std::thread`, which is the right tool for CPU-bound parallel work like Capstone 3's prime counting, and async wasn't required to demonstrate any of this guide's core ideas.

**Where to go next:** the official `tokio` documentation and the community-maintained "Asynchronous Programming in Rust" book.

### `macro_rules!` and procedural macros

**What it is:** `macro_rules!` defines declarative macros — code that generates code, matched by pattern on its input tokens. Procedural macros (`#[derive(...)]`, used throughout this guide for `Debug`, is one) are a more powerful, function-like variant that operates on the actual token stream.

**Why it matters:** worth knowing given how much of the real Rust ecosystem (like `serde`) leans on procedural macros for code generation, but hand-writing a macro wasn't required by any capstone here — `#[derive(Debug)]` was used directly, taught inline (Module 3) where first needed, without requiring the reader to write one from scratch.

**Where to go next:** the official Rust documentation's "Macros" chapter.

### Cargo workspaces, crates.io, and publishing

**What it is:** `cargo new`/`cargo init` for multi-file projects, `Cargo.toml` for dependencies, workspaces for multi-crate projects, and `cargo publish` for shipping a crate to crates.io.

**Why it matters:** genuinely necessary the moment a real Rust project needs external dependencies or spans more than one file — this guide's capstones stayed single-file (`rustc file.rs`) throughout, matching this series' own `go run file.go`/`ocamlopt file.ml` convention, with `cargo` introduced only where `cargo test` itself was the actual point (Module 13).

**Where to go next:** the official Cargo Book.

### `no_std` and embedded Rust

**What it is:** `#![no_std]` opts a crate out of the standard library, relying only on `core` — the subset of Rust's standard functionality that doesn't assume an operating system underneath, used for embedded/bare-metal targets.

**Why it matters:** a real, distinct use case for Rust's safety guarantees (memory-constrained, no-OS environments), but genuinely out of scope for a guide whose capstones all assumed a normal OS process.

**Where to go next:** the official "The Embedded Rust Book."

## The wider ecosystem

- **[The Rust documentation](https://doc.rust-lang.org/)** — the anchored toolchain's own authoritative reference, including *The Rust Programming Language* ("the book").
- **This series' [C guide](../c/00-overview.md) and [C++ guide](../cpp/00-overview.md)** — the runtime-sanitizer story this guide's own compile-time guarantees stand in direct contrast to.
- **This series' [Go guide](../go/00-overview.md)** — the closest contemporary systems-adjacent point of comparison, especially for interfaces/traits and concurrency.
- **This series' [OCaml guide](../ocaml/00-overview.md) and [Haskell guide](../haskell/00-overview.md)** — algebraic data types and pattern matching, in a third syntax, this time with manual memory management underneath.
