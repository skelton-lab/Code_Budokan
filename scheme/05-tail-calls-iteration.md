# Module 5 — Proper Tail Calls & Iteration

By the end of this module you'll be able to write iteration using named-`let` and `do`, and explain — with a direct, verified demonstration — why "proper tail calls" is a semantic guarantee of the Scheme standard, not an optional optimization a compiler might happen to apply. Feeds Capstone 2.

## Named-`let` and `do`: iteration as recursion in disguise

**You'll be able to:** write a counted loop using named-`let`, and the same loop using `do`.

**Concept**

Scheme has no dedicated `for`/`while` keyword the way most of this series' other languages do — `let` bound to a name (`(let loop (...) body)`) creates a locally-scoped recursive procedure and calls it immediately, giving you a loop built entirely from ordinary procedure calls. `do` is a slightly more compact, purpose-built iteration form covering the same territory.

**Example**

```scheme
(define (sum-to-named n)
  (let loop ((i 1) (acc 0))
    (if (> i n) acc (loop (+ i 1) (+ acc i)))))
(display (sum-to-named 100)) (newline)

(define (sum-to-do n)
  (do ((i 1 (+ i 1)) (acc 0 (+ acc i)))
      ((> i n) acc)))
(display (sum-to-do 100)) (newline)
```

```
5050
5050
```

Verified directly: both forms correctly sum `1` through `100` to `5050`. `loop` in the named-`let` version is a real, ordinary procedure — `(loop (+ i 1) (+ acc i))` is a genuine recursive call, not special loop syntax; the only thing distinguishing it from any other recursive procedure Module 1 wrote is that it's defined and called in one expression, scoped locally to `sum-to-named`.

> **Pitfall:** `do`'s clause order (`(variable init step)`) is easy to misread as `(variable step init)` at a glance — a variable's step expression runs on every iteration *after* the current one, computing the next value from the current bindings, not the other way around.

**Practice**

- Rewrite `sum-to-named` to compute a running product (factorial) instead of a sum, using named-`let`.
- Rewrite the same computation using `do`, and confirm both give identical results for the same input.

## Why proper tail calls are a guarantee, not an optimization

**You'll be able to:** state precisely what a "tail call" is, and demonstrate — with real, measured evidence — why Scheme's guarantee of proper tail calls matters.

**Concept**

A call is in **tail position** if it's the very last thing a procedure does — nothing left to compute after it returns. The Scheme standard *requires* every conforming implementation to execute a tail call without growing the call stack, treating it as equivalent to a jump rather than a nested call. This is a semantic guarantee every conforming Scheme must honor — contrast this with most other languages, where "the compiler might turn this recursive call into a loop" is a best-effort optimization, not something the language specification promises.

**Example — the contrast, verified directly rather than asserted:**

```scheme
; tail-recursive: the recursive call is the LAST thing this does
(define (sum-to-tail n acc)
  (if (> n 0) (sum-to-tail (- n 1) (+ acc n)) acc))
(display (sum-to-tail 10000000 0)) (newline)
```

```
50000005000000
```

```scheme
; naive: (+ n ...) happens AFTER the recursive call returns —
; the call is NOT in tail position
(define (sum-to-naive n)
  (if (= n 0) 0 (+ n (sum-to-naive (- n 1)))))
(display (sum-to-naive 10000000)) (newline)
```

```
;Aborting!: maximum recursion depth exceeded
```

Verified directly, at identical depth (10,000,000): the tail-recursive version computes the correct sum (`50000005000000`, matching `n(n+1)/2` for `n=10000000`) with no stack growth at all — MIT Scheme's runtime literally never allocates a deeper stack frame for it, because the call to `sum-to-tail` is the last thing `sum-to-tail` does. The naive version, whose recursive call is *not* in tail position (`+` still has to run *after* the recursive call returns, so a frame must be kept alive to hold that pending `+`), aborts outright at the same depth. Same algorithm, same depth, same machine — the only difference is where the recursive call sits in its own procedure.

> **Pitfall:** rewriting a naive recursive function to be tail-recursive almost always means adding an accumulator parameter (`acc` above) that carries the partial result forward, rather than building the result up on the way back out of the recursion. This is a real, worthwhile rewrite discipline, not a syntactic trick — it changes what the function is actually doing computationally, from "wait for the recursive call, then combine" to "combine now, then recurse."

**Practice**

- Rewrite `sum-to-naive` to be tail-recursive using an accumulator, and confirm it handles the same 10,000,000 depth without aborting.
- Explain, in your own words, why `(+ n (sum-to-naive (- n 1)))`'s call to `sum-to-naive` is not in tail position, but `(sum-to-tail (- n 1) (+ acc n))`'s call to `sum-to-tail` is.

## Progress check

1. What makes named-`let`'s `loop` a genuine procedure rather than special loop syntax?
2. In `do`'s binding clause `(i 1 (+ i 1))`, what does each of the three parts mean?
3. What exactly defines whether a call is "in tail position"?
4. What did this module's own verified test show about a tail-recursive and a naive-recursive function computing the same sum, at the same depth?
5. What's the standard technique for converting a naive recursive function into a tail-recursive one?

### Answers

1. It's created and called with ordinary `let`/procedure-call machinery — the only thing special about it is that it's named and scoped locally, letting it call itself recursively by that name.
2. `i` is the variable name, `1` is its initial value, `(+ i 1)` is the expression computing its value for the *next* iteration, evaluated from the current bindings.
3. It's the last expression evaluated in a procedure body — nothing else needs to happen after it returns; if any computation (like an addition) still needs to happen with its result, it isn't in tail position.
4. The tail-recursive version correctly computed the sum at 10,000,000 depth with no stack growth; the naive version aborted with "maximum recursion depth exceeded" at the identical depth — the same algorithm, differing only in whether the recursive call was the last thing done.
5. Adding an accumulator parameter that carries the partial result forward through each call, so the recursive call becomes the very last thing the function does, with no pending operation left to perform on its result afterward.
