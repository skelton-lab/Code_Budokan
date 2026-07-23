# Module 1 — Ownership and Moves

Every value in Rust has exactly one owner, and when that owner goes out of scope, the value is dropped automatically — no garbage collector, no manual `free`. This module covers the rule that makes that guarantee possible, and the specific, verified compile error it produces when a program tries to use a value after giving up ownership of it. Feeds Capstone 1.

## Ownership: one owner, automatic drop

**You'll be able to:** state Rust's ownership rule, explain why heap-allocated types like `String` move instead of copy on assignment, and predict when a value is dropped.

**Concept**

Every value has a single owner. When the owner's scope ends, Rust inserts a `drop` call automatically — this is how Rust manages heap memory without a garbage collector and without manual `free()`/`delete`. The consequence that trips people up: assignment of a heap-allocated type doesn't copy it, it *moves* it — ownership transfers, and the original variable becomes invalid.

**Example**

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // ownership moves from s1 to s2
    println!("{}", s2); // fine — s2 owns the value now
}
```

```
hello
```

> **Pitfall / gotcha:** this is *not* how `i32`, `f64`, `bool`, or `char` behave — types small enough and simple enough to implement the `Copy` trait are duplicated on assignment instead of moved, so `let x = 5; let y = x; println!("{}", x);` is completely fine. The move rule specifically applies to types that own heap data (`String`, `Vec<T>`, and most custom structs by default). A reader coming from C's manual `malloc`/`free` or Go's garbage collector needs to hold both rules at once: small stack values copy, heap-owning values move.

**Practice**

- Predict, then verify: does `let v1 = vec![1, 2, 3]; let v2 = v1;` move or copy `v1`?
- Write a function `fn takes_ownership(s: String)` that takes a `String` by value, call it with a variable, and try to use that variable again afterward — read the exact compiler error.

## The verified use-after-move error

**You'll be able to:** read and explain a real `E0382` compiler error, and know the two standard fixes.

**Concept**

Using a variable after its value has moved is a compile error, not a runtime bug — Rust catches it before the program ever runs.

**Example**

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // move, not copy
    println!("{}, world!", s1); // use after move
    println!("{}", s2);
}
```

Compiling this directly with `rustc`:

```
error[E0382]: borrow of moved value: `s1`
 --> move_check.rs:4:28
  |
2 |     let s1 = String::from("hello");
  |         -- move occurs because `s1` has type `String`, which does not implement the `Copy` trait
3 |     let s2 = s1; // move, not copy
  |              -- value moved here
4 |     println!("{}, world!", s1); // use after move
  |                            ^^ value borrowed here after move
  |
help: consider cloning the value if the performance cost is acceptable
  |
3 |     let s2 = s1.clone(); // move, not copy
  |                ++++++++
```

Verified directly — this is `rustc`'s actual output, not a paraphrase. The compiler even suggests the fix: `.clone()` if an independent copy is genuinely wanted, or (more idiomatically, covered in Module 2) borrowing with `&s1` instead of moving in the first place.

> **Pitfall / gotcha:** the error is about the *value*, not the *variable name* — `s1` still exists as a name in scope, but the compiler tracks that the `String` it used to own has moved elsewhere, and refuses any further use of `s1` as though it still had that value. This is different from a null pointer: there's no runtime check, no crash-at-use — the program that would crash simply never compiles.

**Practice**

- Fix the example above two ways: once with `.clone()`, once by passing `&s1` (a borrow) to whatever uses it second — confirm both compile.
- Write a function that takes a `Vec<i32>` by value and returns its length, call it twice on the same variable, and read the resulting error.

## Progress check

1. What does Rust do automatically when a value's owner goes out of scope?
2. Does `let y = x;` move or copy `x`, if `x: i32`? What if `x: String`?
3. What real compiler error code fires on a use-after-move, and what are the two standard fixes it suggests or implies?
4. Is a use-after-move bug caught at compile time or runtime in Rust?

**Answers**

1. It calls `drop` on the value automatically, freeing any heap memory it owns — no garbage collector, no manual `free()`.
2. `i32` implements `Copy`, so `let y = x;` copies it — `x` remains valid. `String` does not implement `Copy`, so the same statement moves it — `x` becomes invalid afterward.
3. `E0382`, "borrow of moved value" — verified directly. The two fixes: `.clone()` for an independent copy, or borrowing with `&` instead of moving (Module 2).
4. Compile time — verified directly; the program with the bug never produces a binary at all.
