# Module 8 — NumPy and Vectorization

The foundation both PyTorch's tensor API (Module 9) and this guide's own performance claims are built on: NumPy arrays, broadcasting, a real measured speedup over a naive Python loop — and a genuine, silent correctness bug this guide caught live while measuring it, kept in exactly per this series' tradition of real bugs found during verification. Every number below is a real, measured `uv run python3` execution. Feeds Capstone 3.

## Vectorization: a measured speedup, not a claimed one

**You'll be able to:** explain why a vectorized NumPy operation outperforms an equivalent Python loop, with real numbers.

**Concept**

A Python `for` loop processes one element at a time, with the interpreter's per-element overhead (bytecode dispatch, dynamic type checking) paid on every single iteration. A NumPy array operation (`array * array`) runs the entire computation in compiled C code over contiguous memory, paying that interpreter overhead exactly once for the whole array, not once per element. This is **vectorization** — expressing a computation as one operation over a whole array instead of an explicit loop.

**Example**

```python
import time
import numpy as np

N = 5_000_000
python_list = list(range(N))

start = time.perf_counter()
result_loop = []
for x in python_list:
    result_loop.append(x * x + 1)
loop_time = time.perf_counter() - start

np_array = np.arange(N)
start = time.perf_counter()
result_np = np_array * np_array + 1
np_time = time.perf_counter() - start

print(f"loop: {loop_time:.6f}s, numpy: {np_time:.6f}s, speedup: {loop_time / np_time:.1f}x")
```

Verified output: `loop: 0.248663s, numpy: 0.019425s, speedup: 12.8x` — the identical computation (`x*x + 1` for 5 million values), roughly **13× faster** vectorized, measured on the same machine, back to back, with matching results confirmed for a sample of elements.

**Practice**

