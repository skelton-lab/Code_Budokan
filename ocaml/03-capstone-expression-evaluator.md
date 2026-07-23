# Capstone 1 — A Type-Safe Expression Evaluator

Combines every concept from Modules 1–2: a small arithmetic expression language with variables, evaluated against an environment, where every failure mode (an undefined variable, a division by zero) is represented in the *type system itself* via `option` — no exceptions, no null, no runtime crash for either failure case.

## The evaluator

```ocaml
type expr =
  | Num of int
  | Var of string
  | Add of expr * expr
  | Sub of expr * expr
  | Mul of expr * expr
  | Div of expr * expr

let rec eval env e =
  match e with
  | Num n -> Some n
  | Var name -> List.assoc_opt name env
  | Add (a, b) ->
      (match eval env a, eval env b with
       | Some x, Some y -> Some (x + y)
       | _ -> None)
  | Sub (a, b) ->
      (match eval env a, eval env b with
       | Some x, Some y -> Some (x - y)
       | _ -> None)
  | Mul (a, b) ->
      (match eval env a, eval env b with
       | Some x, Some y -> Some (x * y)
       | _ -> None)
  | Div (a, b) ->
      (match eval env a, eval env b with
       | Some x, Some y when y <> 0 -> Some (x / y)
       | _ -> None)
```

`eval` returns `int option`, not `int` — `Some result` on success, `None` on either failure mode (an unbound `Var`, via `List.assoc_opt` returning `None` for a missing key; a zero divisor, via the `when y <> 0` guard on the `Div` case's pattern). Every recursive call is itself checked for `Some`/`None` before combining — a failure anywhere in a sub-expression propagates automatically to `None` for the whole expression, with no explicit "did this fail" check written by hand beyond the pattern match itself.

## Verification

```ocaml
let env = [("x", 10); ("y", 3)] in
show (eval env (Mul (Add (Var "x", Var "y"), Num 2)));       (* (x+y)*2 *)
show (eval env (Div (Var "x", Sub (Var "y", Num 3))));        (* x/(y-3) *)
show (eval env (Add (Var "z", Num 1)));                       (* z undefined *)
show (eval env (Mul (Sub (Var "x", Var "y"), Add (Var "x", Var "y"))))  (* (x-y)*(x+y) *)
```

```
Result: 26
Error: undefined variable or division by zero
Error: undefined variable or division by zero
Result: 91
```

Checked by hand against every expression: `(10+3)×2 = 26` — matches. `10/(3-3) = 10/0` — correctly propagates to `Error`, caught by the `Div` case's `y <> 0` guard, not a runtime crash. `z + 1` with `z` unbound — correctly `Error`, from `List.assoc_opt` returning `None`, propagated through `Add`'s pattern match. `(10-3)×(10+3) = 7×13 = 91` — matches.

> **The actual point of this capstone:** this evaluator's *type signature* (`eval : (string * int) list -> expr -> int option`) tells a caller, before ever running it, that failure is a real, expected possibility — there's no way to call `eval` and forget that the result might be absent, the way a caller of a function that might throw an unchecked exception or return `null` can genuinely forget. The compiler enforces handling both cases at the point `eval`'s result is used (via `show`'s own pattern match), because `option` is itself a two-case variant type, subject to the exact same exhaustiveness checking Module 2 demonstrated.

> **Pitfall:** the `_` wildcard pattern in each `match ... with | Some x, Some y -> ... | _ -> None` genuinely means "any other combination" — including `Some _, None` and `None, Some _`, not just `None, None`. This is correct here (any missing operand should propagate to failure), but it's worth reading `_` precisely rather than assuming it only catches the "both failed" case.

## Extending it yourself

- Add a `Neg of expr` (unary negation) case, extending both `expr` and `eval`, and confirm the compiler's exhaustiveness warning fires if you update one but forget the other.
- Rewrite `Add`'s case using OCaml's `Option.bind` (or the `let*` binding operator, if you look it up) instead of nested pattern matching — a genuinely more idiomatic style for chaining `option`-returning computations, worth comparing directly against the explicit pattern-match version here.
