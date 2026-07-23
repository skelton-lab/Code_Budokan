# Module 2 — Reduction and Scan

By the end of this module you'll be able to collapse an array to a single value with reduction, produce a running sequence of partial results with scan, and control which axis of a multi-dimensional array an operation runs along. Feeds Capstone 1.

## Reduction: `/` folds an entire array into one value

**You'll be able to:** use `/` with different operators to sum, multiply, find the maximum, or find the minimum of an array — with no explicit accumulator variable written anywhere.

**Concept**

`operator/array` inserts `operator` between every pair of adjacent elements and evaluates the result — `+/1 2 3` is `1+2+3`. Any dyadic operator works this way: `×/` for product, `⌈/` for maximum, `⌊/` for minimum.

**Example**

```apl
+/1 2 3 4 5
×/1 2 3 4 5
⌈/3 7 2 9 4
⌊/3 7 2 9 4
```

```
15
120
9
2
```

Verified directly: `+/1 2 3 4 5 = 15`; `×/1 2 3 4 5 = 120` (which is `5!`, the factorial — reduction with `×` over `⍳n` is APL's factorial, with no dedicated factorial function needed); `⌈/` correctly picks out `9`, the maximum of `3 7 2 9 4`; `⌊/` picks out `2`, the minimum.

> **Pitfall:** every one of this series' earlier languages needed a named accumulator variable and an explicit loop for exactly this kind of computation — `WS-TOTAL`/`ADD ... TO` in COBOL, `fold-left` in Scheme, `reduce` in Clojure. `/` in APL isn't a convenience wrapper around a loop the way `fold-left` is (itself still a function call with an accumulator argument) — it's a direct, primitive language operator with no accumulator concept exposed anywhere in the syntax at all.

**Practice**

- Compute the factorial of `7` using `×/⍳7`, and confirm it matches `5040`.
- Predict, then verify, what `⌈/⍳1` (reduction over a single-element array) produces.

## Scan: `\` produces every partial result, not just the final one

**You'll be able to:** use `\` to produce a running sequence of partial reductions.

**Concept**

`operator\array` is reduction's close relative — instead of collapsing to one final value, it produces an array of the *same length*, where each position holds the reduction of everything up to and including that position. `+\` is a running total; `×\` is a running product.

**Example**

```apl
+\1 2 3 4 5
×\1 2 3 4 5
```

```
1 3 6 10 15
1 2 6 24 120
```

Verified directly: `+\1 2 3 4 5` produces `1, 1+2, 1+2+3, 1+2+3+4, 1+2+3+4+5` — the running total at every position, ending on the same `15` that `+/` alone would give as its single final answer. `×\` is the running product, ending on the same `120` `×/` computes.

> **Pitfall:** it's easy to think of scan as "reduction that also happens to keep intermediate results around for debugging" — but scan and reduction are two genuinely different, equally primitive operators (`\` and `/`), not one implemented in terms of the other. Scan's result is a real, useful array in its own right (a running balance, a cumulative distribution) — not a debugging byproduct.

**Practice**

- Compute `+\` over a list of daily temperature changes, and explain what the resulting array represents in context (hint: a running total of changes is a cumulative *value*, not a list of changes).

## Axis control: reducing along rows vs. columns

**You'll be able to:** control which axis a reduction operates along, for a multi-dimensional array.

**Concept**

For a matrix, plain `/` reduces along the *last* axis (each row collapses to one value); `⌿` reduces along the *first* axis (each column collapses to one value) — two distinct symbols, not a parameter to one.

**Example**

```apl
m←2 3⍴⍳6
+/m
+⌿m
```

```
6 15
5 7 9
```

Verified directly, against `m`'s known layout (`1 2 3` / `4 5 6`): `+/m` gives `6 15` — each *row* summed (`1+2+3=6`, `4+5+6=15`). `+⌿m` gives `5 7 9` — each *column* summed (`1+4=5`, `2+5=7`, `3+6=9`). Same operator (`+`), same matrix, genuinely different results depending on which of the two reduction symbols is used.

> **Pitfall:** `/` and `⌿` are visually similar (one a horizontal-leaning stroke, one vertical) and easy to swap by mistake — swapping them silently changes *which axis* gets collapsed, producing a differently-shaped, differently-valued, but still plausible-looking result, not an error.

**Practice**

- Build a 3×4 matrix from `⍳12`, and compute both its row sums (`+/`) and column sums (`+⌿`) — confirm both by hand against the matrix's actual layout.

## Progress check

1. What does `+/1 2 3 4 5` compute, and what's the shape of its result?
2. Why is `×/⍳n` APL's factorial, with no dedicated factorial function needed?
3. What's the actual difference between what `/` and `\` each produce?
4. For a matrix, what's the difference between `+/` and `+⌿`?
5. Why does this module claim `/` isn't "a convenience wrapper around a loop," unlike Scheme's `fold-left`?

### Answers

1. `15`, the sum of all five elements — the result of a reduction over a vector is always a single scalar value.
2. Because `×/⍳n` inserts `×` between every element of `1 2 ... n`, computing `1×2×3×...×n`, which is the mathematical definition of `n!` — no special-purpose factorial operator is needed since reduction with multiplication already expresses it directly.
3. `/` (reduction) collapses an entire array down to one final value; `\` (scan) produces an array of the same length as the input, holding the running/cumulative reduction at every position.
4. `+/` reduces along the last axis, collapsing each row to a single sum; `+⌿` reduces along the first axis, collapsing each column to a single sum — the same operator, genuinely different results depending on which reduction symbol is used.
5. Because `/` is a primitive language operator with no accumulator variable exposed anywhere in the syntax at all — `fold-left` is still an ordinary function call taking an explicit accumulator argument, just one abstraction layer removed from a hand-written loop, whereas APL's `/` has no such underlying loop-with-accumulator structure exposed in its own syntax.
