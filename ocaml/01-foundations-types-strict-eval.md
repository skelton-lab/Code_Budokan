# Module 1 — Foundations: Types, Let-Bindings, Strict Evaluation

By the end of this module you'll be able to write and read OCaml's basic types and `let`-bound functions, see the compiler's own inferred types with no annotations written, and state precisely what OCaml's strict evaluation does and does not guarantee. Feeds Capstone 1.

## `let`, functions, and type inference — verified, not asserted

**You'll be able to:** write functions with no type annotations, and see the compiler's own inferred types directly.

**Concept**

`let name = expression` binds a value; `let name arg1 arg2 = expression` defines a function. OCaml's type checker uses Hindley-Milner inference — it deduces every value's and function's precise type purely from how it's used, with no annotations required anywhere in ordinary code.

**Example**

```ocaml
let add a b = a + b
let greet name = "Hello, " ^ name
let is_even n = n mod 2 = 0
```

```
$ ocamlc -i infer_test.ml
val add : int -> int -> int
val greet : string -> string
val is_even : int -> bool
```

Verified directly, with `ocamlc -i` (compile just far enough to print inferred signatures, no binary produced): not one type was written in the source, yet the compiler correctly deduced `add : int -> int -> int` (from `+`, which is specifically an `int` operator — more on this below), `greet : string -> string` (from `^`, string concatenation), and `is_even : int -> bool` (from `mod` and `=`). This is real, checkable inference, not a claim to trust from documentation.

> **Pitfall:** because inference works backward from *usage*, a function's inferred type can be narrower than what its author actually intended — a function meant to work on "any type with an equality check" that happens to only ever get called with integers in its own module will infer as `int`-specific, not generic, with no warning that a broader type was possible.

**Practice**

- Write three more one-line functions with no type annotations, and confirm their inferred types with `ocamlc -i` match your own prediction before checking.

## `int` and `float` are genuinely different types — with different operators

**You'll be able to:** use the correct arithmetic operator for `int` vs. `float`, and explain why OCaml doesn't implicitly convert between them.

**Concept**

Unlike most languages in this series, OCaml's arithmetic operators are **not overloaded** across numeric types — `+`/`-`/`*`/`/` are `int`-only; `+.`/`-.`/`*.`/`/.` (with a trailing dot) are the `float` equivalents. There's no implicit `int`-to-`float` conversion anywhere; mixing them is a compile-time type error.

**Example**

```ocaml
let add a b = a + b
let () = Printf.printf "%d\n" (add 3 4)

let add_float a b = a +. b
let () = Printf.printf "%f\n" (add_float 3.0 4.0)
```

```
7
7.000000
```

**Verified directly as a real, hard compile-time error, not a warning:**

```ocaml
let bad = 3 + 4.0
```

```
File "m1b.ml", line 1, characters 14-17:
1 | let bad = 3 + 4.0
                  ^^^
Error: The constant 4.0 has type float but an expression was expected of type
         int
```

The compiler precisely pinpoints `4.0` — because `+` (not `+.`) infers its arguments as `int`, `4.0` (a `float` literal) fails to type-check at exactly that position, before the program can ever run.

> **Pitfall:** this trips up nearly every newcomer coming from a language with automatic numeric coercion (which is most of this series' other languages) — `3 + 4.0` isn't merely unusual style in OCaml, it's a hard type error every time, with no configuration or flag to relax it. Converting explicitly (`float_of_int 3 +. 4.0`) is the only correct fix.

**Practice**

- Write a function computing a rectangle's area from `float` width and height, using `*.`, and confirm calling it with `int` arguments fails to compile.

## Strict evaluation — real, but not left-to-right

**You'll be able to:** state precisely what "strict evaluation" guarantees, and what this module's own direct test showed it does *not* guarantee.

**Concept**

OCaml is a **strict** (eager) language — every subexpression is evaluated when reached, unlike the lazy evaluation this series' next guide, Haskell, defaults to. But strictness is a claim about *whether* something gets evaluated, not *in what order* — and OCaml's evaluation order for sibling subexpressions (like both sides of a `+`) is genuinely unspecified by the language, verified directly below.

**Example**

```ocaml
let side_effect label value =
  Printf.printf "evaluating %s\n" label;
  value

let () =
  let _ = side_effect "a" 1 + side_effect "b" 2 in
  print_endline "done"
```

```
evaluating b
evaluating a
done
```

Verified directly: `side_effect "b"` printed **before** `side_effect "a"`, even though `"a"` appears first, textually, on the left. Both were evaluated (confirming strictness — neither was skipped), but the *order* between them was right-to-left on this exact toolchain, not the left-to-right order a reader coming from most other languages in this series would likely assume without checking.

> **Pitfall:** this is exactly the kind of claim this series' whole methodology exists to catch — "evaluation order" sounds like an obvious, safe assumption until actually tested. Code relying on side effects happening in a specific order across sibling subexpressions (rather than sequenced explicitly with `let`/`;`) is depending on unspecified behavior, verified here to not match the naive left-to-right guess.

**Practice**

- Rewrite the `side_effect` example using explicit sequential `let` bindings (`let a = side_effect "a" 1 in let b = side_effect "b" 2 in a + b`) and confirm the order becomes deterministic and matches the textual order.

## Progress check

1. What does `ocamlc -i` show, and why does it matter for this module's own claims about type inference?
2. Why does `3 + 4.0` fail to compile in OCaml, when it would work in most other languages this series has covered?
3. What's the difference between `+` and `+.`?
4. What does OCaml's strict evaluation guarantee, precisely?
5. What did this module's own direct test show about evaluation order for `side_effect "a" 1 + side_effect "b" 2`, and why does that matter?

### Answers

1. It compiles just far enough to print the compiler's own inferred type signatures, with no binary produced — proof that type inference genuinely happened from usage alone, checkable directly rather than trusted from documentation.
2. Because `+` specifically operates on `int`, with no implicit conversion to or from `float` — `4.0` is a `float` literal, so mixing it with `+` is a type mismatch caught at compile time, not silently coerced.
3. `+` is integer addition; `+.` (with a trailing dot) is the float equivalent — OCaml has entirely separate operators per numeric type rather than one overloaded operator.
4. That every subexpression genuinely gets evaluated (nothing is skipped or deferred, unlike lazy evaluation) — it does not guarantee any particular order among sibling subexpressions.
5. That `side_effect "b"` actually printed before `side_effect "a"`, even though `"a"` appears first in the source — proving evaluation order between siblings is real but not left-to-right on this toolchain, a genuinely easy wrong assumption to make without testing it directly.
