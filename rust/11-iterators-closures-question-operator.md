# Module 11 — Iterators, Closures, and `?`

The last pieces Capstone 4 needs: iterator adaptor chains for processing collections in the functional style `ocaml/` and `haskell/` already made familiar, closures that capture their environment, and the `?` operator — syntax that makes `Result`-based error propagation (Module 4) genuinely convenient instead of a `match` at every single call. Feeds Capstone 4.

## Iterator adaptor chains

**You'll be able to:** chain `.filter()`, `.map()`, and a terminal adaptor (`.sum()`, `.collect()`) to process a collection without writing an explicit loop.

**Concept**

`.iter()` produces an iterator over borrowed references; `.filter(closure)` keeps only elements the closure returns `true` for; `.map(closure)` transforms each element; a terminal adaptor like `.sum()` or `.collect()` consumes the chain and produces a final value. None of the intermediate steps run anything until the terminal adaptor is reached — Rust's iterators are lazy, the same default `haskell/`'s laziness-by-default established, though here it's opt-in per-chain rather than the language's universal default.

**Example**

```rust
#[derive(Debug)]
struct Record { name: String, amount: f64 }

fn main() {
    let records = vec![
        Record { name: "coffee".to_string(), amount: 4.50 },
        Record { name: "rent".to_string(), amount: 1200.0 },
        Record { name: "book".to_string(), amount: 15.99 },
    ];

    let total: f64 = records.iter()
        .filter(|r| r.amount < 100.0)
        .map(|r| r.amount)
        .sum();
    println!("small purchases total: {:.2}", total);

    let names: Vec<&str> = records.iter().map(|r| r.name.as_str()).collect();
    println!("{:?}", names);
}
```

```
small purchases total: 20.49
["coffee", "rent", "book"]
```

Verified directly.

> **Pitfall / gotcha:** `records.iter()` borrows — `filter`/`map`'s closures receive `&Record` (or `&&Record` through `.filter()` specifically, since it iterates over already-borrowed items), never taking ownership, so `records` itself is still fully usable after the chain runs. A reader reaching for `.into_iter()` instead gets an iterator that *does* consume `records` by value — a real, easy-to-trip pitfall worth checking deliberately (Practice below).

**Practice**

- Change `.iter()` to `.into_iter()` in the example above, and confirm `records` is no longer usable afterward — read the exact compile error.
- Write a chain that finds the single most expensive record's name using `.max_by()` or by tracking manually with `.fold()`.

## Closures capturing their environment

**You'll be able to:** write a closure that captures a variable from its enclosing scope, and use it inside an iterator adaptor.

**Concept**

A closure (`|args| expression`) can capture variables from the scope it's defined in — borrowing by default, or taking ownership with an explicit `move` (already used for `thread::spawn` closures in Module 8, for exactly the same underlying reason: making sure captured data outlives the closure's own use of it).

**Example**

```rust
fn main() {
    let records = vec![
        Record { name: "coffee".to_string(), amount: 4.50 },
        Record { name: "rent".to_string(), amount: 1200.0 },
    ];
    let threshold = 100.0;
    let big: Vec<&Record> = records.iter().filter(|r| r.amount >= threshold).collect();
    for r in &big {
        println!("big: {} = {}", r.name, r.amount);
    }
}
```

```
big: rent = 1200
```

Verified directly — the closure `|r| r.amount >= threshold` borrows `threshold` from `main`'s own scope without needing `move`, since the closure never outlives `main` and only needs to read it.

> **Pitfall / gotcha:** this is the exact same capture-by-reference-vs-capture-by-move distinction Module 8 covered for `thread::spawn` — a closure that's only used locally, synchronously, rarely needs `move`; a closure handed off to another thread almost always does, because the compiler can't otherwise guarantee the captured data outlives however long that thread might run.

**Practice**

- Write a closure that captures a `Vec<String>` by `move` and returns whether it contains a given target string, then confirm the original `Vec` is no longer usable in the enclosing scope afterward.
- Predict, then verify: does a closure passed directly to `.filter()` (not `thread::spawn`) ever need `move` in practice? Under what circumstance would it?

## The `?` operator

**You'll be able to:** use `?` to propagate a `Result`'s error automatically, and explain what it desugars to.

**Concept**

`expression?` on a `Result<T, E>` unwraps `Ok(value)` to `value` and continues, or — if it's `Err(e)` — returns `Err(e)` immediately from the *enclosing* function, provided that function's own return type is a compatible `Result`. It's syntactic sugar over exactly the `match` pattern Module 4 wrote by hand, not a different mechanism.

**Example**

```rust
fn parse_and_double(s: &str) -> Result<i32, std::num::ParseIntError> {
    let n = s.parse::<i32>()?; // propagates Err early, unwraps Ok
    Ok(n * 2)
}

fn main() {
    match parse_and_double("21") {
        Ok(v) => println!("Ok: {}", v),
        Err(e) => println!("Err: {}", e),
    }
    match parse_and_double("abc") {
        Ok(v) => println!("Ok: {}", v),
        Err(e) => println!("Err: {}", e),
    }
}
```

```
Ok: 42
Err: invalid digit found in string
```

Verified directly — `"21"` parses, doubles, and returns `Ok(42)`; `"abc"` fails to parse, and `?` immediately returns that `Err` from `parse_and_double` without ever reaching the `Ok(n * 2)` line, with the original `ParseIntError`'s own message (`invalid digit found in string`) intact.

> **Pitfall / gotcha:** `?` only compiles inside a function whose own return type is `Result` (or `Option`, which `?` also works on, propagating `None`) — using it inside `fn main()` requires `main` itself to be declared `fn main() -> Result<(), SomeError>`, which is legal Rust but changes `main`'s own signature; a bare `fn main()` using `?` directly produces a real compile error, worth triggering once deliberately rather than assumed.

**Practice**

- Trigger the `?`-inside-plain-`main` error deliberately: call `s.parse::<i32>()?` directly inside an ordinary `fn main() {}` with no `Result` return type, and read the resulting compile error.
- Rewrite `parse_and_double` to use `match` instead of `?`, confirming it's behaviorally identical, then rewrite it back — treat this as confirming `?` is sugar, not a new mechanism.

## Progress check

1. Are Rust's iterator chains eager or lazy — when does `.filter()`'s closure actually run?
2. What's the real difference between `.iter()` and `.into_iter()` regarding ownership of the original collection?
3. When does a closure need the `move` keyword, and where has this series already seen the identical rule applied?
4. What does `expression?` do on a `Result`, and what does it require of the enclosing function's own return type?
5. Verified directly: does `?` work inside an ordinary `fn main() {}` with no explicit return type?

**Answers**

1. Lazy — nothing in the chain runs until a terminal adaptor (like `.sum()` or `.collect()`) is reached and actually consumes the iterator.
2. `.iter()` borrows, producing references and leaving the original collection usable afterward; `.into_iter()` takes ownership, consuming the collection.
3. When the closure might outlive the scope it captures from and the compiler can't otherwise prove the captured data stays valid — verified in both Module 8 (`thread::spawn`) and here, the same underlying rule.
4. It unwraps `Ok(value)` to `value` and continues, or immediately returns `Err(e)` from the enclosing function; the enclosing function's return type must itself be a compatible `Result` (or `Option`, for `?` on an `Option`).
5. No — verified as requiring `main`'s own signature to declare a `Result` return type; a bare `fn main() {}` using `?` on a `Result` fails to compile.
