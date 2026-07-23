# Module 4 — Option, Result, and Panics

Rust has no `null` and no exceptions. A value that might be absent is typed `Option<T>`; an operation that might fail is typed `Result<T, E>` — both are ordinary enums (Module 3's mechanism, not a special case), and the compiler forces every caller to handle the absence/failure case before getting at the value. Feeds Capstone 1 and Capstone 4.

## `Option<T>`: no null, an enum instead

**You'll be able to:** write a function returning `Option<T>`, and handle both cases with `match`.

**Concept**

`Option<T>` is defined as `enum Option<T> { Some(T), None }` — an ordinary enum, using exactly Module 3's mechanism. There is no `null`, no `nil`, no pointer that might secretly be empty; a value that might be absent is `Option<T>`, and the type system won't let code use the inner `T` without first checking which variant it got.

**Example**

```rust
fn find_first_even(nums: &[i32]) -> Option<i32> {
    for &n in nums {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let nums = vec![1, 3, 5, 8, 9];
    match find_first_even(&nums) {
        Some(v) => println!("first even: {}", v),
        None => println!("no evens"),
    }
}
```

```
first even: 8
```

> **Pitfall / gotcha:** `Option<T>` is a genuinely different design from Go's zero-value convention, verified directly in `go/05-error-handling-explicit-returns.md`: Go's `(int, error)` return still gives the caller a real `int` even on failure (usually `0`), silently indistinguishable from a legitimate zero result if the second value is ignored. `Option<i32>`'s `None` isn't a fake `0` — there's no `i32` at all in that case, and the compiler won't let code treat `None` as though it were one.

**Practice**

- Write a function `fn first_word(s: &str) -> Option<&str>` returning the first whitespace-delimited word of a string, or `None` if the string is empty.
- Predict, then verify: does `let x: Option<i32> = Some(5); println!("{}", x + 1);` compile?

## `Result<T, E>`: failure as a typed value

**You'll be able to:** write a function returning `Result<T, E>`, and handle both cases with `match`.

**Concept**

`Result<T, E>` is `enum Result<T, E> { Ok(T), Err(E) }` — the same mechanism again, this time carrying data on *both* variants: the success value, or an error value describing what went wrong. There's no `try`/`catch`, no exception propagating invisibly up the call stack; a fallible function's signature says so directly, and the caller must handle both arms.

**Example**

```rust
fn safe_divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err("division by zero".to_string())
    } else {
        Ok(a / b)
    }
}

fn main() {
    match safe_divide(10, 2) {
        Ok(v) => println!("Ok: {}", v),
        Err(e) => println!("Err: {}", e),
    }
    match safe_divide(10, 0) {
        Ok(v) => println!("Ok: {}", v),
        Err(e) => println!("Err: {}", e),
    }
}
```

```
Ok: 5
Err: division by zero
```

> **Pitfall / gotcha:** compare this directly to `go/05-error-handling-explicit-returns.md`'s central, verified finding: Go's `(result, error)` keeps `result`'s type identical (`int`) whether the call succeeded or not, so a caller can discard the error with one extra character (`_`) and the code still compiles and runs, silently. `Result<i32, String>` makes success and failure part of the *same* value's type — there's no bare `i32` sitting alongside a separately-ignorable error; getting the `i32` out at all requires actively matching or unwrapping. There's a second, sharper contrast verified directly: simply calling `safe_divide(10, 0);` and never using its return value at all produces a real compiler warning, `unused \`Result\` that must be used`, with the note "this `Result` may be an `Err` variant, which should be handled" — Go's discarded error produces *zero* warning under any circumstance; Rust's produces one the moment a `Result` is dropped on the floor, not just when it's explicitly marked `_`.

**Practice**

- Write a function `fn parse_positive(s: &str) -> Result<i32, String>` that parses a string to `i32` and returns `Err` if the result is negative or the parse itself fails.
- Verify directly: does `let _ = safe_divide(10, 0);` (an explicit `_` binding, matching Go's own discard idiom) still produce the unused-`Result` warning, or does it silence it the same way Go's `_` does?

## `unwrap()` and the real panic it produces

**You'll be able to:** use `.unwrap()`, and read the exact panic message it produces on failure.

**Concept**

`.unwrap()` on an `Option` or `Result` extracts the inner value if present, and *panics* — an immediate, unrecoverable crash of the current thread — if it isn't. It's a legitimate tool for cases genuinely known to always succeed, or for prototyping, but it reintroduces exactly the "trust me, this can't fail" risk `Option`/`Result` otherwise force a program to confront explicitly.

**Example**

```rust
fn find_first_even(nums: &[i32]) -> Option<i32> {
    for &n in nums {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let empty: Vec<i32> = vec![];
    let r = find_first_even(&empty);
    println!("about to unwrap a None...");
    let _ = r.unwrap();
}
```

```
about to unwrap a None...

thread 'main' (24290684) panicked at unwrap_module4.rs:14:15:
called `Option::unwrap()` on a `None` value
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

Verified directly against this exact program — the program prints its last line, then crashes with a specific, real panic message naming exactly which call failed and why, and exits with status `101`. (The filename and line number in the panic message will naturally differ based on whatever file the reader saves this in — what's load-bearing here is the message shape and the `101` exit code, not the specific line number.)

> **Pitfall / gotcha:** `.unwrap()` scattered through real code is a genuine, well-known anti-pattern for exactly this reason — it silently reintroduces a crash-on-failure risk into code whose whole point was to make failure a typed, checked value. `.expect("a more specific message")` is marginally better (a custom panic message), but the real fix, when failure is a legitimate possibility rather than a true invariant, is `match` or the `?` operator (Module 11) — propagate the `Result`, don't assume it away.

**Practice**

- Rewrite the example above to use `match` instead of `.unwrap()`, printing a friendly message instead of panicking.
- Verify directly: does `.unwrap()` on an `Err(e)` value include `e`'s own content in the panic message, or just a generic string?

## Progress check

1. What replaces `null` in Rust, and what mechanism (from Module 3) is it built from?
2. What replaces exceptions for fallible operations, and what does it carry on both success and failure?
3. How does `Result<T, E>` structurally differ from Go's `(T, error)` return pattern, regarding how easy each is to silently ignore?
4. What does `.unwrap()` do on `None` or `Err`, verified directly?
5. Is a panic from `.unwrap()` caught at compile time or does it happen at runtime?

**Answers**

1. `Option<T>` — an ordinary enum, `Some(T)` or `None`, using exactly Module 3's `enum` mechanism.
2. `Result<T, E>` — `Ok(T)` on success, `Err(E)` on failure, carrying real data on both variants.
3. Go's `(T, error)` gives a real, legitimate-looking `T` even on failure, letting a caller silently discard the separate `error` with `_`, verified in `go/05-error-handling-explicit-returns.md` to compile and run with zero warning. `Result<T, E>` makes success/failure part of one value's own type, so there's no bare `T` to grab without first handling which variant it actually is.
4. It panics — verified directly with a real message (`called \`Option::unwrap()\` on a \`None\` value`) and process exit code `101`.
5. Runtime — `.unwrap()` compiles fine on any `Option`/`Result`; the panic only happens if and when the program actually hits the empty/error case while running.
