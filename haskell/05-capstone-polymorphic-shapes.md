# Capstone 2 — A Polymorphic Shape Library

Combines every concept from Module 4: three shapes, a shared type class, and — the genuine new wrinkle this capstone surfaces — a heterogeneous list of *different* shape types, something Haskell's static type system doesn't allow for free the way Racket's or Clojure's dynamic typing did.

## The real problem this capstone surfaces

Every prior guide's polymorphism capstone built a list mixing different types under one interface without a second thought — Racket's `(list (new circle% ...) (new rectangle% ...))`, Clojure's `[(->Circle 5) (->Rectangle 4 6)]`. In Haskell, `[Circle 5.0, Rectangle 4.0 6.0]` **does not type-check** — a list's elements must all share one concrete type, and `Circle` and `Rectangle` are different types, full stop. Solving this honestly, rather than avoiding it, is the actual point of this capstone.

## The solution: an existential wrapper

```haskell
{-# LANGUAGE ExistentialQuantification #-}

class Shape a where
  area :: a -> Double
  describe :: a -> String
  describe x = "A shape with area " ++ show (area x)

data Circle = Circle Double
data Rectangle = Rectangle Double Double
data Triangle = Triangle Double Double Double

instance Shape Circle where
  area (Circle r) = pi * r * r

instance Shape Rectangle where
  area (Rectangle w h) = w * h
  describe (Rectangle w h) = "Rectangle " ++ show w ++ "x" ++ show h

instance Shape Triangle where
  area (Triangle a b c) =
    let s = (a + b + c) / 2
    in sqrt (s * (s - a) * (s - b) * (s - c))

data AnyShape = forall a. Shape a => AnyShape a

instance Shape AnyShape where
  area (AnyShape s) = area s
  describe (AnyShape s) = describe s

shapes :: [AnyShape]
shapes = [AnyShape (Circle 5.0), AnyShape (Rectangle 4.0 6.0), AnyShape (Triangle 3.0 4.0 5.0)]

totalArea :: [AnyShape] -> Double
totalArea = sum . map area
```

`{-# LANGUAGE ExistentialQuantification #-}` — a real, required pragma; this isn't part of standard Haskell2010 and needs to be explicitly enabled — is what makes `data AnyShape = forall a. Shape a => AnyShape a` legal: `AnyShape` wraps *any* type `a` satisfying `Shape`, without `AnyShape` itself needing to know or fix which one. `shapes :: [AnyShape]` is now a genuinely uniform list — every element really is the same type, `AnyShape` — even though it's hiding three different concrete shape types inside.

## Verification

```haskell
mapM_ (putStrLn . describe) shapes
putStrLn ("Total area: " ++ show (totalArea shapes))
```

```
A shape with area 78.53981633974483
Rectangle 4.0x6.0
A shape with area 6.0
Total area: 108.53981633974483
```

Checked by hand: `Circle 5.0` uses the class default (`π·25 = 78.53981633974483`); `Rectangle 4.0 6.0` uses its own override (`"Rectangle 4.0x6.0"`); `Triangle 3.0 4.0 5.0` (a 3-4-5 right triangle) correctly computes area `6.0` via Heron's formula, using the default `describe`. `totalArea` sums all three areas — `78.53981633974483 + 24.0 + 6.0 = 108.53981633974483` — matching exactly.

> **The real, honest comparison across all three functional-language guides:** solving "a list of heterogeneous shapes, one common interface" required **zero** extra machinery in Racket (dynamic typing, any object goes in any list) and Clojure (same), but required an explicit, named language extension and a deliberate existential-type wrapper in Haskell — not because Haskell's type class mechanism is worse, but because static typing's whole value proposition (the compiler verifies far more about your program before it runs) has a real, honest cost here: heterogeneous collections need to be designed for explicitly, not assumed to work for free.

> **Pitfall:** `AnyShape`'s own `Shape` instance (`area (AnyShape s) = area s`) looks almost like a no-op, but it's doing real work — it's what lets `totalArea`'s `map area` call `area` on `AnyShape` values directly, dispatching through to whichever concrete shape is actually wrapped inside, without `totalArea` itself ever needing to pattern-match on `Circle`/`Rectangle`/`Triangle` by name.

## Extending it yourself

- Add a fourth shape type and confirm it slots into `shapes` via `AnyShape` with no changes needed to `totalArea` or `AnyShape`'s own instance.
- Write a function `largestArea :: [AnyShape] -> Double` using `maximum` and `map area`, and verify it correctly identifies the largest of the three shapes in `shapes`.
