# Module 2 — Algebraic Data Types & Pattern Matching

By the end of this module you'll be able to define variant types (including recursive ones), destructure them with pattern matching, and — the real payoff — rely on the compiler to catch a forgotten case by name, at compile time. Feeds Capstone 1.

## Variant types and `match`

**You'll be able to:** define a variant type with multiple, differently-shaped cases, and write an exhaustive `match` over it.

**Concept**

`type name = Case1 of type | Case2 of type * type | ...` defines a variant (sum) type — a value is *exactly one* of the named cases, each optionally carrying its own data. `match value with | Case1 x -> ... | Case2 (a, b) -> ...` destructures it, binding each case's carried data to names.

**Example**

```ocaml
type shape =
  | Circle of float
  | Rectangle of float * float
  | Triangle of float * float * float

let area = function
  | Circle r -> 3.14159 *. r *. r
  | Rectangle (w, h) -> w *. h
  | Triangle (a, b, c) ->
      let s = (a +. b +. c) /. 2.0 in
      sqrt (s *. (s -. a) *. (s -. b) *. (s -. c))
```

```
78.539750
24.000000
6.000000
```

Verified directly against a circle (radius `5`, area `π·25 = 78.53975`), a rectangle (`4×6 = 24`), and a `3-4-5` right triangle (Heron's formula: `s = 6`, area `√(6·3·2·1) = 6`) — every result checked by hand, not just "it compiled."

> **Pitfall:** `function` (no explicit argument name) is shorthand for `fun x -> match x with ...` — used throughout this guide wherever a function's *entire* body is one `match` on its single argument, which is idiomatic OCaml style, not a different language feature from `match` itself.

**Practice**

- Add a `Square of float` case, and update `area` to handle it.

## Exhaustiveness checking: the compiler catches a forgotten case

**You'll be able to:** read a real compiler warning naming exactly which case a `match` failed to handle.

**Concept**

Because a variant type's cases are closed and fully known to the compiler, it can check whether a `match` handles *every* case — and it does, by default, producing a real, specific warning (not silence) when one is missing.

**Example — a deliberately incomplete match, verified directly:**

```ocaml
let area = function
  | Circle r -> 3.14159 *. r *. r
  | Rectangle (w, h) -> w *. h
  (* Triangle case forgotten *)
```

```
Warning 8 [partial-match]: this pattern-matching is not exhaustive.
  Here is an example of a case that is not matched: Triangle (_, _, _)
```

Verified directly: the compiler doesn't just say "something's missing" — it names the *exact* missing case, `Triangle (_, _, _)`, precisely and specifically. The program still compiles and runs by default (this is a warning, not a hard error) — calling `area` with a `Triangle` at runtime would crash with a `Match_failure` exception, but the compiler already told you exactly where and why, before you ever ran it.

> **Pitfall:** because exhaustiveness checking is a *warning* by default, not an error, it's genuinely possible to ship code with an incomplete match if warnings aren't being watched — `ocamlopt -warn-error +8` (or similar) promotes this specific warning to a hard compile error, a real, worthwhile setting for production code this guide's own examples don't enable by default, to keep the warning visible in this guide's own verified output rather than blocking the build outright.

**Practice**

- Deliberately remove one case from a `match` you've already written correctly, recompile, and read the exact warning the compiler produces — confirm it names the specific missing case, not just "incomplete."

## Recursive variant types

**You'll be able to:** define a variant type that refers to itself, and write a recursive function processing it.

**Concept**

A variant type's case can carry a value of the *same* type it's defining — this is how OCaml represents recursive structures (expression trees, linked lists) natively, with `let rec` defining the matching recursive function.

**Example**

```ocaml
type expr =
  | Num of int
  | Add of expr * expr
  | Mul of expr * expr

let rec eval e =
  match e with
  | Num n -> n
  | Add (a, b) -> eval a + eval b
  | Mul (a, b) -> eval a * eval b

let () =
  let e = Add (Num 3, Mul (Num 4, Num 5)) in
  Printf.printf "%d\n" (eval e)
```

```
23
```

Verified directly: `Add (Num 3, Mul (Num 4, Num 5))` represents `3 + (4 × 5)`, and `eval` — recursing into each `Add`/`Mul` case's own sub-expressions — correctly computes `3 + 20 = 23`. This is the exact data representation Capstone 1 builds directly on.

> **Pitfall:** `let rec` (not plain `let`) is required for a function to call itself — plain `let eval e = ... eval a ...` would fail to compile, since `eval` isn't in scope for its own body without the explicit `rec` marker; this is a real, load-bearing keyword, not a stylistic choice.

**Practice**

- Add a `Sub of expr * expr` case and extend `eval` to handle it, confirming the compiler's exhaustiveness check flags it if you forget.

## Progress check

1. What does a variant type's definition actually declare about a value of that type?
2. What did the compiler's exhaustiveness warning name specifically, in this module's own verified example?
3. Is exhaustiveness checking a hard compile error or a warning, by default?
4. Why does `eval` need `let rec`, not plain `let`?
5. What does `Add (Num 3, Mul (Num 4, Num 5))` represent, and how was `eval`'s result on it verified?

### Answers

1. That a value of that type is *exactly one* of the named cases, each optionally carrying its own associated data — never more than one case at once, never something outside the declared cases.
2. The exact missing case, `Triangle (_, _, _)` — not merely "this match is incomplete," but precisely which constructor pattern isn't handled.
3. A warning by default — the program still compiles and runs; an unhandled case only fails at runtime (with `Match_failure`) if that specific case is actually reached.
4. Because `eval` calls itself recursively inside its own body — `rec` explicitly brings the function's own name into scope for its body; without it, the name `eval` inside the body would refer to nothing, and the definition would fail to compile.
5. It represents `3 + (4 × 5)`; `eval`'s result (`23`) was verified by hand against that same arithmetic, not merely trusted because the program compiled and ran without error.
