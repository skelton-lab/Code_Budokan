# Capstone 2 — Polymorphic Shapes via Traits

Combines Module 6's two sessions: a `Shape` trait with a default method, three implementing types — one of which overrides the default — collected into a single heterogeneous `Vec<Box<dyn Shape>>`, plus a direct, verified test of where Rust's polymorphism story diverges sharply from Go's.

## The shapes

```rust
use std::fmt;

trait Shape {
    fn area(&self) -> f64;
    fn name(&self) -> &str;
    fn describe(&self) -> String {
        format!("{} with area {:.2}", self.name(), self.area())
    }
}

struct Circle { radius: f64 }
struct Rectangle { width: f64, height: f64 }
struct Triangle { base: f64, height: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
    fn name(&self) -> &str { "Circle" }
}
impl Shape for Rectangle {
    fn area(&self) -> f64 { self.width * self.height }
    fn name(&self) -> &str { "Rectangle" }
}
impl Shape for Triangle {
    fn area(&self) -> f64 { 0.5 * self.base * self.height }
    fn name(&self) -> &str { "Triangle" }
    // overrides the default describe()
    fn describe(&self) -> String {
        format!("a triangle (base {}, height {}), area {:.2}", self.base, self.height, self.area())
    }
}

// implementing fmt::Display requires an explicit impl, per type, same as Shape itself
impl fmt::Display for Circle {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Circle(r={})", self.radius)
    }
}
```

`Circle` and `Rectangle` both use `Shape`'s default `describe()`; `Triangle` overrides it. All three still satisfy the same `dyn Shape` trait object, dispatched dynamically — the same "one message, many behaviors" shape as every entry in this series' polymorphism thread, this time with an added wrinkle (a default method, selectively overridden) none of the first eleven entries demonstrated in quite this form.

## Verification

```rust
fn main() {
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Rectangle { width: 4.0, height: 6.0 }),
        Box::new(Triangle { base: 3.0, height: 8.0 }),
    ];

    for s in &shapes {
        println!("{}", s.describe());
    }

    let total: f64 = shapes.iter().map(|s| s.area()).sum();
    println!("total area: {:.2}", total);

    let c = Circle { radius: 5.0 };
    println!("{}", c); // works: Circle explicitly implements Display
}
```

```
Circle with area 78.54
Rectangle with area 24.00
a triangle (base 3, height 8), area 12.00
total area: 114.54
Circle(r=5)
```

Verified directly. `Circle` and `Rectangle` print through `Shape`'s default `describe()`; `Triangle` prints through its own override; the total is a plain iterator `.sum()` over the trait objects' `.area()` calls (Module 11 covers iterators in depth — this is the first genuine taste). The final line uses `Circle`'s own, separately and explicitly implemented `std::fmt::Display`.

> **The direct, honest comparison to `go/04-capstone-polymorphic-shapes.md`:** Go's Capstone 2 found that `Circle` and `Rectangle` were *automatically* detected and used by `fmt.Printf`'s `%v` verb the moment they had a matching `String() string` method — no registration, no explicit connection to `fmt.Stringer` anywhere. Rust's equivalent, `std::fmt::Display`, requires the same explicit `impl Trait for Type` block as any other trait — verified directly: attempting `println!("{}", Rectangle { width: 4.0, height: 6.0 })` on a `Rectangle` with no `impl Display for Rectangle` produces a real compile error, `E0277`, `` `Rectangle` doesn't implement `std::fmt::Display` ``, with a helpful suggestion to use `{:?}` (which *does* work automatically, but only via `#[derive(Debug)]`, itself an explicit — if auto-generated — opt-in). This is the same nominal-vs-structural distinction Module 6 established for `Shape` itself, now shown holding for the standard library's own formatting traits, not just this guide's custom ones: Rust never grants a capability by accident, the way Go's `fmt.Stringer` detection does.

## Extending it yourself

- Add a `Square(f64)` implementing type, giving it its own `impl Shape for Square` — decide whether it should override `describe()` or use the default, and justify the choice in a comment.
- Implement `std::fmt::Display` for `Rectangle` as well, and confirm `println!("{}", some_rectangle)` now compiles where it previously produced `E0277`.
