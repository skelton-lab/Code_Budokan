# Module 5 — Functors: Modules as Functions

By the end of this module you'll be able to write a functor — a module parameterized by another module — and instantiate it for genuinely different types with zero duplicated logic. Feeds Capstone 2, this guide's flagship demonstration of OCaml's module system.

## `module Make (Param : SIG) = struct ... end`

**You'll be able to:** write a functor taking a module as its argument, and produce a new module by applying it to a specific module argument.

**Concept**

A **functor** is a function from modules to modules — `module MakeSomething (Param : SomeSignature) = struct ... end` defines one, taking any module matching `SomeSignature` and producing a new module built using it. This is a genuinely distinctive capability compared to every polymorphism mechanism this series has covered so far — Racket's `class*`/interfaces and Clojure's protocols/multimethods both operate on *values*; a functor operates one level up, on *modules themselves*.

**Example**

```ocaml
module type ORDERED = sig
  type t
  val compare : t -> t -> int
end

module MakeSorter (Ord : ORDERED) = struct
  let sort lst = List.sort Ord.compare lst
end

module IntOrd = struct
  type t = int
  let compare a b = a - b
end

module StringOrd = struct
  type t = string
  let compare = String.compare
end

module IntSorter = MakeSorter (IntOrd)
module StringSorter = MakeSorter (StringOrd)
```

```ocaml
let sorted_ints = IntSorter.sort [5; 3; 8; 1; 9]
(* 1 3 5 8 9 *)
let sorted_strs = StringSorter.sort ["banana"; "apple"; "cherry"]
(* apple banana cherry *)
```

```
1 3 5 8 9 
apple banana cherry 
```

Verified directly: `MakeSorter` is written *once*, with zero mention of `int` or `string` anywhere in its own body — `IntSorter` and `StringSorter` are two genuinely separate, specialized modules, each produced by applying the same functor to a different `ORDERED` implementation. `IntSorter.sort` correctly produces ascending integers; `StringSorter.sort` correctly produces alphabetical order — both using `List.sort` internally, parameterized entirely through `Ord.compare`.

> **Pitfall:** `MakeSorter (IntOrd)` looks like an ordinary function call, and conceptually it is one — but it's happening at the *module* level, resolved entirely at compile time, not at runtime the way calling an ordinary function with a value argument would be. `IntSorter` and `StringSorter` are as real and as separately-typed as if each had been hand-written from scratch, with no runtime dispatch or indirection at all.

**Practice**

- Write a third `ORDERED` implementation (for a custom record type of your choosing, say `{ name : string; age : int }` ordered by age) and instantiate `MakeSorter` with it.
- Explain, in your own words, why `MakeSorter`'s own body never needs to know whether it's being instantiated for `int`, `string`, or anything else.

## Progress check

1. What does a functor take as its argument, and what does it produce?
2. How does a functor differ from every polymorphism mechanism this series has covered before (Racket's `class*`, Clojure's protocols/multimethods)?
3. In `MakeSorter (Ord : ORDERED)`, what does `Ord.compare` let `MakeSorter`'s body avoid knowing?
4. Is `IntSorter`'s specialization to `int` resolved at compile time or at runtime?
5. Why can the same `MakeSorter` functor produce both `IntSorter` and `StringSorter` with zero duplicated sorting logic?

### Answers

1. It takes another module (matching a specified signature) as its argument, and produces a new module as its result.
2. Every prior polymorphism mechanism operated on *values* at some dispatch point (a receiver object, a computed dispatch key); a functor operates one level up, taking and producing entire *modules*, resolved before the program ever runs.
3. Which specific type it's sorting, and how to compare two values of that type — `MakeSorter`'s own body only ever calls `Ord.compare`, never needing to know or care what concrete type `Ord.t` actually is.
4. At compile time — functor application is a module-level construct, with no runtime dispatch or indirection involved; `IntSorter` is as fully realized and separately typed as if hand-written.
5. Because the actual sorting logic (`List.sort Ord.compare`) is written exactly once, inside the functor, and the type-specific comparison behavior is supplied entirely through the `Ord` module argument — the functor itself never branches on or duplicates logic per type.
