# Module 5 — Outer Product, Transpose, Reshape

By the end of this module you'll be able to build a full table from two vectors with the outer product operator, flip a matrix's rows and columns with transpose, and combine these with reduction. Feeds Capstone 2.

## Outer product: `∘.` builds a full table from two vectors

**You'll be able to:** use `∘.operator` to build a complete table combining every element of one vector with every element of another.

**Concept**

`a∘.op b` builds a matrix where position `[i;j]` holds `a[i] op b[j]` — every combination of an element from `a` with an element from `b`, for any dyadic operator `op`, in one expression.

**Example**

```apl
(⍳3)∘.×⍳3
```

```
1 2 3
2 4 6
3 6 9
```

Verified directly: this is a standard 3×3 multiplication table — row `i`, column `j` holds `i×j`. `∘.` works with any dyadic operator, not just `×`:

```apl
a←1 5 9
b←2 6
a∘.-b
```

```
¯1 ¯5
 3 ¯1
 7  3
```

Verified by hand against `a`'s and `b`'s actual values: row 1 (`a=1`) gives `1-2=¯1` and `1-6=¯5`; row 2 (`a=5`) gives `5-2=3` and `5-6=¯1`; row 3 (`a=9`) gives `9-2=7` and `9-6=3` — matching the displayed matrix exactly.

> **Pitfall:** `∘.` is genuinely an operator that takes another operator as its own argument (`×`, `-`, or anything else dyadic) — this two-level structure (an operator modifying an operator, not modifying a value) is a real conceptual jump from everything Modules 1–2 covered, where every symbol operated directly on data.

**Practice**

- Compute `(⍳5)∘.+⍳5`, a 5×5 addition table, and confirm a few entries by hand.
- Build an outer product using `⌈` (max) instead of arithmetic, and explain what each cell of the resulting table represents.

## `|` (absolute value) combined with outer product

**You'll be able to:** combine `|` with an outer-product subtraction to compute every pairwise absolute difference between two vectors at once.

**Concept**

`|value` (monadic) returns the absolute value. Combined with `∘.-`, `|(a∘.-b)` computes the absolute difference between *every* pair of elements from `a` and `b` — a full pairwise-distance table, in one expression.

**Example**

```apl
|¯7
|a∘.-b
```

```
7
1 5
3 1
7 3
```

Verified directly: `|¯7 = 7`. `|a∘.-b`, applied to the same `a`/`b` outer-product result from above, converts every negative entry to its positive equivalent — `¯1` becomes `1`, `¯5` becomes `5` — while positive entries (`3`, `7`) are unchanged. The result is a genuine pairwise absolute-distance table between every element of `a` and every element of `b`.

> **Pitfall:** it's easy to reach for a nested loop mentally when thinking "every pair of two lists" — `|a∘.-b` computes that entire table in one composed expression, with the outer product handling "every pair" and `|` handling "distance, not signed difference," each doing exactly one job.

**Practice**

- Compute the pairwise absolute-distance table between `10 20 30` and `12 18 33`, and identify the closest pair by eye.

## `⍉`: transpose

**You'll be able to:** flip a matrix's rows and columns with `⍉`.

**Concept**

`⍉matrix` (monadic) swaps rows and columns — a 2×3 matrix becomes a 3×2 matrix, its `[i;j]` entry moving to `[j;i]`.

**Example**

```apl
⍉2 3⍴⍳6
```

```
1 4
2 5
3 6
```

Verified directly against the known matrix `1 2 3 / 4 5 6`: transposing swaps its shape from `2 3` to `3 2`, with the first column of the original (`1 4`) becoming the first row of the result.

> **Pitfall:** transpose changes an array's *shape*, not just its display — a `2 3` matrix transposed genuinely has shape `3 2` afterward, a real, checkable difference (confirm with `⍴` on the result), not a cosmetic reordering of how the same shape happens to print.

**Practice**

- Transpose a 3×4 matrix built from `⍳12`, and confirm its shape changes from `3 4` to `4 3`.

## Progress check

1. What does `a∘.op b` compute, for a generic dyadic operator `op`?
2. Why is `∘.` described as "an operator taking another operator as its argument"?
3. What does `|a∘.-b` compute, concretely, and how does it differ from `a∘.-b` alone?
4. What does `⍉` change about a matrix, beyond how it's displayed?
5. What real problem does outer product solve without needing a nested loop?

### Answers

1. A full table where position `[i;j]` holds `a[i] op b[j]` — every combination of one element from `a` with one from `b`.
2. Because `∘.` isn't itself a complete operation — it needs a second operator (`×`, `-`, `⌈`, or any other dyadic one) supplied alongside it to know what to actually compute at each table position.
3. `a∘.-b` computes every pairwise *signed* difference; `|a∘.-b` converts every entry to its absolute value, producing every pairwise *distance* instead — the sign of who's larger is discarded, only the magnitude of the gap remains.
4. It changes the array's actual shape — a `2 3` matrix transposed genuinely becomes shape `3 2`, checkable directly with `⍴`, not merely a different way of printing the same underlying shape.
5. Computing every combination of one element from each of two lists — normally requiring a nested loop (one loop per list) in most languages — in a single composed expression instead.
