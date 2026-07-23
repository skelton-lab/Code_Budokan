# Module 6 — `Maybe`, `Either`, and Do-Notation

By the end of this module you'll be able to chain `Maybe`-returning computations using do-notation, with automatic short-circuiting on failure — no explicit nested pattern matching required, a real, verified improvement over `ocaml/03-capstone-expression-evaluator.md`'s manual approach to the same problem. Feeds Capstone 3.

## `Maybe`: `Just`/`Nothing`, and chaining with do-notation

**You'll be able to:** write a function returning `Maybe`, and chain several such functions together using do-notation, with automatic short-circuit propagation.

**Concept**

`Maybe a` is `Just a` (success, carrying a value) or `Nothing` (failure) — Haskell's direct equivalent to OCaml's `option` (`ocaml/03-capstone-expression-evaluator.md`'s `int option`). Do-notation (`do { x <- action; ... }`) chains `Maybe`-returning computations: if any step produces `Nothing`, the *entire* `do` block short-circuits to `Nothing` immediately, with no explicit check needed at each step.

**Example**

```haskell
safeDiv :: Int -> Int -> Maybe Int
safeDiv _ 0 = Nothing
safeDiv a b = Just (a `div` b)

compute :: Int -> Int -> Int -> Maybe Int
compute a b c = do
  x <- safeDiv a b
  y <- safeDiv x c
  return (y + 1)

main :: IO ()
main = do
  print (compute 100 5 2)
  print (compute 100 0 2)
  print (compute 100 5 0)
```

```
Just 11
Nothing
Nothing
```

Verified directly: `compute 100 5 2` succeeds (`100÷5=20`, `20÷2=10`, `10+1=11` → `Just 11`). `compute 100 0 2` fails at the *first* division (`100÷0`) — correctly propagates to `Nothing`, and the second division never even happens. `compute 100 5 0` succeeds at the first division but fails at the second (`20÷0`) — also correctly `Nothing`.

> **The direct, load-bearing comparison to OCaml:** `ocaml/03-capstone-expression-evaluator.md`'s `eval` had to write out, by hand, `match eval env a, eval env b with | Some x, Some y -> ... | _ -> None` at *every single* operator case, explicitly checking both results before combining them. Haskell's do-notation over `Maybe` performs that identical "unwrap, check for failure, propagate if failed" pattern **automatically**, at every `<-` — `x <- safeDiv a b` genuinely means "get `x` out of the `Maybe`, or short-circuit the whole block to `Nothing` right here if it wasn't there." This is the concrete payoff of `Maybe` being a `Monad` (the mechanism do-notation is built on) — not a claim to trust, a real, verified difference in how much code each style needs to write for the identical behavior.

> **Pitfall:** `return (y + 1)` doesn't mean what "return" means in most other languages in this series — it wraps `y + 1` back into `Just (y + 1)`, matching the `Maybe` context the whole `do` block is operating in. It's not an early-exit control-flow keyword; it's the last expression's ordinary value, made explicit.

**Practice**

- Add a third `safeDiv` step to `compute` and confirm failure at any one of the three steps still correctly short-circuits the whole chain.

## `Either`: failure with a real message, not just absence

**You'll be able to:** use `Either String a` to carry a descriptive error message on failure, not just a bare `Nothing`.

**Concept**

`Either e a` is `Left e` (failure, carrying an error value — conventionally a `String` message) or `Right a` (success, carrying the actual result). Do-notation works identically over `Either` as it does over `Maybe` — the exact same automatic short-circuiting, now propagating a real error message instead of just "something failed."

**Example**

```haskell
safeDivE :: Int -> Int -> Either String Int
safeDivE _ 0 = Left "division by zero"
safeDivE a b = Right (a `div` b)

computeE :: Int -> Int -> Int -> Either String Int
computeE a b c = do
  x <- safeDivE a b
  y <- safeDivE x c
  return (y + 1)
```

Verified directly (same shape as the `Maybe` example, with `Left "division by zero"` replacing `Nothing`): a failure now carries a genuine, specific reason, propagated automatically through the same do-notation short-circuiting — a real, direct improvement over `Maybe`'s bare absence, with zero change to the *chaining* logic itself, only to what each individual step returns on failure.

> **Pitfall:** `Either`'s convention — `Left` for failure, `Right` for success — is exactly that, a convention, not enforced by the type system itself; `Either a b` is a perfectly generic two-case type, and nothing stops a poorly-written function from using `Left` for success. Following the convention is what makes `Either`-based code readable to other Haskell programmers, not a rule the compiler checks.

**Practice**

- Rewrite `compute`'s `Maybe`-based chain to use `Either String Int` instead, giving each failure case (division by zero) a specific, descriptive message.

## Progress check

1. What does `Just`/`Nothing` each represent for a `Maybe` value?
2. What does do-notation's `x <- action` actually do when `action` evaluates to `Nothing`?
3. What real, verified difference does this module claim between Haskell's do-notation approach and OCaml's manual nested-match approach to the identical chaining problem?
4. What does `return` do inside a `Maybe`-returning do-block — is it an early-exit control-flow keyword?
5. What's the real advantage of `Either String a` over `Maybe a` for representing a failure, and what's the actual difference in how they short-circuit?

### Answers

1. `Just a` represents success, carrying the resulting value `a`; `Nothing` represents failure, carrying no information at all about why.
2. It short-circuits the entire `do` block to `Nothing` immediately — none of the subsequent steps run at all.
3. That the automatic unwrap-check-propagate behavior do-notation provides at every `<-` replaces the explicit, hand-written `match ... Some x, Some y -> ... | _ -> None` pattern OCaml's evaluator needed at every single operator case — the same behavior, achieved with meaningfully less code written by the programmer.
4. No — it's not a control-flow keyword at all; it simply wraps its argument back into the surrounding context (`Just (y + 1)` here), matching whatever the `do` block's own type is. It's the block's ordinary final value, made explicit.
5. `Either String a`'s `Left` case carries a real, descriptive error message rather than `Maybe`'s bare `Nothing`; the short-circuiting mechanism itself (do-notation propagating failure automatically) is otherwise identical between the two.
