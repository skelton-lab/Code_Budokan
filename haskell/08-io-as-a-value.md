# Module 8 — IO as a Value

By the end of this module you'll be able to state precisely what `IO a` means as a type, and explain — with a real, verified demonstration, not the usual hand-wave — why an `IO` action embedded inside "pure" code doesn't actually run just because it type-checks. Feeds Capstone 4.

## `IO a` is a value describing an action, not a statement that performs one

**You'll be able to:** state what `IO ()`/`IO a` means as a type, and distinguish "an `IO` action exists as a value" from "an `IO` action has been performed."

**Concept**

Every `IO`-performing operation in Haskell — `putStrLn`, `getLine`, reading a file — has a type like `IO ()` or `IO String`: a value *describing* an action to perform, tagged with what it produces when actually run. Crucially, **constructing** an `IO` value (evaluating `putStrLn "hi"` down to a concrete `IO ()` value) is not the same thing as **running** it — running only happens when an `IO` value is connected, directly or transitively, to `main`'s own top-level `IO` action, which the Haskell runtime actually executes.

**Example — the real, verified demonstration:**

```haskell
addOne :: Int -> Int
addOne x = putStrLn "sneaky!" `seq` (x + 1)

main :: IO ()
main = print (addOne 5)
```

```
6
```

Verified directly: this **compiles** — `addOne`'s type signature (`Int -> Int`) claims purity, and the compiler accepts it, because `seq :: a -> b -> b` is fully polymorphic; `putStrLn "sneaky!"`'s type, `IO ()`, unifies fine as `seq`'s first argument. But running it prints only `6` — **`"sneaky!"` never appears at all.** `seq` forces its first argument to weak head normal form (evaluates it enough to know it's not a crashing `undefined`/infinite loop), but for an `IO ()` value, "evaluated" and "executed" are different things entirely — `seq` only did the former. The `IO ()` value sat there, fully constructed, genuinely inert, and was simply discarded, because nothing ever connected it into `main`'s actual action chain.

> **This is the actual, precise rule — sharper than "pure functions can't do IO":** the type system doesn't prevent an `IO` value from being *constructed* inside code that never runs it — it prevents an `IO` value from ever being **run** unless it's part of the chain reachable from `main`. `addOne` really is pure, in the fully observable sense: calling it produces no side effect, ever, no matter how it's called, because the `IO` value it happens to construct along the way is never connected to anything that would actually execute it.

> **Pitfall:** this is a genuinely deeper and more precise truth than the common beginner-level summary ("Haskell keeps pure and impure code separate") — that summary is true in *effect*, but the actual mechanism is about execution, not merely typing. A newcomer who assumes "if it type-checks with an `IO` value inside, it must run" will be surprised, exactly the way this module's own verification was designed to make concrete rather than asserted.

**Practice**

- Modify `addOne` to actually connect `putStrLn "sneaky!"`'s result into `main`'s chain (by making `addOne` itself return `IO Int` and using it with `<-` in `main`'s own `do` block), and confirm `"sneaky!"` now genuinely prints.

## `do`-notation for `IO`: the same shape as `Maybe`/`Either`

**You'll be able to:** recognize that `IO`'s `do`-notation is the same underlying mechanism Module 6 used for `Maybe`/`Either`, now sequencing real-world actions instead of chaining possible failures.

**Concept**

`main :: IO ()` with a `do` block sequences a series of `IO` actions — `action1; action2; ...` — with `<-` extracting a result from one action to use in a later one, the identical syntax Module 6 used to extract `Just`/`Right` values. `IO` is a `Monad`, exactly like `Maybe` and `Either` — the same do-notation mechanism, applied to a different context (real-world sequencing, rather than possible failure).

**Example**

```haskell
main :: IO ()
main = do
  putStr "Enter your name: "
  name <- getLine
  putStrLn ("Hello, " ++ name ++ "!")
```

`name <- getLine` runs `getLine` (an `IO String` action) and extracts the resulting `String` — genuinely running it, unlike Module 8's `seq` example, precisely because this action is directly part of `main`'s own chain.

> **Pitfall:** the syntactic similarity to `Maybe`/`Either`'s do-notation is real and not a coincidence — but the *behavior* is different in one crucial way: `Maybe`/`Either`'s do-notation can short-circuit (stop early on `Nothing`/`Left`); `IO`'s do-notation always runs every action in sequence (barring an actual thrown exception) — there's no "IO failure" value analogous to `Nothing` built into the mechanism itself.

**Practice**

- Write a `main` that prompts for two numbers, reads them with `getLine`, and prints their sum — using `read` to convert each `String` to an `Int`.

## Progress check

1. What's the difference between "constructing" an `IO` value and "running" it?
2. What did the `addOne`/`seq` example prove that a simple assertion ("pure functions can't do IO") would not have shown?
3. Why did `addOne` compile at all, given its type signature claims purity?
4. What determines whether an `IO` action actually executes?
5. What's the real behavioral difference between `IO`'s do-notation and `Maybe`/`Either`'s do-notation, despite the identical syntax?

### Answers

1. Constructing an `IO` value means evaluating an expression down to a concrete `IO` action value — this can happen without any real-world effect occurring; running it means the Haskell runtime actually performs that action, which only happens when the value is connected, directly or transitively, to `main`.
2. That an `IO` value can be fully constructed and even forced (via `seq`) inside "pure" code without ever actually executing — a stronger, more precise claim than merely "you can't mix IO into pure functions," since this shows the compiler does accept an embedded IO value, it just never runs.
3. Because `seq :: a -> b -> b` is fully polymorphic, and `putStrLn "sneaky!"`'s type, `IO ()`, unifies fine as `seq`'s first argument — the type checker has no reason to reject it, since nothing about `seq`'s type requires actually running its first argument.
4. Whether it's part of the chain of actions reachable from `main`, the one `IO` action the Haskell runtime actually executes when the program runs.
5. `Maybe`/`Either`'s do-notation can short-circuit early on `Nothing`/`Left`, skipping remaining steps; `IO`'s do-notation always runs every action in the sequence (barring a thrown exception) — there's no built-in "this IO action failed, skip the rest" value analogous to `Nothing`.
