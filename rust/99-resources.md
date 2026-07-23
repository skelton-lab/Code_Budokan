# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [The Rust documentation](https://doc.rust-lang.org/) | The anchored toolchain's own authoritative reference |
| *The Rust Programming Language* ("the book") | The official, widely-recommended standard text |
| This series' [C guide](../c/00-overview.md) and [C++ guide](../cpp/00-overview.md) | The runtime-sanitizer story this guide's compile-time guarantees stand in direct contrast to |
| This series' [Go guide](../go/00-overview.md) | The closest contemporary point of comparison — interfaces vs. traits, goroutines vs. threads, `-race` vs. the borrow checker |
| This series' [OCaml guide](../ocaml/00-overview.md) and [Haskell guide](../haskell/00-overview.md) | Algebraic data types and pattern matching, in a third syntax |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `let y = x;` moves a `String`, copies an `i32` — verified `E0382` on use-after-move | Module 1 |
| `&`/`&mut` — one mutable borrow, or many immutable, never both — verified `E0499` | Module 2 |
| `enum` variants carry their own distinct data — a real algebraic data type | Module 3 |
| `match` exhaustiveness is a hard `E0004` error, not a warning | Module 3 |
| `Option<T>`/`Result<T, E>` — no null, no exceptions, both ordinary enums | Module 4 |
| `.unwrap()` panics on `None`/`Err` — verified with a real message and exit code `101` | Module 4 |
| `trait`/`impl Trait for Type` — nominal, unlike Go's structural interfaces | Module 6 |
| `dyn Trait` — dynamic dispatch, same runtime mechanism as Go's interface values | Module 6 |
| `thread::spawn` — real OS threads, `move` closures | Module 8 |
| `Arc<Mutex<T>>` — shared ownership + exclusive access, verified race-free | Module 8 |
| A real data race, rejected at compile time (`E0373`/`E0499`/`E0502`) — no binary produced | Capstone 3 |
| `'a` lifetime annotations — verified `E0106`/`E0597` on real dangling-reference bugs | Module 10 |
| Iterator chains are lazy; `.iter()` borrows, `.into_iter()` consumes | Module 11 |
| `?` propagates `Err`/`None` early — sugar over Module 4's own `match` | Module 11 |
| `#[cfg(test)]`/`#[test]`/`cargo test` — genuinely absent from release builds | Module 13 |

## A note on this guide's verification tier

Every code example in this guide was compiled and run with `rustc` (or `cargo test`, for Module 13 and Capstone 4's testing extension) — no example was written from memory of the language's documentation and left unverified. The central "fearless concurrency" claim was checked directly, not asserted: a real, unsynchronized data race was confirmed to produce three separate compile errors and no binary at all, a sharper guarantee than `go/`'s own runtime `-race` detector. Capstone 3's concurrency measurement was run twice, on genuinely different-sized workloads, and reported honestly even though it came out the *opposite* direction from `go/02-capstone-worker-pool.md`'s own measured result — both are real, and the point of measuring rather than assuming stands regardless of which way either result landed. Capstone 4's own first-draft code hit a real compiler warning during this guide's own verification pass (a lifetime-elision inconsistency), caught and fixed using the compiler's own suggested fix, and kept in as this guide's entry in this series' running "real bugs found" thread.

## Where to go now

This guide closes out the compile-time-safety-foil position `INDEX.md` proposed for Rust opposite `c/`/`cpp/`'s runtime-sanitizer story, and stands as a direct, repeatedly-cross-referenced point of comparison to `go/` throughout — interfaces vs. traits, goroutines vs. threads, a runtime race detector vs. a compiler that refuses to produce a binary at all. From here, `INDEX.md`'s one remaining queued candidate is Rails.
