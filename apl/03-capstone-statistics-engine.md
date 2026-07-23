# Capstone 1 — A Statistics Engine, No Loops

Combines every concept from Modules 1–2: mean, variance, and standard deviation over a real ten-value dataset, computed entirely with `+/`, `÷`, `≢`, and scalar extension — no explicit loop, no accumulator variable, anywhere in the code.

## The computation

```apl
data←23 45 12 67 34 89 21 56 43 78

mean←(+/data)÷≢data
deviations←data-mean
sq←deviations*2
variance←(+/sq)÷≢data
stddev←variance*0.5
```

Five lines. `≢data` (tally) counts the elements. `mean` sums and divides by the count — one expression. `deviations←data-mean` subtracts the *scalar* `mean` from *every* element of `data` at once, via the same scalar extension Module 1 demonstrated — there's no per-element loop computing "this value minus the mean" one at a time. `sq←deviations*2` squares every deviation, again elementwise, in one expression. `variance*0.5` computes the square root via the power operator (`*` with an exponent of `0.5`) — GNU APL has no dedicated square-root symbol; this is the idiomatic way to express it.

## Verification

```
$ LC_ALL=en_US.UTF-8 apl -s --safe -f capstone1.apl
≢data:     10
+/data:    468
mean:      46.8
deviations: ¯23.8 ¯1.8 ¯34.8 20.2 ¯12.8 42.2 ¯25.8 9.2 ¯3.8 31.2
sq:        566.44 3.24 1211.04 408.04 163.84 1780.84 665.64 84.64 14.44 973.44
variance:  587.16
stddev:    24.23138461
```

Checked by hand, every step: `468 ÷ 10 = 46.8` for the mean. Each deviation matches `value - 46.8` exactly (`23 - 46.8 = ¯23.8`, `78 - 46.8 = 31.2`, and every value in between). Each squared deviation matches its own deviation squared (`¯23.8² = 566.44`, `31.2² = 973.44`). The sum of all ten squared deviations is `5871.6`, divided by `10` gives `587.16` for the variance — and `587.16^0.5 ≈ 24.231`, matching the displayed `stddev` to the precision shown.

> **The actual point of this capstone:** every one of this series' earlier languages would need at minimum one explicit loop (to sum, or to compute deviations one at a time) somewhere in this computation — even Python's NumPy, the closest analogue, is calling into a library implementing whole-array operations that this guide's `python/08-numpy-vectorization.md` covered as a *feature of a library*. Here, there's no library to call into — whole-array subtraction, squaring, and reduction are the language's own primitive operators, exactly as fundamental as `+` and `-` themselves.

> **Pitfall:** `variance*0.5` for a square root works because `*` is APL's power/exponentiation operator (not multiplication — that's `×`), and `0.5`-th power is mathematically a square root. Confusing `*` (power) with `×` (multiply) — two visually distinct but easy-to-conflate symbols — would produce a completely different, silently wrong number rather than an error.

## Extending it yourself

- Add a second dataset and compute both datasets' means and standard deviations side by side, still with no explicit loop over "which dataset."
- Compute the [z-score](https://en.wikipedia.org/wiki/Standard_score) of every value in `data` (each deviation divided by the standard deviation) in one more line, reusing `deviations` and `stddev` directly.
