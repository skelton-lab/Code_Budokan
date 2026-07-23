# Final Assessment

Across all thirteen modules and four capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What's the real difference between how `i32` and `String` behave on `let y = x;`, and what compiler error fires if that difference is violated?
2. State the borrow checker's core rule, precisely, and the real compiler error code that fires when it's violated.
3. What's the real difference between Rust's `enum` and C's `enum`, verified directly with `Shape`'s mixed tuple-style and struct-style variants?
4. What real compiler error code fires on a non-exhaustive `match`, and how does that compare to the Erlang finding this series verified for an analogous case?
5. What replaces `null` and exceptions in Rust, and what does `.unwrap()` do, verified directly, when the value isn't there?
6. In Capstone 1, what did `remove_by_name`'s `Result<Contact, String>` return type prevent, compared directly to Go's `(Contact, error)` pattern?
7. What's the core structural difference between how Go's interfaces and Rust's traits are satisfied, even though both are checked at compile time?
8. Verified directly: does implementing `std::fmt::Display` for one type in a `Vec<Box<dyn Shape>>` automatically make every other implementing type printable with `{}`?
9. In Capstone 3, what real, verified claim was made about a naive shared-counter data race, and how does it compare to `go/`'s own `-race` detector?
10. What measured, honest result did Capstone 3's concurrent prime-counting comparison produce, and how does it compare to `go/02-capstone-worker-pool.md`'s own measured result?
11. What real compiler error code fires when a function tries to return a reference to a value that doesn't outlive the function itself?
12. In the `longest<'a>` example, what specifically was `s2`'s problem, verified directly with a real `E0597` error?
13. Are Rust's iterator chains eager or lazy, and what's the real difference between `.iter()` and `.into_iter()`?
14. What does `?` do on a `Result`, and what real requirement does it place on the enclosing function's own signature?
15. In Capstone 4, what real, honest bug did this guide's own verification catch in `parse_record`'s first-draft signature, and what was the actual fix?
16. What does `#[cfg(test)]` do to a release build, verified directly?

## Answers

1. `i32` implements `Copy` and is duplicated on assignment, leaving `x` valid; `String` doesn't implement `Copy` and is moved, leaving `x` invalid afterward. Using `x` after the move fires `E0382`, "borrow of moved value" — verified directly.
2. At any point, a value can have either any number of immutable borrows or exactly one mutable borrow, never both at once and never more than one mutable borrow. `E0499`, "cannot borrow ... as mutable more than once at a time" — verified directly.
3. C's `enum` is a set of named integer constants; Rust's `enum` variants can each carry their own distinct data. Verified directly: `Circle(f64)` (tuple-style) and `Triangle { base: f64, height: f64 }` (struct-style) coexist on the same `Shape` enum.
4. `E0004`, "non-exhaustive patterns" — a hard compile error, verified directly. This series' Erlang guide found an analogous non-exhaustive-clause mistake only produces a compiler *warning* in Erlang, and the program still compiles and runs; Rust's version blocks compilation entirely.
5. `Option<T>` (`Some(T)`/`None`) replaces null; `Result<T, E>` (`Ok(T)`/`Err(E)`) replaces exceptions. `.unwrap()` panics — verified directly with the real message `called \`Option::unwrap()\` on a \`None\` value` and process exit code `101`.
6. It prevented the exact silently-ignored-error pattern `go/05-error-handling-explicit-returns.md` verified: Go's `(Contact, error)` gives a caller a real, legitimate-looking zero-valued `Contact{}` even on failure if the error is discarded with `_`; Rust's `Result<Contact, String>` has no bare `Contact` to grab without actively handling which variant it actually is.
7. Go's interfaces are satisfied structurally and implicitly — matching methods are enough, no declaration required. Rust's traits require an explicit `impl Trait for Type` block — nominal, not structural — even if a type already happens to have matching method signatures.
8. No — verified directly: `Rectangle` without its own `impl fmt::Display for Rectangle` fails to compile with `println!("{}", ...)`, producing `E0277`. Unlike Go's `fmt.Stringer`, verified in `go/04-capstone-polymorphic-shapes.md` to be detected automatically on any type with a matching `String()` method, Rust never grants a formatting capability without an explicit, per-type `impl`.
9. Verified directly: a naive shared-counter data race (no `Arc`/`Mutex`) produces three real compile errors (`E0373`, `E0499`, `E0502`) and **no binary is ever produced**. `go/`'s `-race` detector catches the identical bug class, but only as a runtime tool, after compiling and running the program, and only if invoked explicitly.
10. Concurrency was measured *faster* in both a small-range and large-range test (~2.4× and ~2.9× respectively) on the verification machine — a different, equally honest result from `go/02-capstone-worker-pool.md`'s own finding, where concurrency was measured ~5× *slower* on cheap work. Both results are real; the shared lesson is to measure the actual workload rather than assume either direction from reputation.
11. `E0106`, "missing lifetime specifier" — verified directly with `dangle()`, which the compiler correctly suggested fixing by returning an owned value instead.
12. `s2` was borrowed by `longest()`'s return value (since `longest` could return either input, decided at runtime by length), but `s2` was dropped at the end of an inner block while the result was still used afterward — `E0597`, "`s2` does not live long enough," verified directly.
13. Lazy — nothing in a chain runs until a terminal adaptor like `.sum()` or `.collect()` is reached. `.iter()` borrows, leaving the original collection usable afterward; `.into_iter()` takes ownership, consuming it — verified directly with a real `E0382` error when a collection was used after `.into_iter()`.
14. `?` unwraps `Ok(value)` to `value` and continues, or immediately returns `Err(e)` from the enclosing function. It requires the enclosing function's own return type to be a compatible `Result` (or `Option`) — verified directly that a bare `fn main() {}` using `?` fails to compile with `E0277`.
15. The first-draft signature, `fn parse_record(line: &str) -> Result<ParsedRecord, String>`, compiled and ran correctly but produced a real compiler warning — `hiding a lifetime that's elided elsewhere is confusing` — because the return type's lifetime was left implicit while `line`'s was separately elided. The fix, taken directly from the compiler's own suggestion, was `Result<ParsedRecord<'_>, String>`, making the elided lifetime explicit at the point it's actually used.
16. It's genuinely absent from the compiled binary, not merely skipped at runtime — verified as a stated, checkable property of `#[cfg(test)]` compilation.
