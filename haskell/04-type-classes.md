# Module 4 — Type Classes

By the end of this module you'll be able to declare a type class with a default method implementation, write instances that use the default or override it, and place this series' polymorphism thread's third distinct mechanism precisely against the two that came before it. Feeds Capstone 2.

## `class`, `instance`, and default methods

**You'll be able to:** declare a type class with a default implementation, and write instances that either use it or override it.

**Concept**

`class ClassName a where` declares a set of operations any type `a` can implement — closest in spirit to OCaml's `module type` signature (`ocaml/04-modules-structures-signatures.md`) or Racket's `interface`, but attached to ordinary values and resolved automatically by the type checker rather than through explicit module instantiation. A method can have a **default implementation** directly in the class declaration — an instance that doesn't provide its own gets the default automatically.

**Example**

```haskell
class Shape a where
  area :: a -> Double
  describe :: a -> String
  describe x = "A shape with area " ++ show (area x)

data Circle = Circle Double
data Rectangle = Rectangle Double Double

instance Shape Circle where
  area (Circle r) = pi * r * r

instance Shape Rectangle where
  area (Rectangle w h) = w * h
  describe (Rectangle w h) = "Rectangle " ++ show w ++ "x" ++ show h

main :: IO ()
main = do
  putStrLn (describe (Circle 5.0))
  putStrLn (describe (Rectangle 4.0 6.0))
```

```
A shape with area 78.53981633974483
Rectangle 4.0x6.0
```

Verified directly: `Circle`'s instance implements only `area` — `describe` falls back to the class's own default, correctly computing `"A shape with area " ++ show (area (Circle 5.0))`. `Rectangle`'s instance provides its *own* `describe`, overriding the default entirely — a real, working demonstration of "sensible default, per-instance override," resolved automatically by the type checker based purely on which type is involved, with no explicit dispatch code written anywhere.

> **Pitfall:** `pi` is a built-in constant, and `show` converts a value to its `String` representation — both used here without introduction because they're ordinary parts of the standard library, not special type-class machinery; the actual class mechanism is just `class`/`instance`/the default-method body.

**Practice**

- Add a `Square Double` type and a `Shape` instance for it, relying on the default `describe`.
- Add a second class method, `perimeter`, with no default, and confirm every instance is now required to implement it.

## Placing type classes in this series' polymorphism thread

**You'll be able to:** state precisely how type classes differ from OCaml's functors and Clojure's protocols/multimethods, the two other polymorphism mechanisms this series has covered in its functional-language guides.

**Concept**

Three genuinely different designs, all solving some version of "the same operation, different behavior per type":

- **OCaml's functors** (`ocaml/05-functors.md`): explicit, compile-time module-to-module functions — `MakeSorter (IntOrd)` is a real, named application the programmer writes out, producing a genuinely separate module.
- **Clojure's protocols/multimethods** (`clojure/03-records-protocols.md`, `clojure/04-multimethods.md`): runtime dispatch — a protocol resolves on one argument's runtime type; a multimethod resolves on an arbitrary computed dispatch value, checked when the function is actually called.
- **Haskell's type classes** (this module): resolved by the *type checker*, not explicitly by the programmer and not at runtime by inspecting a value — calling `describe (Circle 5.0)` never explicitly names which `Shape` instance to use; the compiler infers it entirely from `Circle`'s type, and the correct instance's dictionary of methods is selected before the program ever runs.

> **The real, precise distinction worth internalizing:** type classes are resolved at **compile time**, like OCaml's functors, but with **implicit, inferred selection**, like Clojure's runtime dispatch feels to a caller — the programmer never writes `Shape.Circle.describe`, the same syntactic ease as Clojure's `(describe c)`, but with none of Clojure's actual runtime dispatch cost, because the correct instance is already known statically.

**Practice**

- Write out, in your own words, what would need to change about `Shape`/`Circle`/`Rectangle` to add a *third* type — compare how much code that requires here versus how much `MakeSorter (ThirdOrd)` required in OCaml, versus how much a new `defrecord`/`extend-type` required in Clojure.

## Progress check

1. What does a type class's default method implementation let an instance skip providing?
2. What happened when `Rectangle`'s instance provided its own `describe`, verified directly?
3. What determines which `Shape` instance's `describe` gets used for a given call — something the programmer writes explicitly, or something inferred?
4. What's the real, precise distinction this module draws between type classes and OCaml's functors?
5. What's the real, precise distinction this module draws between type classes and Clojure's protocols/multimethods?

### Answers

1. Its own implementation of that method entirely — an instance with no override automatically gets the class's default behavior, verified directly with `Circle`'s use of the default `describe`.
2. It correctly overrode the default — `Rectangle`'s own `describe` ran instead of the class's default, producing `"Rectangle 4.0x6.0"` rather than the generic `"A shape with area ..."` message.
3. Something inferred — the type checker determines which instance applies purely from the value's type (`Circle` vs. `Rectangle`), with no explicit dispatch code written by the programmer anywhere in the call site.
4. Both are resolved at compile time, but functors require the programmer to write an explicit application (`MakeSorter (IntOrd)`), producing a separately-named module; type classes are resolved implicitly by the type checker with no explicit application written at the call site at all.
5. Protocols/multimethods dispatch at runtime, inspecting an actual value's type or a computed key when the function is called; type classes resolve which instance to use entirely at compile time, with no runtime dispatch cost, even though the call syntax looks similarly implicit to a caller.
