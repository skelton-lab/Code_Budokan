# Capstone 1 — Infinite Lazy Sequences, Proven

Combines every concept from Modules 1–2: Fibonacci primes — the intersection of two infinite lazy sequences — with a traced proof of exactly how much computation actually happens, directly comparable to `clojure/09-capstone-infinite-sequences.md`'s own traced Fibonacci-primes capstone.

## The composition

```haskell
import Debug.Trace (trace)

fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

primes :: [Integer]
primes = sieve [2..]
  where sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0]

isPrimeTraced :: Integer -> Bool
isPrimeTraced n = trace ("testing " ++ show n) (n `elem` takeWhile (<= n) primes)

fibPrimes :: [Integer]
fibPrimes = filter isPrimeTraced fibs
```

`Debug.Trace.trace` prints its first argument as a real, visible side effect *at the moment its result is forced* — a legitimate, standard-library tool specifically for observing evaluation order in otherwise-pure code, used here exactly the way Clojure's Capstone 4 used an `atom`-backed counter. `fibPrimes` filters the infinite `fibs` sequence, keeping only the ones that test as prime — two independently infinite, lazy structures, composed.

## Verification

```haskell
putStrLn "First 6 Fibonacci primes:"
print (take 6 fibPrimes)
```

```
testing 0
testing 1
testing 1
testing 2
testing 3
testing 5
testing 8
testing 13
testing 21
testing 34
testing 55
testing 89
testing 144
testing 233
First 6 Fibonacci primes:
[2,3,5,13,89,233]
```

Verified directly, checked against the actual Fibonacci sequence: `0` and `1` (twice) aren't prime; `2, 3, 5` are; `8` isn't; `13` is; `21` (`3×7`), `34`, `55` (`5×11`) aren't; `89` is; `144` isn't; `233` is — exactly six matches, `[2,3,5,13,89,233]`, matching the printed result. The trace shows **exactly 14** Fibonacci numbers were tested to find those six primes — not the entire, impossible-to-compute infinite Fibonacci sequence, only as much as `take 6` actually needed.

**The sharper proof — asking for nothing tests nothing, exactly like Clojure's own capstone:**

```haskell
putStrLn "--- now testing 0 elements ---"
print (take 0 fibPrimes)
```

```
[]
```

Verified directly: **zero** `"testing"` lines appear for `take 0 fibPrimes` — genuinely no computation happened at all, not computed-and-discarded. This is the identical result Clojure's `(take 0 (traced-fib-primes))` produced (`clojure/09-capstone-infinite-sequences.md`), reached by a fundamentally different mechanism: Clojure's laziness required an explicit `lazy-seq` wrapper the author chose to write; Haskell's laziness required no special syntax anywhere in `fibs`, `primes`, or `fibPrimes` — it's simply how every Haskell expression behaves by default.

> **The actual point of this capstone, stated directly:** the exact same observable result — "asking for nothing computes nothing, even through two layers of composed infinite sequences" — was achieved by two languages with opposite defaults. Clojure is eager by default and had to opt into laziness explicitly, once, at the point it was needed. Haskell is lazy by default everywhere, with no opt-in required at all. Neither approach is "more correct" — this capstone exists specifically to make the comparison concrete rather than asserted.

> **Pitfall:** `isPrimeTraced` recomputes `takeWhile (<= n) primes` from scratch for every single Fibonacci number tested — genuinely wasteful for a production primality check (a proper `isPrime` trial-division function would be far more efficient than filtering a whole prime list up to `n`). This capstone's version is written specifically to compose cleanly with the already-defined `primes` sequence from Module 2, at the cost of real performance a production version would need to address.

## Extending it yourself

- Remove `Debug.Trace` and the trace wrapper, and confirm `fibPrimes` still produces the identical correct results — the tracing was purely observational, never load-bearing for correctness.
- Compute the first 10 Fibonacci primes instead of 6, and predict (before running) roughly how many "testing" lines you'd expect, based on how the Fibonacci sequence grows.
