# Module 8 — Exceptions

By the end of this module you'll be able to define and raise your own exceptions, catch built-in ones, and state precisely when OCaml uses an exception versus a silent numeric result for the "same" operation. Feeds Capstone 3.

## Defining and raising your own exceptions

**You'll be able to:** declare a custom exception carrying data, raise it, and catch it with `try`/`with`.

**Concept**

`exception Name of type` declares a new exception, optionally carrying data (like a variant constructor — exceptions genuinely are a special case of the same underlying mechanism). `raise (Name data)` raises it; `try expr with Name x -> handler` catches it, binding the carried data to `x`.

**Example**

```ocaml
exception Negative_input of int

let safe_sqrt x =
  if x < 0.0 then raise (Negative_input (int_of_float x))
  else sqrt x

let () =
  Printf.printf "%f\n" (safe_sqrt 16.0);
  (try
    let _ = safe_sqrt (-4.0) in ()
  with Negative_input n -> Printf.printf "Caught: %d\n" n)
```

```
4.000000
Caught: -4
```

Verified directly: `safe_sqrt 16.0` computes normally; `safe_sqrt (-4.0)` raises `Negative_input (-4)`, correctly caught and printed by the matching `with` clause.

> **Pitfall:** this guide's Capstone 1 solved a similar-looking problem (a computation that might fail) using `option` instead of exceptions. Both are legitimate, idiomatic OCaml — the real distinction is that `option` makes failure part of a function's own *type signature*, forcing every caller to handle it explicitly at the type-checker level, while an exception's possibility is invisible in the type signature entirely; a caller can simply forget to catch it, and the program crashes at runtime instead of failing to compile.

**Practice**

- Define an exception `Invalid_age of int` and a function `validate_age` that raises it for negative input, catching it in a small test.

## Built-in exceptions, and when OCaml uses one at all

**You'll be able to:** recognize `Division_by_zero` and `Failure`, two exceptions built into OCaml's standard library, and state precisely when integer division raises an exception versus when float division does not.

**Concept**

`Division_by_zero` is raised by integer division (`/`) when the divisor is `0`. `Failure` (carrying a `string` message) is raised by several standard-library functions, including `List.nth` on an out-of-range index.

**Example**

```ocaml
(try let _ = 10 / 0 in () with Division_by_zero -> print_endline "Caught division by zero");
(try let _ = List.nth [1;2;3] 10 in ()
 with Failure msg -> Printf.printf "Caught: %s\n" msg)
```

```
Caught division by zero
Caught: nth
```

**The real, verified contrast with Module 1's int/float distinction:**

```ocaml
let () = Printf.printf "%f\n" (10.0 /. 0.0)
```

```
inf
```

Verified directly: `10 / 0` (integer division) raises `Division_by_zero`; `10.0 /. 0.0` (float division) does **not** raise anything at all — it returns `inf` (infinity), following ordinary IEEE 754 floating-point semantics, and the program continues running normally. This is the exact same `int`/`float` operator separation Module 1 introduced, now shown to have a genuinely different *failure behavior* attached to each, not just different arithmetic symbols.

> **Pitfall:** code that defensively wraps integer division in a `try`/`with Division_by_zero` handler provides **zero** protection against the equivalent float division producing a silent `inf` (or, from further float arithmetic on that `inf`, a silent `nan`) instead of ever raising anything at all. A reader relying on exceptions to catch every numeric problem needs to know this distinction precisely, not assume both numeric types fail the same way.

**Practice**

- Compute `0.0 /. 0.0` and confirm what it produces (a related but distinct IEEE 754 special value from `inf`) — then explain why no `try`/`with` block could ever catch it.

## Progress check

1. What does `exception Name of type` declare, and what earlier OCaml concept is it structurally similar to?
2. What's the real, load-bearing difference between using `option` and using an exception for a function that might fail?
3. What does `Division_by_zero` get raised by, specifically?
4. Verified directly in this module: does `10.0 /. 0.0` raise `Division_by_zero`? What does it produce instead?
5. Why is it a real mistake to assume a `try`/`with Division_by_zero` handler protects against every "divide by zero" scenario in an OCaml program?

### Answers

1. It declares a new exception, optionally carrying typed data — structurally similar to a variant constructor (Module 2), since exceptions are a special case of the same underlying tagged-value mechanism.
2. `option` makes the possibility of failure part of a function's own type signature, forcing every caller to handle both cases explicitly at compile time; an exception's possibility is invisible in the type signature, so a caller can forget to catch it and the program crashes at runtime instead of failing to compile.
3. Integer division (`/`) when the divisor is `0`.
4. No — verified directly, it produces `inf` (IEEE 754 infinity) with no exception raised at all; the program continues running normally.
5. Because float division by zero (`/.`) follows IEEE 754 semantics and produces `inf`/`nan` silently rather than raising anything — a handler written only for `Division_by_zero` provides no protection at all against the float case, which fails silently instead of loudly.
