# Module 6 — Traits and Dynamic Dispatch

Rust's `trait` is this series' 12th entry in the running polymorphism thread — and a genuinely distinct position in the design space `go/03-interfaces-implicit-satisfaction.md` closed out. Feeds Capstone 2.

## Traits: nominal, not structural

**You'll be able to:** define a trait, implement it explicitly for a type, and explain why Rust's `impl Trait for Type` is a fundamentally different check from Go's implicit interface satisfaction.

**Concept**

A `trait` declares a set of method signatures a type can implement. Unlike Go's interfaces — verified in `go/03-interfaces-implicit-satisfaction.md` to be satisfied *implicitly*, purely by a type happening to have matching methods, with no declaration anywhere connecting the two — Rust requires an explicit `impl Trait for Type` block. A type does not satisfy a trait by accident; the connection is nominal (named, declared) even though, as Module 6's second session covers, the actual dispatch through a trait object is still dynamic, resolved at runtime, exactly like a Go interface value or a Java/C# interface reference.

**Example**

```rust
trait Shape {
    fn area(&self) -> f64;
    fn name(&self) -> &str;
}

struct Circle { radius: f64 }
struct Rectangle { width: f64, height: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
    fn name(&self) -> &str { "Circle" }
}

impl Shape for Rectangle {
    fn area(&self) -> f64 { self.width * self.height }
    fn name(&self) -> &str { "Rectangle" }
}
```

> **Pitfall / gotcha:** a reader arriving from `go/03-interfaces-implicit-satisfaction.md` might expect that having the right methods is enough, the way it was for Go's `Shape` interface. It isn't — a struct with a matching `area(&self) -> f64` method but no `impl Shape for ThatStruct` block simply doesn't implement `Shape` at all, and any attempt to use it as one produces a real compile error (verified next). This is the precise, honest distinction: Go's interfaces are structural and compile-time-checked; Rust's traits are nominal and compile-time-checked — two different positions that happen to share "checked at compile time," not the same design.

**Practice**

- Add a `Triangle` struct with `base`/`height` fields and implement `Shape` for it.
- Write a function `fn total_area(shapes: &[Box<dyn Shape>]) -> f64` that sums the area of a mixed collection — covered fully next session.

## `dyn Trait`: dynamic dispatch, verified

**You'll be able to:** use `dyn Trait` for a heterogeneous collection, and read the real compile error when a type without the required `impl` is used as one.

**Concept**

`&dyn Shape` or `Box<dyn Shape>` is a *trait object* — a reference or owned pointer that can hold any type implementing `Shape`, with method calls resolved at runtime through a vtable, exactly like Go's interface values or `julia/`'s multiple-dispatch mechanism resolves calls dynamically. This is what makes a single `Vec<Box<dyn Shape>>` able to hold a genuine mix of `Circle`s and `Rectangle`s.

**Example**

```rust
fn main() {
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Rectangle { width: 4.0, height: 6.0 }),
    ];
    for s in &shapes {
        println!("{}: {:.2}", s.name(), s.area());
    }
}
```

```
Circle: 78.54
Rectangle: 24.00
```

Now the verified compile error — a `Triangle` deliberately without `impl Shape for Triangle`, used where a `&dyn Shape` is expected:

```rust
struct Triangle { base: f64, height: f64 } // deliberately no impl Shape

fn print_area(s: &dyn Shape) {
    println!("{:.2}", s.area());
}

fn main() {
    print_area(&Triangle { base: 3.0, height: 4.0 }); // Triangle isn't a Shape
}
```

```
error[E0277]: the trait bound `Triangle: Shape` is not satisfied
  --> module6_combined.rs:26:16
   |
26 |     print_area(&Triangle { base: 3.0, height: 4.0 }); // Triangle isn't a Shape
   |                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ unsatisfied trait bound
   |
help: the trait `Shape` is not implemented for `Triangle`
  --> module6_combined.rs:19:1
   |
19 | struct Triangle { base: f64, height: f64 } // deliberately no impl Shape
   | ^^^^^^^^^^^^^^^
help: the following other types implement trait `Shape`
  --> module6_combined.rs:9:1
   |
 9 | impl Shape for Circle {
   | ^^^^^^^^^^^^^^^^^^^^^ `Circle`
...
14 | impl Shape for Rectangle {
   | ^^^^^^^^^^^^^^^^^^^^^^^^ `Rectangle`
```

Verified directly — `E0277`, naming the exact missing relationship, and even listing the two types that *do* already implement `Shape` as a hint. Structurally similar in spirit to Go's own verified `Triangle does not implement Shape (missing method Area)` error from `go/03-interfaces-implicit-satisfaction.md`, but for a different reason underneath: Go's error fires because a required *method* is missing; Rust's fires because a required *impl block* is missing, even if `Triangle` happened to already have a same-signature `area` method sitting on it unconnected to `Shape`.

> **Pitfall / gotcha:** traits can also provide *default* method implementations — `fn describe(&self) -> String { format!("a shape with area {:.2}", self.area()) }` written directly in the `trait` block — which every implementor gets for free unless it explicitly overrides it. Verified directly: a `Square` overriding `describe()` and a `Circle` not overriding it both compile and produce their own distinct output. This is a real capability neither Go's interfaces nor this series' first ten polymorphism-thread entries (with the partial exception of Smalltalk-style inheritance) offer in quite this shape — an interface that ships partial behavior, not just a signature.

**Practice**

- Add a default `fn describe(&self) -> String` to `Shape` with a generic implementation, override it for one implementing type, and confirm both the default and the override compile and run correctly.
- Verified directly: does a `struct` with a method matching a trait's signature, but with no `impl Trait for Struct` block anywhere, satisfy that trait? Re-run the `Triangle` example to confirm your answer.

## Progress check

1. What's the core structural difference between how Go's interfaces and Rust's traits are satisfied?
2. Is dispatch through a Rust trait object (`dyn Trait`) resolved at compile time or runtime?
3. What real compiler error code fires when a type without the required `impl` block is used where a trait object is expected?
4. Can a Rust trait provide a default method implementation? Does Go's interface mechanism have an equivalent?

**Answers**

1. Go's interfaces are satisfied structurally and implicitly — any type with matching methods satisfies it, no declaration needed (verified in `go/03-interfaces-implicit-satisfaction.md`). Rust's traits are satisfied nominally — a type must have an explicit `impl Trait for Type` block, even if it already has methods matching the trait's signatures.
2. Runtime — verified via `Box<dyn Shape>`, resolved through a vtable at the call site, the same general mechanism as Go's interface values.
3. `E0277`, "the trait bound ... is not satisfied" — verified directly.
4. Yes — verified directly with `Shape::describe`, a default implementation every implementor gets unless it overrides it. Go's interfaces have no equivalent; an interface in Go is purely a set of method signatures with no shared implementation attached.
