# Module 2 — Exact Numbers

By the end of this module you'll be able to distinguish exact from inexact numbers, use exact rationals to keep arithmetic precise, and explain — with a direct, verified comparison — why this is a genuine design choice rather than a curiosity. Feeds Capstone 1, where differentiation results stay exact throughout.

## The numeric tower: exact rationals and arbitrary-precision integers

**You'll be able to:** perform exact rational arithmetic, and confirm a result stays exact through multiple operations.

**Concept**

Scheme's numeric types form a "tower" — integers, rationals, reals, complex — and, distinctively, integers and rationals are **exact** by default: `1/3` isn't an approximation, it's stored as the precise ratio of two arbitrary-precision integers. Arithmetic between exact numbers stays exact; a literal written with a decimal point (`0.1`) is **inexact** (an ordinary floating-point number) from the moment it's written.

**Example**

```scheme
(display (/ 1 3)) (newline)
(display (exact? (/ 1 3))) (newline)
(display (+ (/ 1 3) (/ 1 6))) (newline)
(display (* 1000000000000 1000000000000)) (newline)
(display (exact? (* 1000000000000 1000000000000))) (newline)
```

```
1/3
#t
1/2
1000000000000000000000000
#t
```

Verified directly: `1/3` stays a genuine rational value, not a decimal approximation; `1/3 + 1/6` computes to exactly `1/2`, not `.49999999999999994` or similar; and multiplying two 13-digit integers produces an exact 25-digit result — Scheme's integers are arbitrary-precision by default, with no silent overflow into a fixed-width type at all, a different but related guarantee to exact rationals.

> **Pitfall:** exact arithmetic isn't free of *representation* concerns even though it avoids float error — a rational like `1/3` printed and re-parsed is still `1/3`, but computing with very large numerators/denominators (repeated addition of ever-smaller fractions, say) can grow the internal representation unboundedly, a genuine performance consideration exact rationals trade for their precision guarantee.

**Practice**

- Compute `1/7 + 2/7` and confirm the result is the fully-reduced exact fraction, not `3/7` left unreduced or converted to a decimal.
- Multiply two 20-digit integers and confirm the exact result, with no overflow.

## Exact vs. inexact, verified side by side against this series' own running thread

**You'll be able to:** convert explicitly between exact and inexact numbers, and state precisely when each is appropriate.

**Concept**

`exact->inexact` and `inexact->exact` convert deliberately; comparisons (`=`) work across the exact/inexact boundary. This series has a running thread on numeric-precision design choices — COBOL's fixed-decimal `PIC` fields (verified exact for money, `cobol/02-arithmetic-picture-clauses.md`) and Python's `float`/NumPy behavior (verified inexact, `python/08-numpy-vectorization.md`) are two ends of the same underlying question. Scheme is unusual among this series' languages in offering *both*, explicitly, as a real choice the programmer states rather than the language deciding for them.

**Example**

```scheme
(display (+ 0.1 0.2)) (newline)
(display (exact? 0.1)) (newline)
(display (exact->inexact (/ 1 3))) (newline)
(display (inexact->exact 0.5)) (newline)
(display (= 1/2 0.5)) (newline)
```

```
.30000000000000004
#f
.3333333333333333
1/2
#t
```

Verified directly, and worth stating precisely: `(+ 0.1 0.2)` in MIT Scheme produces the *identical* `.30000000000000004` this series already found in Python, JavaScript, Ruby, and C's `double` — because `0.1` written as a literal is inexact from the start, the same IEEE 754 binary64 representation every one of those languages uses. This isn't a Scheme deficiency; it's a demonstration that the exact/inexact distinction is a real, explicit choice in Scheme's design, not an accident of "some languages have float bugs and some don't." `(inexact->exact 0.5)` converts cleanly to `1/2` because `0.5` happens to have an exact binary representation; `1/3` computed as a float and converted back would *not* recover the exact `1/3` — the imprecision, once introduced, doesn't un-happen.

> **Pitfall:** `(= 1/2 0.5)` returning `#t` shows numeric comparison working correctly across the exact/inexact boundary — but this doesn't mean exactness is preserved through such a comparison; the moment any operand in a computation is inexact, the *result* of arithmetic involving it becomes inexact too, contagiously.

**Practice**

- Predict, then verify, whether `(exact->inexact 1/3)` converted back with `inexact->exact` recovers the original `1/3` exactly.
- Compute `(+ 1/3 0.1)` and confirm whether the result is exact or inexact — explain why, in terms of the "contagion" rule above.

## Progress check

1. What makes `1/3` different from `0.333...` as Scheme represents them?
2. What happened when two 13-digit integers were multiplied together in this module's own verified example?
3. Why did `(+ 0.1 0.2)` produce the same `.30000000000000004` result this series already found in Python and other languages?
4. What does `inexact->exact` do, and when does it fail to recover a "clean" value?
5. If one operand in an arithmetic expression is inexact, what happens to the result, even if every other operand is exact?

### Answers

1. `1/3` is stored as an exact ratio of two arbitrary-precision integers, with no approximation at all; `0.333...` as a literal would be an inexact, IEEE 754 floating-point approximation from the moment it's written.
2. The multiplication produced an exact 25-digit result with no overflow — Scheme's integers are arbitrary-precision by default, distinct from but related to the exact-rational guarantee.
3. Because a literal like `0.1` is inexact in Scheme too — it uses the same IEEE 754 binary64 representation as Python, JavaScript, Ruby, and C's `double`, which cannot represent `0.1` or `0.2` exactly in binary.
4. It converts an inexact number to the nearest exact rational; it "fails" to recover the original intended value whenever that inexact number was already an approximation of something that had no exact binary representation to begin with (like `1/3` computed as a float).
5. The result becomes inexact too — inexactness is contagious through arithmetic; mixing even one inexact operand into an otherwise-exact computation gives up the exactness guarantee for that result.
