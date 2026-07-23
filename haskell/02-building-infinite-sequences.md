# Module 2 — Building Infinite Sequences

By the end of this module you'll be able to build genuinely infinite, self-referential sequences using `zipWith` and recursive list comprehensions — real, practical uses of Module 1's laziness, not just a toy demonstration. Feeds Capstone 1.

## Fibonacci, defined self-referentially with `zipWith`

**You'll be able to:** build an infinite Fibonacci sequence that refers to itself in its own definition.

**Concept**

`zipWith f xs ys` combines two lists elementwise with `f`, stopping at the shorter list's length (or never stopping, for two infinite lists). Combined with self-reference, this produces the classic, elegant Haskell definition of the Fibonacci sequence: each term is the sum of the *same sequence*, shifted by one position.

**Example**

```haskell
let fibs = 0 : 1 : zipWith (+) fibs (tail fibs)
print (take 10 fibs)
```

```
[0,1,1,2,3,5,8,13,21,34]
```

Verified directly: the first ten Fibonacci numbers, computed correctly by a definition that refers to `fibs` *inside its own definition* — `zipWith (+) fibs (tail fibs)` pairs each element of `fibs` with the *next* element of `fibs`, summing them to produce the element after that. This only works at all because of Module 1's laziness: `fibs` doesn't need to be "already computed" to refer to itself, since each new element only demands *earlier*, already-available elements of the same list.

> **Pitfall:** this compiles with a real warning about `tail` being a "partial function" (it throws an error on an empty list) — a genuine, honest limitation: `tail`'s type doesn't statically guarantee the list it's given is non-empty, so calling it on `[]` is a runtime crash the type system doesn't prevent. `fibs`'s own definition is safe because `0 : 1 : ...` guarantees at least two elements always exist before `tail` is ever reached, but this is a fact about *this specific code*, not something the type checker verified.

**Practice**

- Compute `take 15 fibs` and confirm the 15th Fibonacci number matches a value you compute independently by hand or with a calculator.

## The sieve of Eratosthenes, lazily

**You'll be able to:** build an infinite list of prime numbers using a genuinely self-filtering recursive definition.

**Concept**

The classic sieve algorithm — take the first number, filter out its multiples from everything after it, repeat — translates directly into a recursive Haskell definition over `[2..]` (an infinite list starting at 2), made possible entirely by laziness: the filtering step for a later prime doesn't need to happen until that far into the sequence is actually demanded.

**Example**

```haskell
primes :: [Int]
primes = sieve [2..]
  where sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0]

main :: IO ()
main = print (take 10 primes)
```

```
[2,3,5,7,11,13,17,19,23,29]
```

Verified directly: the first ten prime numbers, correct against the well-known sequence. `sieve` recurses on an ever-more-filtered version of the *remaining* infinite list — `[x | x <- xs, x `mod` p /= 0]` is a list comprehension (filter every element of `xs` not divisible by `p`), itself lazily constructed, so no more filtering happens at any point than is actually needed to produce however many primes `take` ends up asking for.

> **Pitfall:** this is a genuinely elegant definition, but not the fastest real sieve algorithm — it's a trial-division-based filter chain, not the array-based, mutation-heavy sieve most textbooks present as "the" sieve of Eratosthenes for performance. A production-quality Haskell prime sieve looks meaningfully different; this version is chosen specifically because its self-referential, lazy structure is the actual teaching point here, not raw speed.

**Practice**

- Compute `take 20 primes` and spot-check a few values against a known prime table.
- Explain, in your own words, why `sieve` genuinely never needs to "finish" filtering the entire infinite list before producing its first several output primes.

## Progress check

1. What does `zipWith (+) fibs (tail fibs)` compute, at each position, in terms of `fibs` itself?
2. Why is `tail` described as a "partial function," and why is `fibs`'s own use of it still safe?
3. What does `sieve`'s recursive structure do to the "remaining" list at each step?
4. Why doesn't `sieve [2..]` need to filter the entire infinite list before `take 10 primes` can produce a result?
5. What's the honest limitation this module states about its own sieve implementation?

### Answers

1. It computes, at each position, the sum of the current element and the next element of the *same* sequence — which is exactly the Fibonacci recurrence, expressed as a self-referential list definition rather than an explicit recursive function call.
2. Because `tail` throws a runtime error if given an empty list, and its type signature doesn't statically rule that out — it's "partial" in the sense of not being defined for every possible input of its type. `fibs`'s definition is safe because `0 : 1 : ...` guarantees at least two elements always exist before `tail fibs` is evaluated, a fact true of this specific code, not enforced by the type checker.
3. It filters out every multiple of the current prime `p` from the rest of the list, producing a new, lazily-constructed filtered list to recurse on for finding the next prime.
4. Because the filtering at each step is itself lazy — only as much of the filtered list as `take 10` actually ends up demanding gets computed, not the entire (impossible-to-fully-compute) infinite filtered sequence.
5. That it's a trial-division-based filter chain, not the array-based, mutation-heavy sieve most textbooks use for actual performance — chosen here specifically for its self-referential, lazy structure as a teaching example, not for speed.
