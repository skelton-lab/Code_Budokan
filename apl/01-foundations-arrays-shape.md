# Module 1 — Foundations: Arrays, Shape, and Whole-Array Operations

By the end of this module you'll be able to generate and inspect arrays, and perform arithmetic on entire arrays at once with no explicit loop anywhere in the code. Feeds Capstone 1.

## `⍳` (iota) and `⍴` (shape)

**You'll be able to:** generate a sequence with `⍳`, and inspect any array's shape with `⍴`.

**Concept**

`⍳n` (iota) generates the vector `1 2 ... n`. `⍴array` (monadic, "shape of") returns an array's dimensions — a scalar for a 1-dimensional vector's length, a vector of dimension sizes for anything with more structure.

**Example**

```apl
⍳5
⍴⍳5
```

```
1 2 3 4 5
5
```

Verified directly: `⍳5` produces the five-element vector `1 2 3 4 5`; `⍴` on that vector correctly reports `5`, its length.

> **Pitfall:** negative numbers in APL use a distinct glyph, `¯` (high minus), not the ordinary `-` used for subtraction — `¯5` is the literal negative five; `3-10` is the subtraction expression evaluating to `¯7`. Confusing the two is a genuinely common early mistake, since they look almost identical.

**Practice**

- Generate `⍳10` and confirm its shape is `10`.
- Predict, then verify, what `¯3` alone (as a bare literal, not a subtraction) displays as.

## Whole-array arithmetic: no loop, ever

**You'll be able to:** apply an arithmetic operator across two entire arrays at once, and explain what happens when one operand is a single scalar.

**Concept**

Every arithmetic operator in APL applies **elementwise** across arrays of matching shape, with no loop written anywhere — this is the language's actual core design, not a library feature bolted on. A **scalar** (single value) automatically extends across every element of the other operand — "scalar extension," the same instinct behind NumPy's own broadcasting, decades later.

**Example**

```apl
1 2 3+10 20 30
2×1 2 3 4 5
```

```
11 22 33
2 4 6 8 10
```

Verified directly: `1 2 3+10 20 30` adds elementwise — `1+10`, `2+20`, `3+30` — with no explicit iteration written, ever. `2×1 2 3 4 5` scalar-extends the `2`, multiplying every element of the five-element vector by it in one expression.

> **Pitfall:** this series' `python/08-numpy-vectorization.md` covers the identical instinct — whole-array operations without an explicit Python `for` loop — as NumPy's own defining feature. Worth stating precisely: APL isn't "like NumPy" as a coincidence; NumPy's whole design lineage (whole-array ops, broadcasting) traces back through decades of array-language influence to exactly this 1962 idea, made concrete and directly runnable here.

**Practice**

- Compute the elementwise product of two five-element vectors, with no loop.
- Predict, then verify, what `10×⍳5` produces.

## Multi-dimensional arrays: reshape with `⍴`

**You'll be able to:** use `⍴` dyadically to reshape a vector into a matrix (or higher-dimensional array), and inspect the result's own shape.

**Concept**

`⍴` used dyadically (`shape⍴data`) reshapes `data` into an array with the given `shape` — the same symbol as monadic "shape of," now used to *construct* rather than *inspect*, reading its data left-to-right, row-major.

**Example**

```apl
2 3⍴⍳6
⍴2 3⍴⍳6
```

```
1 2 3
4 5 6
2 3
```

Verified directly: `2 3⍴⍳6` reshapes the six-element vector `1 2 3 4 5 6` into a 2-row, 3-column matrix, filling row-major (`1 2 3` first, then `4 5 6`). `⍴` on that matrix correctly reports its own shape back: `2 3`.

> **Pitfall:** `⍴` reads the *same symbol*, monadic or dyadic, meaning genuinely different things ("what shape is this" vs. "reshape this into that") — this dual monadic/dyadic-meaning pattern is pervasive throughout APL's whole symbol set, not a one-off quirk of `⍴` specifically.

**Practice**

- Reshape `⍳12` into a 3×4 matrix, and confirm its `⍴` reports `3 4`.
- Reshape `⍳12` into a 2×2×3 (three-dimensional) array, and inspect its shape.

## Progress check

1. What does `⍳5` generate?
2. What's the difference between `¯5` and `3-8`'s result, syntactically and by meaning?
3. What does "scalar extension" mean, concretely, for `2×1 2 3 4 5`?
4. What's the difference between `⍴` used monadically versus dyadically?
5. What real, direct connection does this module draw to `python/08-numpy-vectorization.md`?

### Answers

1. The five-element vector `1 2 3 4 5`.
2. `¯5` is a literal negative number, using the dedicated high-minus glyph; `3-8`'s result (`¯7`) is computed by the subtraction operator `-`, but is *displayed* using the same `¯` glyph for negative values — the glyph is about how negative values are written/shown, while `-` specifically means "subtract."
3. The single scalar `2` is applied to every element of the five-element vector automatically, with no explicit repetition written — `2×1 2 3 4 5` computes `2×1, 2×2, 2×3, 2×4, 2×5` in one expression.
4. Monadic `⍴array` inspects and returns an array's existing shape; dyadic `shape⍴data` constructs a new array, reshaping `data` into the given `shape`.
5. That NumPy's own whole-array operations and broadcasting — no explicit Python loop needed for elementwise arithmetic — are a direct descendant of exactly the array-oriented design this module demonstrates, decades earlier and built into the language itself rather than a library.
