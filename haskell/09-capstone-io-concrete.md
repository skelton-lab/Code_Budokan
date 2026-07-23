# Capstone 4 — IO as a Value, Made Concrete

Combines every concept from Modules 6–8: a real, interactive grade calculator — reading input via `IO`, validating it with pure `Either`-based logic exactly like Capstone 3's evaluator, and printing a result — demonstrating the realistic Haskell pattern of keeping business logic pure and pushing `IO` to the program's edges.

## The program

```haskell
import System.IO

validateScore :: Int -> Either String Int
validateScore s
  | s < 0 = Left ("negative score: " ++ show s)
  | s > 100 = Left ("score over 100: " ++ show s)
  | otherwise = Right s

average :: [Int] -> Either String Double
average scores = do
  validated <- mapM validateScore scores
  if null validated
    then Left "no scores provided"
    else return (fromIntegral (sum validated) / fromIntegral (length validated))

main :: IO ()
main = do
  hSetBuffering stdout NoBuffering
  putStr "Enter student name: "
  name <- getLine
  putStr "Enter number of test scores: "
  nStr <- getLine
  let n = read nStr :: Int
  scores <- mapM (\i -> do
                    putStr ("Score " ++ show i ++ ": ")
                    s <- getLine
                    return (read s :: Int))
                 [1..n]
  case average scores of
    Left err -> putStrLn ("Error: " ++ err)
    Right avg -> putStrLn (name ++ "'s average: " ++ show avg)
```

`validateScore` and `average` are **entirely pure** — no `IO` anywhere in either type signature, exactly like Capstone 3's `eval`. `average`'s do-notation over `Either` (Module 6) short-circuits automatically through `mapM validateScore scores`, the same mechanism that made Capstone 3's evaluator work — `mapM` here is applying `validateScore` across the whole list and combining every result, stopping at the first `Left` it hits. `main`'s own `do` block, by contrast, is genuinely sequencing real `IO` actions — reading a name, reading a count, reading that many scores in a loop (a nested `do` block inside the `mapM` lambda) — and only *at the very end* calls the pure `average` function on the collected, already-real data.

## Verification

**A successful run:**

```
$ printf "Ada\n3\n80\n90\n70\n" | ./capstone4
Enter student name: Enter number of test scores: Score 1: Score 2: Score 3: Ada's average: 80.0
```

Checked by hand: `(80 + 90 + 70) / 3 = 240 / 3 = 80.0`, matching exactly.

**A validation failure, caught by the pure logic, reported through IO:**

```
$ printf "Grace\n2\n95\n150\n" | ./capstone4
Enter student name: Enter number of test scores: Score 1: Score 2: Error: score over 100: 150
```

Verified directly: `150` fails `validateScore`'s `s > 100` check, `mapM` short-circuits `average` to `Left "score over 100: 150"`, and `main`'s `case` correctly reports it — the exact same `Left`-propagation mechanism Capstone 3's `eval` used, now validating real, interactively-typed input rather than a hand-constructed `Expr` tree.

> **The actual point of this capstone, tying directly back to Module 8's `seq` finding:** `average` never touches `IO` at all — it's fully pure, fully testable in isolation with plain lists of `Int`, with no need to simulate console input to verify its logic works correctly. This is *why* Haskell's strict separation between pure code and `IO` matters in practice, beyond the curiosity of Module 8's `seq` demonstration: `validateScore`/`average` can be tested, reasoned about, and reused with total confidence that they never performed a hidden side effect — a guarantee OCaml's Capstone 3 (`ocaml/09-capstone-stateful-simulation.md`), which mixed real mutation freely throughout, deliberately does not make.

> **Pitfall:** `read nStr :: Int` is a real, unguarded partial function — typing anything that isn't a valid integer at that prompt crashes the program with a runtime pattern-match failure, not a graceful `Either`-style error. This capstone's own `average` function handles *domain* validation (score ranges) correctly and safely; it does nothing to protect against malformed *input format* at the `read` boundary, a real, honest gap consistent with this guide's own standard of stating limitations precisely rather than glossing over them.

## Extending it yourself

- Wrap `read nStr :: Int` in a safer parse (`readMaybe` from `Text.Read`, returning `Maybe Int`) and handle a non-numeric input gracefully instead of crashing.
- Add a second validation rule (reject a name that's empty) to `average`'s pure logic, and confirm it's caught without touching any of `main`'s `IO` code.
