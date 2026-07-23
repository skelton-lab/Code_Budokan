# Module 6 — Broadcasting: The Dot Syntax

By the end of this module you'll be able to apply an operator or any function elementwise across an array using Julia's `.` syntax, and place it precisely in this series' array-oriented-programming thread, alongside `apl/`'s whole-array operations and `python/`'s NumPy vectorization. Feeds Capstone 3.

## Broadcasting arithmetic: `.+`, `.*`, `.^`

**You'll be able to:** apply an arithmetic operator elementwise across a vector, and across two vectors together.

**Concept**

A `.` immediately before an operator (`.+`, `.*`, `.^`) broadcasts it — applying it elementwise, either between an array and a scalar (the scalar applies to every element) or between two arrays of matching shape (elementwise pairing).

**Example**

```julia
v = [1, 2, 3, 4, 5]
println(v .+ 10)
println(v .* 2)
println(v .^ 2)

a = [1, 2, 3]
b = [10, 20, 30]
println(a .+ b)
```

```
[11, 12, 13, 14, 15]
[2, 4, 6, 8, 10]
[1, 4, 9, 16, 25]
[11, 22, 33]
```

Verified directly: `v .+ 10` adds `10` to every element (scalar broadcast); `a .+ b` adds elementwise between two vectors of matching length.

> **The direct, three-way comparison this series can now make:** `v .+ 10` is *precisely* APL's scalar extension (`apl/01-foundations-arrays-shape.md`'s `2×1 2 3 4 5`, no dot needed at all — every APL operator is elementwise by default) and *precisely* NumPy's broadcasting (`python/08-numpy-vectorization.md`'s `array + scalar`, also no special syntax needed). Julia's own choice — requiring an explicit `.` — sits in between: broadcasting is opt-in, syntactically visible at every call site, rather than either APL's "everything is elementwise, always" or a plain function call that happens to be vectorized internally the way NumPy's own operators are.

> **Pitfall:** `v + 10` (no dot) is **not** the same as `v .+ 10` in Julia — plain `+` between a vector and a scalar is often simply an error (there's no default numeric-array-plus-scalar rule the way APL or NumPy's own `+` provides automatically); the `.` is genuinely required to request elementwise behavior.

**Practice**

- Predict, then verify, what `v + 10` (no dot) actually does in Julia — confirm it either errors or behaves differently from `v .+ 10`.

## Broadcasting any function: `f.(v)`

**You'll be able to:** apply an arbitrary user-defined function elementwise across an array using the same dot syntax.

**Concept**

The dot-broadcast syntax isn't limited to built-in operators — `f.(array)` applies *any* function `f` elementwise, exactly the same mechanism as `.+`/`.*`, generalized to arbitrary functions.

**Example**

```julia
f(x) = x^2 + 1
println(f.(v))
println(v .+ f.(v))
```

```
[2, 5, 10, 17, 26]
[3, 7, 13, 21, 31]
```

Verified directly: `f.(v)` applies `x -> x^2 + 1` to every element of `v` (`1² + 1 = 2`, `2² + 1 = 5`, and so on); `v .+ f.(v)` combines two broadcast operations in one expression, adding each original element to its own transformed value.

> **Pitfall:** `f` itself, defined as `f(x) = x^2 + 1`, is an ordinary, non-broadcast function — calling `f(v)` directly (no dot) on a whole vector would be a type error, since `^`/`+` inside `f`'s own body expect scalar arguments. The `.` in `f.(v)` is what turns an ordinary scalar function into an elementwise array operation — `f` itself never needed to be written any differently to support this.

**Practice**

- Write a scalar function `celsius_to_fahrenheit(c) = c * 9/5 + 32`, and use dot-broadcasting to convert an entire vector of Celsius temperatures at once.

## Axis-controlled reduction: `sum(m, dims=1)` vs. `dims=2`

**You'll be able to:** control which axis a reduction like `sum` operates along, for a matrix.

**Concept**

`sum(matrix, dims=1)` collapses each *column* to one value; `dims=2` collapses each *row* — the same axis-control concept `apl/02-reduction-scan.md` covered with `+/` vs. `+⌿`, expressed here as a keyword argument instead of a different symbol.

**Example**

```julia
m = reshape(1:6, 2, 3)
println(m)
println(sum(m, dims=1))
println(sum(m, dims=2))
```

```
[1 3 5; 2 4 6]
[3 7 11]
[9; 12;;]
```

Verified directly against `m`'s actual layout (Julia arrays are column-major — `reshape(1:6, 2, 3)` fills column-by-column, giving rows `[1 3 5]` and `[2 4 6]`): `sum(m, dims=1)` collapses each column (`1+2=3`, `3+4=7`, `5+6=11`), giving `[3 7 11]`. `sum(m, dims=2)` collapses each row (`1+3+5=9`, `2+4+6=12`), giving a result displayed as `[9; 12;;]` — the trailing `;;` is Julia's own way of showing this is genuinely still a 2×1 *matrix*, not a plain vector, a real, verified display detail worth recognizing rather than assuming is a typo.

> **Pitfall:** Julia's array storage is **column-major** (like Fortran), not row-major (like C, Python/NumPy, or the row-major convention most readers coming from those languages would assume by default) — `reshape(1:6, 2, 3)` filling `[1 3 5; 2 4 6]` rather than the row-major `[1 2 3; 4 5 6]` a NumPy-trained instinct would predict is a real, easy source of confusion worth verifying directly rather than assuming either convention.

**Practice**

- Build a 3×4 matrix from `reshape(1:12, 3, 4)`, predict its actual layout given column-major filling, then verify by printing it.
- Compute both `sum(your_matrix, dims=1)` and `dims=2)`, confirming each against the matrix's actual printed layout by hand.

## Progress check

1. Why is `.` required for elementwise operations in Julia, unlike APL (where every operator is elementwise by default) or NumPy (where `+` is elementwise without a special symbol)?
2. What does `f.(v)` do, and does `f` itself need to be written differently to support it?
3. What's the real difference between `sum(m, dims=1)` and `sum(m, dims=2)`?
4. What does the trailing `;;` in a printed result like `[9; 12;;]` actually indicate?
5. What real, easy assumption does this module warn a NumPy-trained reader against, regarding Julia's array storage order?

### Answers

1. Julia made broadcasting opt-in and syntactically visible at every call site, a deliberate design choice distinct from APL's "everything is elementwise by default" and NumPy's "arithmetic operators are elementwise without any special marker."
2. It applies `f` elementwise to every element of `v`; `f` itself doesn't need to be written any differently — it's defined as an ordinary function operating on a single scalar value, and the `.` is what turns that into an array operation.
3. `dims=1` collapses each column to a single value (summing down); `dims=2` collapses each row to a single value (summing across) — the axis-control concept, expressed as a keyword argument rather than a different symbol the way APL's `+/` vs. `+⌿` expressed it.
4. That the result is still a genuine 2D array (here, a 2×1 matrix), not a plain 1D vector — Julia's own printed-output convention for distinguishing the two.
5. That Julia's arrays are column-major (like Fortran), not row-major (like C/NumPy/Python) — a reader assuming row-major filling by default, coming from NumPy experience, would predict the wrong layout for something like `reshape(1:6, 2, 3)`.