- Rerun this comparison with a list comprehension (`[x*x+1 for x in python_list]`) instead of the explicit `for`/`.append()` loop, and confirm the speedup shrinks (Python's list comprehensions are genuinely faster than manual `.append()` loops, though still slower than vectorized NumPy) — by roughly how much?

## Broadcasting: operating on arrays of different shapes

**You'll be able to:** predict when NumPy will broadcast two differently-shaped arrays together, and when it will correctly refuse to.

**Concept**

**Broadcasting** lets NumPy apply an operation between arrays of different shapes by implicitly expanding the smaller one, following a precise, documented rule (compare shapes from the trailing dimension; dimensions must match, or one of them must be `1`) — not silently guessing, and not silently succeeding on genuinely incompatible shapes.

**Example**

```python
a = np.array([[1, 2, 3], [4, 5, 6]])   # shape (2, 3)
b = np.array([10, 20, 30])              # shape (3,)
print(a + b)
```

Verified output:

```
[[11 22 33]
 [14 25 36]]
```

`b`'s shape `(3,)` broadcasts against `a`'s trailing dimension (also `3`) — `b` is conceptually repeated for each of `a`'s two rows, without actually copying it in memory.

```python
c = np.array([1, 2])   # shape (2,)
a + c
```

Verified: `ValueError: operands could not be broadcast together with shapes (2,3) (2,)` — `c`'s shape doesn't match `a`'s trailing dimension (`2 ≠ 3`), and NumPy correctly refuses rather than guessing which axis was intended.

**Practice**

- Predict, then verify, whether `a + np.array([[10], [20]])` (shape `(2, 1)`) broadcasts successfully against `a` (shape `(2, 3)`), and if so, what each of the two rows gets added.

## A real, silent overflow bug — caught while measuring this exact module

**You'll be able to:** explain why NumPy's fixed-width integer types can silently produce a wrong answer where Python's native integers never would, and how to avoid it.

**Concept**

Python's native `int` has **arbitrary precision** — it grows as large as needed, automatically, and never overflows. NumPy arrays default to a **fixed-width** integer type (`int64` on this platform) for performance — and fixed-width integers *can* overflow, wrapping around silently, with no warning or error by default.

**Example, the actual sequence this guide followed while measuring Module 8's speedup above:**

```python
python_sum = sum(x*x + 1 for x in range(N))       # N = 5_000_000
numpy_sum = result_np.sum()                          # the same computation, vectorized
print(python_sum)
print(numpy_sum)
```

Verified output — **these do not match**:

```
41666654166672500000
4773166019253396768
```

Every *individual* element of `result_np` is correct and within `int64`'s range (`np.iinfo(np.int64).max` is `9223372036854775807`, and the largest single element here, `24999990000002`, is nowhere near it, verified directly). The problem is specifically the **sum**: accumulating 5 million such values overflows `int64`'s maximum by roughly 4.5×, and `.sum()` wraps around silently — verified directly, capturing warnings around the call: **zero warnings raised**. NumPy does not check for this by default, for the same performance reasons it doesn't do bounds-checking on every array access.

**The fix**, verified directly:

```python
print(sum(result_np.tolist()) == python_sum)
```

Verified: `True` — converting back to a list of native Python `int` objects (`.tolist()`) and summing with Python's own `sum()` produces the mathematically correct, arbitrary-precision result, at the cost of losing vectorization's speed advantage for that specific reduction.

> **Pitfall, verified precisely and genuinely dangerous:** this is not a hypothetical edge case — it's what actually happened while this guide's own author computed the "verify the results match" step for the speedup measurement above, on a completely ordinary array of squared integers. A financial total, a running count, or any large-scale aggregate computed via NumPy's default integer `.sum()` can silently be wrong, with the array itself, every individual element, and every intermediate step looking completely correct under inspection — only the final reduction is wrong, and nothing about running the code flags it. The general fix, beyond this specific example: know your data's realistic maximum magnitude, and either use a wider type explicitly (`dtype=np.float64` for a fast-but-approximate reduction, accepting some floating-point imprecision instead of integer overflow) or fall back to Python's native arbitrary-precision arithmetic (`.tolist()` plus `sum()`) when exactness at scale genuinely matters more than speed.

**Practice**

- Reproduce the overflow with a smaller `N` — how large does `N` need to be before `int64`'s sum first diverges from the correct value, for this specific `x*x + 1` computation? (Hint: work from `np.iinfo(np.int64).max` and the growth rate of a sum of squares.)
- Verify directly whether `np.float64`'s wider (but inexact) range avoids this specific overflow for `N = 5_000_000`, and by how much the float64 sum differs from the exact Python integer sum.

## Progress check

1. What's the fundamental reason a vectorized NumPy operation outperforms an equivalent Python `for` loop?
2. What precise rule governs whether NumPy broadcasts two differently-shaped arrays together, versus rejecting them?
3. Why did every individual element of `result_np` compute correctly, while `result_np.sum()` did not?
4. Does NumPy warn when a fixed-width integer operation overflows, verified directly?
5. What's the fix this guide verified for the overflow, and what does it cost?
6. Why is "every individual value looked correct" not sufficient evidence that a large-scale NumPy computation is correct?

### Answers

1. A vectorized operation runs the entire computation in compiled code over contiguous memory, paying Python's interpreter overhead (bytecode dispatch, dynamic type checks) once for the whole array, rather than once per element the way an explicit `for` loop must.
2. Comparing shapes from the trailing dimension: two dimensions are compatible if they're equal, or if one of them is `1` (broadcast to match the other) — verified directly, `(2,3)` and `(3,)` broadcast successfully (trailing dimensions both `3`), while `(2,3)` and `(2,)` correctly raise a `ValueError` (trailing dimensions `3` and `2` don't match).
3. Because every individual element (`x*x + 1` for values up to `N-1`) stayed well within `int64`'s range, but summing 5 million such values together overflowed `int64`'s maximum — the overflow is a property of the accumulated total, not of any single value.
4. No — verified directly, capturing warnings around the `.sum()` call raised zero of them. NumPy does not check for integer overflow by default.
5. Converting the array back to a list of native Python integers with `.tolist()` and summing with Python's own arbitrary-precision `sum()` — verified to produce the exact correct total, at the cost of losing the vectorized speed advantage for that specific reduction.
6. Because the overflow only shows up in the *aggregate* (the sum across all 5 million elements), not in any individual element — inspecting elements one at a time, or even sampling a handful, gives no signal that the final reduction is wrong; only checking the aggregate against an independently-computed correct value (as this guide did, against Python's native `sum()`) actually catches it.
