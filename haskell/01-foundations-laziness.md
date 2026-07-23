# Module 1 — Foundations: Laziness by Default

By the end of this module you'll be able to write basic typed Haskell functions, and — the real point of this module — prove directly that Haskell's laziness means some values genuinely never get computed at all, not merely "computed later." Feeds Capstone 1.

## Basic syntax: type signatures and functions

**You'll be able to:** write a typed function and apply it, including over a list with `map`.

**Concept**

`name :: Type -> Type -> ReturnType` declares a function's type signature (idiomatic, though not strictly required — inference can fill it in, the same Hindley-Milner inference `ocaml/01-foundations-types-strict-eval.md` covered). `name arg1 arg2 = expression` defines it. `map` applies a function across an entire list, producing a new one.

**Example**

```haskell
add :: Int -> Int -> Int
add a b = a + b

square :: Int -> Int
square x = x * x

main :: IO ()
main = do
  print (add 3 4)
  print (square 5)
  print (map square [1, 2, 3, 4, 5])
```

```
7
25
[1,4,9,16,25]
```

Verified directly: `add 3 4 = 7`, `square 5 = 25`, and `map square` correctly squares every element of `[1,2,3,4,5]`.

> **Pitfall:** unlike OCaml's strict `+`/`+.` separation (`ocaml/01-foundations-types-strict-eval.md`), Haskell's numeric literals and operators are polymorphic by default — `3 + 4` works whether `3`/`4` end up being `Int`, `Integer`, or `Double`, resolved by type inference from context. This is a real, different design choice from OCaml's, not an oversight in either direction — worth noting precisely rather than assuming Haskell made "the same choice" as most other languages.

**Practice**

- Write a typed function `cube :: Int -> Int` and confirm `map cube [1,2,3]` gives `[1,8,27]`.

## Laziness: not "deferred," genuinely "maybe never"

**You'll be able to:** state precisely what laziness guarantees, and prove — not assert — that an unevaluated value in Haskell can remain permanently unevaluated even when it would crash if forced.

**Concept**

Every expression in this series' other languages, even Clojure's `lazy-seq` (`clojure/08-sequence-abstraction-laziness.md`), needed an explicit opt-in to defer evaluation — laziness was a deliberate library feature layered onto an otherwise-eager language. Haskell inverts this entirely: **every** expression is lazy by default, evaluated only when its value is actually demanded, with no special syntax required to get that behavior.

**Example — a genuinely self-referential infinite list:**

```haskell
let ones = 1 : ones
print (take 5 ones)
```

```
[1,1,1,1,1]
```

Verified directly: `ones` is defined *in terms of itself*, referring to its own not-yet-computed tail — this is only possible at all because `:` (cons) doesn't force its second argument; `take 5` only ever demands the first five elements, so the infinite self-reference never becomes an infinite loop.

**The actual proof, not an assumption — a value that would crash, never forced:**

```haskell
let xs = [1, 2, error "boom", 4, 5]
print (take 2 xs)
print (xs !! 3)
```

```
[1,2]
4
```

Verified directly: `xs` contains `error "boom"` at index 2 — a value that, if evaluated, would crash the program immediately. `take 2 xs` only demands indices 0 and 1, so index 2 is never touched, and the program runs to completion normally, printing `[1,2]`. `xs !! 3` similarly only walks *past* index 2 to reach index 3, never forcing it, correctly returning `4`.

**Confirmed the error really is there, when actually demanded:**

```haskell
print (xs !! 2)
```

```
lazy_error: Uncaught exception ... boom
```

Verified directly: asking for exactly the element that contains the crashing value does, in fact, crash — proving the earlier examples weren't succeeding because the error was somehow absent, but genuinely because laziness meant it was never evaluated at all until specifically demanded.

> **Pitfall:** this is stronger than "computation happens later" — a lazily-unevaluated value in Haskell can remain unevaluated for the entire lifetime of a running program if nothing ever demands it, including a value that would outright crash if it were. Code that "looks wrong" (an out-of-range computation buried inside a data structure, say) can run completely successfully for years if the specific broken part is never actually accessed — a real, double-edged consequence of default laziness worth understanding precisely, not just accepting as "Haskell is lazy, cool."

**Practice**

- Build a list containing `1 `div` 0` at some position, and confirm you can `take` a prefix that avoids it without crashing.
- Predict, then verify, what happens when you finally do force that specific element.

## Progress check

1. What's the practical difference between how Clojure's `lazy-seq` and Haskell's default evaluation each achieve laziness?
2. Why does `let ones = 1 : ones` not cause an infinite loop when defined?
3. What did `take 2 xs` prove about the `error "boom"` value at index 2 of `xs`, and how is that different from merely "it hadn't run yet"?
4. What confirmed that the error value in `xs` genuinely was a real, crashing value, not something that had been silently skipped or fixed?
5. What's the double-edged real-world consequence of laziness this module names directly?

### Answers

1. Clojure's `lazy-seq` is an explicit, opt-in library mechanism layered onto an otherwise-eager language — laziness has to be deliberately requested; Haskell's laziness is the default evaluation strategy for every expression, with no special syntax needed to get it.
2. Because `:` (cons) doesn't force its second argument — `ones` refers to its own tail, but nothing forces that self-reference to actually unfold until something demands elements from it, and `take` only ever demands a finite prefix.
3. That the error value was never evaluated *at all*, not merely deferred and then silently run in the background — proven by the program completing successfully with correct output, rather than merely running slower or completing at a different time.
4. Directly forcing that exact element (`xs !! 2`) crashed the program with the expected error message — confirming the value genuinely was a real, would-crash value all along, not something that had quietly been resolved or worked around.
5. That a lazily-unevaluated broken value can sit inside a running program indefinitely, causing zero observable problems, for as long as nothing ever actually demands it — a real trap for code that "looks correct" because its broken part has simply never been exercised.
