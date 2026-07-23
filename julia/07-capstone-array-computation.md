# Capstone 3 — Array-Oriented Computation with Broadcasting

Combines every concept from Module 6: mean, variance, standard deviation, and z-scores over the *exact same* ten-value dataset `apl/03-capstone-statistics-engine.md` used — verified to produce identical results, closing the loop this series opened with APL's 1962-era whole-array design and continued through NumPy's library-level version of the same idea.

## The computation

```julia
data = [23.0, 45.0, 12.0, 67.0, 34.0, 89.0, 21.0, 56.0, 43.0, 78.0]

n = length(data)
mean_val = sum(data) / n
deviations = data .- mean_val
sq = deviations .^ 2
variance = sum(sq) / n
stddev = sqrt(variance)

z_scores = deviations ./ stddev
```

Every line is a whole-array operation: `data .- mean_val` subtracts the scalar `mean_val` from every element at once (scalar broadcast); `deviations .^ 2` squares every element; `deviations ./ stddev` computes every z-score in one expression, reusing both `deviations` and `stddev` from the lines above it — no explicit loop anywhere in this computation.

## Verification

```
n = 10
mean = 46.8
variance = 587.1600000000001
stddev = 24.23138460757041
```

Checked directly against `apl/03-capstone-statistics-engine.md`'s own verified result for the identical dataset: **mean `46.8`, variance `587.16`, standard deviation `≈24.231`** — matching exactly, computed independently in two genuinely different languages, one from 1962 and one from 2012, using the same underlying whole-array-operation instinct in each. The tiny floating-point noise visible in the raw `deviations` output (`-23.799999999999997` rather than a clean `-23.8`) is the same IEEE 754 binary-float representation limit this series has now verified directly in COBOL, Scheme, and Clojure — a fifth independent confirmation of the identical, well-understood class of imprecision, not a bug specific to this capstone.

```julia
z_scores = deviations ./ stddev
```

```
[-0.9821972778462013, -0.07428382773626721, -1.4361540029011683, ...]
```

Verified by spot-checking one value by hand: the first z-score, `-23.8 / 24.231... ≈ -0.982`, matches the computed `-0.9821972778462013` to the precision shown — confirming the broadcast division correctly paired each element of `deviations` with the single scalar `stddev`.

> **The actual point of this capstone, closing a three-way loop:** `apl/01-foundations-arrays-shape.md` established that whole-array operations without an explicit loop are the *language's own core design*, from 1962. `python/08-numpy-vectorization.md` showed the identical instinct realized as a *library* layered onto an otherwise ordinary, loop-capable language. This capstone shows a *third* point on that spectrum: Julia's broadcasting is neither APL's "every operator is elementwise, no marker needed" nor a library bolted onto the language — it's a real, dedicated language feature (the `.` syntax) that's opt-in and visible at every call site, syntactically distinct from an ordinary scalar operation, while still compiling down to genuinely fast, specialized machine code via the same JIT and type-stability story Module 4/Capstone 2 verified directly.

> **Pitfall:** `sqrt(variance)` (no dot) is correct here because `variance` is a single scalar value, not an array — broadcasting's `.` is only needed when the *operation itself* needs to apply across multiple elements; calling a function on a genuine scalar never needs one.

## Extending it yourself

- Compute the same statistics for a second dataset, and use broadcasting to compare the two datasets' z-scores element-by-element in one expression.
- Rewrite this capstone's computation using explicit `for` loops instead of broadcasting, and use `Base.return_types`/`@elapsed` (Module 4) to compare its type stability and measured performance against the broadcast version.
