# Module 13 — Testing with `cargo test`

Every guide in this series that has a real testing story gets a real testing module — Python's `pytest` (Module 6), JavaScript's `bun test`, Ruby's `minitest`, Prolog's `plunit` — and this is Rust's own entry in that thread. `cargo test` is built into the toolchain directly, no separate framework to install, and this module closes out Capstone 4 by putting real `#[test]` functions around `parse_record`.

## `#[test]` functions and `assert_eq!`/`assert!`

**You'll be able to:** write a `#[cfg(test)] mod tests` block, use `#[test]` functions with `assert_eq!`/`assert!`, and run them with `cargo test`.

**Concept**

`#[cfg(test)] mod tests { ... }` is a module that only compiles when running tests — invisible to a normal `cargo build`. Inside it, any function marked `#[test]` is discovered and run automatically by `cargo test`; `assert_eq!(left, right)` and `assert!(condition)` panic (failing the test) if their check doesn't hold, with a real diff printed on failure.

**Example**

```rust
// in src/lib.rs, alongside parse_record from Capstone 4

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_a_valid_record() {
        let r = parse_record("coffee, 4.50").unwrap();
        assert_eq!(r.name, "coffee");
        assert_eq!(r.amount, 4.50);
    }

    #[test]
    fn rejects_missing_comma() {
        let result = parse_record("bad line no comma");
        assert!(result.is_err());
    }

    #[test]
    fn rejects_negative_amount() {
        let result = parse_record("refund, -20.00");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("negative"));
    }
}
```

Running `cargo test`:

```
running 3 tests
test tests::rejects_missing_comma ... ok
test tests::rejects_negative_amount ... ok
test tests::parses_a_valid_record ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

Verified directly, in a real `cargo init` project. `use super::*;` brings `parse_record` and `ParsedRecord` from the enclosing module into scope for the tests — the tests live in the same file as the code they test, a genuinely different convention from Python's or JavaScript's separate test files.

> **Pitfall / gotcha:** `#[cfg(test)]` really does compile the test module out of a release build entirely — it's not just skipped at runtime, it isn't in the binary at all. This is why test-only helper functions and test data can live directly alongside production code with zero size or performance cost in the shipped artifact.

**Practice**

- Add a fourth test confirming `parse_record` correctly rejects an empty name (`", 4.50"`).
- Run `cargo test -- --nocapture` on a test containing a `println!` and observe the difference from a plain `cargo test` run — read the real output of both.

## A real, verified failing test

**You'll be able to:** read `cargo test`'s actual failure output, including the exact left/right diff.

**Concept**

A failing assertion doesn't stop the whole test suite — `cargo test` runs every test regardless of earlier failures, then reports a full summary at the end, exactly the "don't stop at the first failure" behavior a real test runner needs.

**Example**

A fourth test, deliberately asserting something false, added to confirm what a real failure looks like:

```rust
#[test]
fn deliberately_wrong_assertion() {
    let r = parse_record("coffee, 4.50").unwrap();
    assert_eq!(r.amount, 5.00); // coffee is 4.50, not 5.00 — wrong on purpose
}
```

```
running 4 tests
test tests::rejects_missing_comma ... ok
test tests::rejects_negative_amount ... ok
test tests::parses_a_valid_record ... ok
test tests::deliberately_wrong_assertion ... FAILED

failures:

---- tests::deliberately_wrong_assertion stdout ----

thread 'tests::deliberately_wrong_assertion' (24287163) panicked at src/lib.rs:49:9:
assertion `left == right` failed
  left: 4.5
 right: 5.0

failures:
    tests::deliberately_wrong_assertion

test result: FAILED. 3 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

Verified directly — real output from a real failing run, including `cargo test`'s own exit code `101` (the process command reports `error: test failed, to rerun pass \`--lib\``). Note the other three tests still ran and reported `ok`, and the summary line at the end (`3 passed; 1 failed`) is accurate — this is exactly the diagnostic value a test suite is supposed to provide: not just "something broke," but precisely which case, and what was expected versus what actually happened.

> **Pitfall / gotcha:** `assert_eq!`'s panic message shows `left` and `right` exactly as the macro's own argument order was written — `assert_eq!(r.amount, 5.00)` reports `left: 4.5, right: 5.0`, meaning "the actual value" happened to print as `left` here because it was the first argument. Convention (and most of this series' other testing modules) puts the *actual* value first and the *expected* value second for exactly this reason — reading a failure message is easier when that convention is followed consistently.

**Practice**

- Fix the deliberately-wrong test above (change `5.00` to `4.50`), re-run `cargo test`, and confirm all four tests now report `ok`.
- Write one more genuinely useful test: confirm `parse_record` rejects an unparseable amount (`"book, notanumber"`) with an error message that specifically mentions `"notanumber"`.

## Progress check

1. What does `#[cfg(test)]` do, and what's its effect on a release build's binary size?
2. Does a failing `#[test]` function stop the rest of the test suite from running?
3. What real exit code does `cargo test` report when at least one test fails?
4. What convention does this guide (and this series' other testing modules) recommend for `assert_eq!`'s argument order, and why?

**Answers**

1. It marks a module or item to compile only when running tests; it has zero effect on a release build — the test code isn't merely skipped, it's genuinely absent from the compiled binary.
2. No — verified directly: three passing tests and one deliberately failing test all ran and reported individually, with an accurate summary (`3 passed; 1 failed`) at the end.
3. `101` — verified directly, the same panic-driven exit code `.unwrap()` produces on `None`/`Err` (Module 4), since a failing test is, underneath, a panic inside that test function.
4. Actual value first, expected value second (`assert_eq!(actual, expected)`) — because the panic message labels them `left`/`right` in argument order, and reading a failure is clearer when "left" consistently means "what actually happened."
