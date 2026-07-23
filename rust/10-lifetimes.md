# Module 10 — Lifetimes

Borrowing (Module 2) established that a reference can never outlive the value it points to. Lifetimes are the notation the compiler uses to check that rule whenever it isn't obvious from the code's own structure — most often, when a function returns a reference and the compiler needs to know which of its input references that returned reference is allowed to be tied to. Feeds Capstone 4.

## The missing-lifetime error

**You'll be able to:** read the compiler's own explanation of why a function returning a reference sometimes needs an explicit lifetime annotation.

**Concept**

A function returning `&SomeType` from more than one possible source reference is ambiguous to the compiler on its own — it can't tell which input reference's lifetime the output is tied to, so it refuses to guess.

**Example**

```rust
fn dangle() -> &String {
    let s = String::from("hello");
    &s // s is dropped at the end of this function; returning a reference to it
}

fn main() {
    let r = dangle();
    println!("{}", r);
}
```

Compiling this directly with `rustc`:

```
error[E0106]: missing lifetime specifier
 --> dangling.rs:1:16
  |
1 | fn dangle() -> &String {
  |                ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
help: instead, you are more likely to want to return an owned value
  |
1 - fn dangle() -> &String {
1 + fn dangle() -> String {
  |
```

Verified directly. Note the compiler's own suggested fix here: return an *owned* `String`, not a reference at all — because `s` is a local variable that genuinely doesn't outlive the function, there is no lifetime annotation that could make this particular function legitimate. This is the correct outcome, not a limitation to work around: the function was actually trying to return a dangling reference, and no amount of annotation changes that.

> **Pitfall / gotcha:** the error message is easy to misread as "you forgot some syntax" and reach for `&'static String` (the help text even offers it) without checking whether that's actually true — `'static` means "valid for the entire program," a much stronger claim than most functions can honestly make. `dangle()`'s `s` genuinely isn't `'static`; the *right* fix is the second suggestion, returning an owned value.

**Practice**

- Fix `dangle()` by returning an owned `String` instead, and confirm it compiles and runs correctly.
- Write a function `fn first_char(s: &String) -> &str` (borrowing, not owning) that correctly returns a slice of its *input* — confirm this one compiles without any explicit lifetime annotation, and explain why the compiler can infer it here but not in `dangle()`.

## Explicit lifetime annotations: naming the relationship

**You'll be able to:** write a function with an explicit lifetime parameter, and read a real `E0597` "does not live long enough" error.

**Concept**

`fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` declares a named lifetime `'a` and asserts that the returned reference is valid for exactly as long as *both* `x` and `y` are — the compiler doesn't invent this relationship, the annotation states it, and the compiler then checks every call site against it.

**Example**

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("short");
        result = longest(s1.as_str(), s2.as_str()); // s2 doesn't live long enough
    }
    println!("longest: {}", result);
}
```

Compiling this directly with `rustc`:

```
error[E0597]: `s2` does not live long enough
  --> dangling2.rs:10:39
   |
 9 |         let s2 = String::from("short");
   |             -- binding `s2` declared here
10 |         result = longest(s1.as_str(), s2.as_str()); // s2 doesn't live long enough
   |                                       ^^ borrowed value does not live long enough
11 |     }
   |     - `s2` dropped here while still borrowed
12 |     println!("longest: {}", result);
   |                             ------ borrow later used here
```

Verified directly — this is the canonical Rust lifetime example, and the error is exact: `result` might have ended up borrowing from `s2` (since `longest` returns *either* `x` or `y`, decided at runtime by their lengths), but `s2` is dropped at the end of the inner block while `result` is still used afterward. The annotation `'a` on `longest` is what lets the compiler catch this at the *call site* in `main`, without needing to inline or specially analyze `longest`'s own body every time it's called.

> **Pitfall / gotcha:** the lifetime parameter `'a` does not control how long anything actually lives — it's not an allocation directive, and it changes nothing about the compiled binary. It's purely a compile-time assertion the programmer states and the compiler checks; there is zero runtime cost, the same "checked statically, free at runtime" property as the borrow checker's own rules from Module 2.

**Practice**

- Fix the example above by moving `s2`'s declaration outside the inner block, so both strings live long enough — confirm it now compiles and prints the correct longest string.
- Verified directly: rewriting the signature as `fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &'a str` (two separate lifetimes, return tied only to `'a`) does *not* compile — not at any call site, but inside `longest`'s own body: `error: lifetime may not live long enough ... function was supposed to return data with lifetime 'a but it is returning data with lifetime 'b`, because the body can still return `y` (typed `&'b str`) from a function whose signature only promises `&'a str`. Try it yourself and confirm the error is caught at the function definition, before any caller is even involved.

## Progress check

1. What real problem are lifetime annotations solving — what can the compiler not otherwise figure out on its own?
2. What real compiler error code and message fires when a function returns a reference the compiler can't tie to any input, with no annotation given?
3. What real compiler error code and message fires when a valid lifetime annotation correctly catches a reference that's actually about to dangle?
4. Do lifetime annotations have any effect on the compiled binary or runtime performance?

**Answers**

1. Which of a function's several possible input references a returned reference is actually tied to — the compiler won't guess, so it either infers unambiguous cases automatically or requires an explicit annotation stating the relationship.
2. `E0106`, "missing lifetime specifier" — verified directly with `dangle()`, a function trying to return a reference to a value that provably doesn't live past the function's own end.
3. `E0597`, "`s2` does not live long enough" — verified directly with the `longest` example, where an inner-scoped string was borrowed by a value used after that scope ended.
4. No — verified as a stated property, consistent with the borrow checker's own zero-runtime-cost design: lifetimes are erased entirely after compilation; they exist purely for the compiler's own static checking.
