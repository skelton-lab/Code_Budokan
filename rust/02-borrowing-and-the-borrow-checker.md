# Module 2 — Borrowing and the Borrow Checker

Moving ownership every time a function needs to look at a value would make Rust unusable — this module covers borrowing, the mechanism that lets code access a value without taking ownership of it, and the rule the borrow checker enforces so that borrowing can never produce a dangling reference or a data race. Feeds Capstone 1.

## Borrowing: `&` and `&mut`

**You'll be able to:** write a function that borrows a value instead of taking ownership, and state the one rule the borrow checker enforces on mutable borrows.

**Concept**

`&value` creates an immutable borrow — a reference that can read but not modify, and that doesn't take ownership, so the original variable stays valid afterward. `&mut value` creates a mutable borrow — a reference that can modify the value in place. The rule: at any given point in the code, a value can have *either* any number of immutable borrows *or* exactly one mutable borrow — never both at once, and never two mutable borrows at once. This is enforced entirely at compile time, with no runtime cost.

**Example**

```rust
fn calculate_length(s: &String) -> usize {
    s.len() // reads through the reference, doesn't own it
}

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1); // borrow, not move
    println!("The length of '{}' is {}.", s1, len); // s1 still valid
}
```

```
The length of 'hello' is 5.
```

> **Pitfall / gotcha:** a reader coming from Go's interfaces or C's pointers might expect `&mut` to behave like an ordinary mutable pointer with no further restriction. It doesn't — the "one mutable borrow, or many immutable borrows, never both" rule is checked statically by the compiler and has no runtime equivalent; there's no way to bypass it in safe Rust.

**Practice**

- Write a function `fn append_world(s: &mut String)` that mutates a borrowed `String` in place by pushing `" world"` onto it, and call it from `main`.
- Predict, then verify: does borrowing a `Vec<i32>` immutably twice in the same scope compile?

## The verified two-mutable-borrows error

**You'll be able to:** read and explain a real `E0499` compiler error and identify the fix.

**Concept**

Two live mutable borrows of the same value, in the same scope, is a compile error — not a data race caught at runtime, not a crash, a program that simply never compiles.

**Example**

```rust
fn main() {
    let mut v = vec![1, 2, 3];
    let r1 = &mut v;
    let r2 = &mut v; // second mutable borrow while r1 still live
    r1.push(4);
    r2.push(5);
}
```

Compiling this directly with `rustc`:

```
error[E0499]: cannot borrow `v` as mutable more than once at a time
 --> borrow_check.rs:4:14
  |
3 |     let r1 = &mut v;
  |              ------ first mutable borrow occurs here
4 |     let r2 = &mut v; // second mutable borrow while r1 still live
  |              ^^^^^^ second mutable borrow occurs here
5 |     r1.push(4);
  |     -- first borrow later used here
```

Verified directly. The fix is almost always structural, not a syntax trick: finish using `r1` (its last use is line 5, so its borrow ends there) before creating `r2` — or restructure the code so only one mutable borrow is ever live at a time.

> **Pitfall / gotcha:** this exact rule is what Capstone 3 leans on to reject a real, unsynchronized data race at compile time — a naive shared-mutable-counter pattern across threads is, underneath, exactly this same "two live mutable references to the same data" shape, just spread across `thread::spawn` closures instead of two `let` bindings in one function. The borrow checker doesn't have a special case for threads; it's the same rule, applied to code that happens to run concurrently.

**Practice**

- Fix the example above by ending `r1`'s use before creating `r2`, and confirm it compiles.
- Write a function that takes `&mut Vec<i32>` and pushes a value onto it, then try calling it twice with two separately-created `&mut` references to the same vector still alive at the same time — read the resulting error.

## Progress check

1. What's the difference between `&value` and `&mut value`?
2. State the borrow checker's core rule about mutable borrows, precisely.
3. Is that rule checked at compile time or runtime, and what's the runtime cost of the check itself?
4. What real compiler error code fires on two simultaneous mutable borrows of the same value?

**Answers**

1. `&value` is an immutable borrow — read-only access, any number can coexist. `&mut value` is a mutable borrow — read-write access, and only one can exist at a time.
2. At any point in the code, a value can have either any number of immutable borrows, or exactly one mutable borrow — never both kinds at once, and never more than one mutable borrow.
3. Compile time, entirely — verified directly with `E0499`. Once compiled, there is zero runtime cost to the check; it doesn't exist in the compiled binary at all.
4. `E0499`, "cannot borrow ... as mutable more than once at a time" — verified directly.
