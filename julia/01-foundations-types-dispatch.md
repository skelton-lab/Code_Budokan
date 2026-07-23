# Module 1 — Foundations: Types, Functions, and Multiple Dispatch

By the end of this module you'll be able to define structured types with `struct`, write functions with multiple methods, and see multiple dispatch resolve correctly based on *every* argument's type at once — Julia's default behavior for any function with more than one method, requiring no special syntax to enable. Feeds Capstone 1.

## `struct` and abstract types

**You'll be able to:** define a concrete type, an abstract supertype, and a hierarchy connecting them.

**Concept**

`struct Name field::Type ... end` defines a concrete data type. `abstract type Name end` defines a type that can't be instantiated directly but can serve as a common supertype — `struct Circle <: Shape` declares `Circle` as a subtype of `Shape`. This is structurally similar to Racket's `interface`/`class*` or OCaml's `module type`/`module`, but the actual dispatch mechanism built on top of it (this module's real subject) works differently from either.

**Example**

```julia
abstract type Shape end
struct Circle <: Shape
    radius::Float64
end
struct Rectangle <: Shape
    width::Float64
    height::Float64
end

area(s::Circle) = pi * s.radius^2
area(s::Rectangle) = s.width * s.height

shapes = [Circle(5.0), Rectangle(4.0, 6.0)]
for s in shapes
    println(area(s))
end
```

```
78.53981633974483
24.0
```

Verified directly: `area` has **two methods**, one for each concrete `Shape` subtype, and calling `area(s)` inside the loop correctly resolves to the matching one for each element — `π·5² = 78.53981633974483` for the circle, `4×6 = 24.0` for the rectangle — with no `if`/`case`/pattern-match anywhere in the calling code, and `shapes` genuinely holding two different concrete types in one array, something this series' Haskell guide (`haskell/05-capstone-polymorphic-shapes.md`) needed an explicit existential-type wrapper to achieve at all.

> **Pitfall:** `area(s::Circle)` and `area(s::Rectangle)` are two separate **methods** of the same **function**, `area` — Julia's own terminology distinguishes these precisely, and it matters: `area` (the function) is the name callers use; each method is one specific, type-annotated implementation the function might dispatch to.

**Practice**

- Add a `Triangle` subtype of `Shape` with a matching `area` method (Heron's formula), and confirm it slots into `shapes` with no other code changes.

## Multiple dispatch: every argument's type matters, by default

**You'll be able to:** write a function with several methods differing on more than one argument's type, and see Julia resolve the correct one automatically.

**Concept**

Julia's dispatch isn't limited to the *first* argument the way most single-dispatch object systems work (Racket's `send`, effectively, dispatches on the receiver) — **every** positional argument's type participates in choosing which method runs, for **every** function with more than one method, with no special declaration needed to opt into this.

**Example**

```julia
combine(a::Int, b::Int) = a + b
combine(a::String, b::String) = a * b
combine(a::Int, b::String) = "$a copies of $b"

println(combine(3, 4))
println(combine("foo", "bar"))
println(combine(3, "apple"))
```

```
7
foobar
3 copies of apple
```

Verified directly: three genuinely different methods of `combine`, resolved correctly by the types of **both** arguments together — `(Int, Int)` adds, `(String, String)` concatenates (`*` is Julia's string-concatenation operator), and `(Int, String)` — a combination neither single-dispatch on `a` alone nor single-dispatch on `b` alone could distinguish from the other two cases — correctly matches its own dedicated method, producing `"3 copies of apple"`.

> **Pitfall:** this looks similar to simple function overloading in a statically-typed language (C++, Java), but the resolution happens at **runtime**, based on each argument's *actual* runtime type, not resolved once at compile time based on static types the way C++ overload resolution is — genuinely closer to Clojure's multimethods in mechanism (Module 2 makes this comparison precise), even though the syntax here looks more like ordinary function definitions.

**Practice**

- Add a fourth `combine` method, `(String, Int)`, producing a different result from the existing `(Int, String)` case, and confirm both are distinguished correctly.
- Call `combine(3.0, 4)` (a `Float64` and an `Int`) and observe what happens — explain, based on what methods actually exist, why this specific call fails or succeeds.

## Progress check

1. What's the difference between a function and a method, in Julia's own terminology?
2. What did the `Shape`/`Circle`/`Rectangle` example demonstrate that Haskell's equivalent capstone needed extra machinery to achieve?
3. What determines which `combine` method runs, for a call like `combine(3, "apple")`?
4. Is Julia's multiple dispatch resolved at compile time (like C++ overloading) or at runtime?
5. Why couldn't `combine`'s three methods be distinguished by dispatching on just the first argument's type alone?

### Answers

1. A function (like `area` or `combine`) is the shared name callers use; a method is one specific, type-annotated implementation that function might dispatch to — a function can have many methods.
2. A heterogeneous array (`shapes`, holding both a `Circle` and a `Rectangle`) with correct polymorphic dispatch, with no wrapper type or language extension needed at all — Haskell's equivalent capstone required an explicit existential-type wrapper (`AnyShape`) and a language extension to achieve the same thing.
3. The runtime types of **both** arguments together — Julia checks all available `combine` methods and selects the one whose parameter types match the actual arguments' types.
4. At runtime, based on each argument's actual runtime type — not resolved once at compile time the way C++'s overload resolution works.
5. Because the first argument's type alone (`Int`, in both the `(Int, Int)` and `(Int, String)` methods) is the same for two different methods — only the *second* argument's type distinguishes which of those two should actually run, requiring dispatch on both arguments together.
