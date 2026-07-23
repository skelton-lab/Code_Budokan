# Capstone 3 — Safe Composition with `Either`

Combines every concept from Module 6: the direct Haskell counterpart to `ocaml/03-capstone-expression-evaluator.md` — an arithmetic expression evaluator with variables, where every failure mode (an undefined variable, a division by zero) is represented in the type system via `Either String Int`, complete with a real, specific error message for each.

## The evaluator

```haskell
data Expr = Num Int | Var String | Add Expr Expr | Div Expr Expr

type Env = [(String, Int)]

eval :: Env -> Expr -> Either String Int
eval _ (Num n) = Right n
eval env (Var name) =
  case lookup name env of
    Just v -> Right v
    Nothing -> Left ("undefined variable: " ++ name)
eval env (Add a b) = do
  x <- eval env a
  y <- eval env b
  return (x + y)
eval env (Div a b) = do
  x <- eval env a
  y <- eval env b
  if y == 0
    then Left "division by zero"
    else return (x `div` y)
```

`data Expr` is the same recursive variant shape `ocaml/02-adts-pattern-matching.md`'s `expr` type used. `eval`'s type signature, `Env -> Expr -> Either String Int`, tells a caller everything: this can fail, and when it does, it comes with a real reason — no separate documentation needed to know that. `Var`'s case converts `lookup`'s `Maybe` result into `Either` explicitly (`Just v -> Right v`, `Nothing -> Left "..."`), attaching a real message at exactly the point the bare `Maybe` would otherwise lose that information. `Add` and `Div` use do-notation exactly as Module 6 demonstrated — no explicit `case eval env a of Right x -> case eval env b of ...` nesting required anywhere.

## Verification

```haskell
let env = [("x", 10), ("y", 0)]
print (eval env (Add (Var "x") (Num 5)))
print (eval env (Div (Var "x") (Var "y")))
print (eval env (Add (Var "z") (Num 1)))
```

```
Right 15
Left "division by zero"
Left "undefined variable: z"
```

Checked by hand: `x + 5 = 10 + 5 = 15` — succeeds, `Right 15`. `x / y = 10 / 0` — correctly caught by the `Div` case's explicit zero-check, `Left "division by zero"`. `z + 1`, with `z` unbound in `env` — correctly `Left "undefined variable: z"`, the specific message attached exactly where `Var`'s case converted the plain `Nothing` into a real explanation.

> **The direct, side-by-side comparison with OCaml's identical capstone:** both evaluators solve the exact same problem — arithmetic with variables, two failure modes, safe composition — and both use a two-case result type to represent success/failure in the type system rather than exceptions. The real, honest differences: OCaml's version returned bare `int option` (`None` carries no explanation at all); Haskell's `Either String Int` carries a specific, real message for every failure. OCaml's version needed explicit `match ... Some x, Some y -> ... | _ -> None` at every combining step; Haskell's do-notation handles that unwrapping automatically. Neither difference is about one language being "better" at this problem — they're a direct, concrete look at what each language's standard idioms actually cost and provide, verified side by side rather than asserted.

> **Pitfall:** `Div`'s zero-check (`if y == 0 then Left "..." else return (...)`) is deliberately explicit, not something do-notation does for you — do-notation only automates the "was the previous step's result a failure" propagation; it doesn't know that `y == 0` is a domain-specific failure condition for division specifically. That check is exactly as much the evaluator author's own responsibility here as it was in OCaml's `when y <> 0` guard.

## Extending it yourself

- Add a `Mul`/`Sub` case, following the same do-notation pattern as `Add`.
- Change `Var`'s undefined-variable message to include the full list of valid variable names from `env`, making the error more actionable — a real, easy improvement `Either`'s descriptive-failure design makes natural, that `Maybe`'s bare `Nothing` could never have expressed at all.
