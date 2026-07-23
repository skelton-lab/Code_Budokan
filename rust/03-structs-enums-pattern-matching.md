# Module 3 — Structs, Enums, and Pattern Matching

Rust's `struct` and `enum` are how Capstone 1's contact records get shaped, and `enum` in particular is Rust's own syntax for the algebraic data types `ocaml/` and `haskell/` already introduced this series to — a value that is genuinely *one of* several distinct shapes, not a single shape with optional fields. `match` is how those shapes get taken apart, with a compiler-enforced guarantee neither of those two guides' pattern-matching syntax makes quite this way. Feeds Capstone 1 and Capstone 2.

## Structs: named, owned fields

**You'll be able to:** define a struct, construct an instance, and derive `Debug` for inspection.

**Concept**

A `struct` groups named fields into one type, each field with a clear owner (the struct instance itself). `#[derive(Debug)]` above a struct definition auto-generates a `{:?}`-formattable representation — genuinely useful for the verification-first habit this whole series has kept: printing real values instead of assuming they're right.

**Example**

```rust
#[derive(Debug)]
struct Contact {
    name: String,
    email: String,
    age: u32,
}

fn main() {
    let alice = Contact {
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
        age: 30,
    };
    println!("{:?}", alice);
    println!("{} is {} years old", alice.name, alice.age);
}
```

```
Contact { name: "Alice", email: "alice@example.com", age: 30 }
Alice is 30 years old
```

> **Pitfall / gotcha:** a struct instance follows the exact same ownership/move rules as any other value from Modules 1–2 — assigning `let bob = alice;` moves `alice` entirely (all its fields, including the two `String`s), not just copies a reference to it. There's no separate "object" concept with reference semantics by default, unlike Python, Ruby, or JavaScript.

**Practice**

- Add a `phone: String` field to `Contact`, construct an instance with it, and print it with `{:?}`.
- Write a function `fn describe(c: &Contact) -> String` that borrows a `Contact` and returns a formatted one-line description — confirm the caller's original `Contact` is still usable afterward.

## Enums: genuinely one of several shapes

**You'll be able to:** define an enum with variants that carry different data, and explain why this is a real algebraic data type, not a C-style enum of plain tags.

**Concept**

Unlike C's `enum` (a named set of integer constants), Rust's `enum` variants can each carry their own distinct data — a tuple variant, a struct-like variant with named fields, or no data at all. A single `Shape` value is genuinely a `Circle` *or* a `Rectangle` *or* a `Triangle`, never all three fields at once with two left unused — the same shape `ocaml/`'s variant types and `haskell/`'s algebraic data types already established, in Rust's own syntax.

**Example**

```rust
#[derive(Debug)]
enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Triangle { base: f64, height: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rectangle(w, h) => w * h,
        Shape::Triangle { base, height } => 0.5 * base * height,
    }
}

fn main() {
    let shapes = vec![
        Shape::Circle(3.0),
        Shape::Rectangle(4.0, 5.0),
        Shape::Triangle { base: 6.0, height: 2.0 },
    ];
    for s in &shapes {
        println!("{:?} -> area {:.2}", s, area(s));
    }
}
```

```
Circle(3.0) -> area 28.27
Rectangle(4.0, 5.0) -> area 20.00
Triangle { base: 6.0, height: 2.0 } -> area 6.00
```

Verified directly — note `Circle` and `Rectangle` use tuple-style data (positional), and `Triangle` uses struct-style data (named fields), both on the same `enum`.

> **Pitfall / gotcha:** this is a genuinely different design from `struct Shape { kind: ShapeKind, radius: Option<f64>, width: Option<f64>, height: Option<f64>, base: Option<f64> }` — the tempting alternative for a reader still thinking in C or Go structs. That version compiles, but every value carries fields that don't apply to it, and nothing stops constructing a `Circle` with a `width` set. The `enum` version makes the invalid state literally unrepresentable.

**Practice**

- Add a `Square(f64)` variant to `Shape` and extend `area`'s `match` to handle it.
- Write a function `fn describe(s: &Shape) -> String` returning a plain-English name for each variant, using `match`.

## Match exhaustiveness: a real compile error, not a warning

**You'll be able to:** explain what "exhaustive" means for a `match` expression, and read the real compile error a missing variant produces.

**Concept**

A `match` on an `enum` must handle every variant — or include a wildcard `_` arm — or it fails to compile. This is checked by the compiler, statically, against the enum's actual defined variants; it is not a lint or a warning, and it's not something a reader can accidentally silence.

**Example**

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

fn describe(d: Direction) -> &'static str {
    match d {
        Direction::North => "up",
        Direction::South => "down",
        Direction::East => "right",
        // West is missing on purpose
    }
}

fn main() {
    println!("{}", describe(Direction::North));
}
```

Compiling this directly with `rustc`:

```
error[E0004]: non-exhaustive patterns: `Direction::West` not covered
  --> exhaustive.rs:9:11
   |
 9 |     match d {
   |           ^ pattern `Direction::West` not covered
   |
note: `Direction` defined here
  --> exhaustive.rs:1:6
   |
 1 | enum Direction {
   |      ^^^^^^^^^
...
 5 |     West,
   |     ---- not covered
```

Verified directly — a hard error, `E0004`. Compare this to `erlang/02-multi-clause-functions-guards.md`'s finding: Erlang's own compiler only *warns* ("cannot match") on an analogous non-exhaustive-clauses mistake, and the program still compiles and runs. Rust's version refuses to produce a binary at all.

> **Pitfall / gotcha:** the exhaustiveness check is why adding a new variant to an existing `enum` is a genuinely safe refactor in Rust — every `match` on that enum anywhere in the codebase that doesn't already have a wildcard `_` arm will fail to compile until it's updated to handle the new case. This is a real, load-bearing safety property, not a style preference; a codebase that leans on wildcard `_` arms everywhere gives this property up.

**Practice**

- Fix the example above by adding the missing `Direction::West` arm, and confirm it compiles.
- Add a `NorthEast` variant to `Direction` and confirm every existing `match` on it (without a wildcard) now fails to compile until updated.

## Progress check

1. What's the real difference between Rust's `enum` and C's `enum`?
2. Can two different variants of the same `enum` carry different shapes of data (tuple vs. named fields) in Rust? Verified how?
3. What does "exhaustive" mean for a `match` expression on an enum?
4. What real compiler error code fires on a non-exhaustive `match`, and is it a warning or a hard error?
5. How does Rust's exhaustiveness check compare to the Erlang finding this series verified — a missing pattern clause in a `case`/function head?

**Answers**

1. C's `enum` is a set of named integer constants; Rust's `enum` variants can each carry their own distinct data, making a Rust `enum` value genuinely one of several different shapes, not just a labeled integer.
2. Yes — verified directly with `Shape`'s `Circle(f64)` (tuple-style) and `Triangle { base: f64, height: f64 }` (struct-style) coexisting on one enum.
3. Every variant of the enum being matched on is handled by some arm, either explicitly or via a wildcard `_` arm.
4. `E0004`, "non-exhaustive patterns" — verified directly as a hard compile error; the program does not compile at all, not merely warn.
5. Rust's version is strictly stronger: `erlang/02-multi-clause-functions-guards.md` found that a non-exhaustive or overlapping clause set in Erlang only produces a compiler *warning*, and the program still compiles and runs; Rust's non-exhaustive `match` is a hard error that blocks compilation entirely.
