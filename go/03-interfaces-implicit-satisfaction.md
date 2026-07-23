# Module 3 — Interfaces: Implicit, Statically-Checked Satisfaction

By the end of this module you'll be able to define an interface and implement it implicitly, and — verified directly, not assumed — confirm that "implicit" doesn't mean "unchecked": a type missing a required method fails to *compile*, not merely to run correctly. Feeds Capstone 2.

## Implicit satisfaction: no `implements` keyword

**You'll be able to:** define an interface, and write a type that satisfies it with no explicit declaration connecting the two.

**Concept**

`type Shape interface { Area() float64 }` declares an interface — any type with a method matching that signature satisfies it **automatically**, with no `implements Shape` (or equivalent) written anywhere. This is genuinely different from Racket's `class*`/interface declarations (`racket/04-classes-objects.md`) or Java/C++'s explicit interface implementation — a type simply *has* the right shape, or it doesn't.

**Example**

```go
type Shape interface {
    Area() float64
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func main() {
    shapes := []Shape{
        Circle{Radius: 5.0},
        Rectangle{Width: 4.0, Height: 6.0},
    }
    for _, s := range shapes {
        fmt.Println(s.Area())
    }
}
```

```
78.53981633974483
24
```

Verified directly: `Circle` and `Rectangle` never mention `Shape` anywhere in their own definitions — they satisfy it purely by having an `Area() float64` method. `[]Shape{...}` correctly holds both concrete types, and `s.Area()` dispatches to each one's own implementation — `π·5² = 78.53981633974483`, `4×6 = 24`.

> **Pitfall:** the method receiver, `(c Circle)` in `func (c Circle) Area() float64`, is what actually attaches a method to a type in Go — there's no `class` keyword or method-inside-a-type-definition syntax; a method is a regular function with an extra receiver parameter before its name, defined entirely separately from the `struct` it operates on.

**Practice**

- Add a `Triangle` type with its own `Area()` method, and confirm it works correctly in the same `[]Shape` slice with no other code changes.

## Verified: implicit doesn't mean unchecked

**You'll be able to:** confirm directly that a type missing a required interface method fails to *compile*, with a precise, specific error.

**Concept**

Go's implicit interface satisfaction is checked by the **compiler**, at compile time — this is the real, precise distinction from a fully dynamic language's duck typing (Ruby's, say, `ruby/04-...`-style), where a missing method only surfaces as a runtime error the first time it's actually called.

**Example — a real, verified compile failure:**

```go
type Triangle struct {
    Base, Height float64
}
// deliberately no Area() method defined

func main() {
    var s Shape = Triangle{Base: 3, Height: 4}
    fmt.Println(s.Area())
}
```

```
./interfaces_bad.go:15:16: cannot use Triangle{…} (value of struct type Triangle)
as Shape value in variable declaration: Triangle does not implement Shape
(missing method Area)
```

Verified directly: the compiler catches this **before the program ever runs**, naming precisely what's missing (`missing method Area`) — genuinely different from a Ruby-style duck-typing failure, which would only surface the moment `.area` (or whatever the missing method's name is) is actually called on a real object at runtime, potentially far from where the mistake was made.

> **The precise, three-way placement in this series' polymorphism thread:** Go's interfaces sit in a real, distinct position — checked statically like OCaml's functors and Haskell's type classes, but requiring **zero** explicit declaration connecting a type to an interface, unlike either of those (both need an explicit `module Impl : SIG` or `instance` declaration). Ruby's duck typing needs no declaration either, but pays for that with zero compile-time checking at all. Go's interfaces get the "no boilerplate" convenience of duck typing *and* the "caught before running" safety of static typing — a genuinely different tradeoff point than any prior entry in this thread.

**Practice**

- Deliberately misspell `Area` as `Aera` in one type's method while keeping the interface's own spelling correct, recompile, and read the exact error — confirm it's caught the same way a genuinely missing method would be.

## Progress check

1. What does a type need to do to satisfy a Go interface — declare it explicitly, or something else?
2. What attaches a method to a type in Go, given there's no `class` keyword?
3. Verified directly: does a type missing a required interface method fail at compile time or at runtime?
4. How does this compare to Ruby's fully dynamic duck typing, in terms of when a missing-method mistake surfaces?
5. What's the real, three-way distinction this module draws between Go's interfaces, OCaml's functors/Haskell's type classes, and Ruby's duck typing?

### Answers

1. It simply needs to have methods matching the interface's required signatures — no explicit declaration (like an `implements` keyword) connects a type to an interface at all; satisfaction is entirely implicit, based on shape alone.
2. A method receiver — `func (c Circle) Area() float64` attaches `Area` to `Circle` via the receiver parameter `(c Circle)`, defined as an ordinary function entirely separate from the `struct` definition itself.
3. At compile time — verified directly with a real error naming the exact missing method, before the program could ever run.
4. Ruby's duck typing has no compile-time check at all — a missing method only surfaces as a runtime error the moment it's actually called, potentially long after and far from the actual mistake; Go's compiler catches the identical class of mistake before the program runs at all.
5. OCaml's functors and Haskell's type classes are checked statically but require an explicit declaration connecting an implementation to an interface/signature; Ruby's duck typing needs no declaration but has no compile-time check; Go's interfaces combine "no declaration needed" with "checked at compile time," a genuinely distinct position none of the other three occupy.
