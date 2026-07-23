# Final Assessment

Across all eight modules and three capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What real toolchain gotcha did this guide find and verify about GNU APL's default locale, and what's the fix?
2. What does `⍳5` generate, and what does `⍴` do to it, monadically?
3. What's the difference between `¯5` and the result of `3-8`, syntactically?
4. What does "scalar extension" mean, concretely, for `2×1 2 3 4 5`?
5. What's the actual difference between `/` (reduction) and `\` (scan)?
6. For a matrix, what's the difference between `+/` and `+⌿`?
7. In Capstone 1, why did `deviations←data-mean` not need an explicit loop over `data`'s elements?
8. What real, directly-tested finding did this guide report about GNU APL's dfn guard syntax, in its specific invocation mode?
9. What does `a∘.op b` compute, for a generic dyadic operator `op`?
10. In Capstone 2, what real, easy mistake did a first attempt at naming a variable make, and why did it fail specifically?
11. In Capstone 2, what's the difference between what `⌊/dist` and `⌊⌿dist` each compute?
12. What do `⍋`/`⍒` actually return — sorted values, or something else?
13. What real capability did `names[⍒scores]` demonstrate in Capstone 3 that sorting `names` directly could not?
14. What does the "grade of grade" idiom (`⍋⍒scores`) compute, and how was it verified in Capstone 3?
15. What determines whether `/` means reduction or compress?

## Answers

1. That GNU APL hangs indefinitely with zero output under the default `C` locale — fixed by explicitly setting `LC_ALL=en_US.UTF-8` for every invocation.
2. `⍳5` generates the five-element vector `1 2 3 4 5`; `⍴` (monadic) on it returns `5`, its length/shape.
3. `¯5` is a literal negative number using the dedicated high-minus glyph; `3-8`'s result (`¯5`) is computed by the subtraction operator `-`, though displayed using the same `¯` glyph for negative values.
4. The single scalar `2` is applied to every element of the vector automatically, with no explicit repetition written — computing `2×1, 2×2, 2×3, 2×4, 2×5` in one expression.
5. `/` (reduction) collapses an entire array down to one final value; `\` (scan) produces an array of the same length, holding the running/cumulative reduction at every position.
6. `+/` reduces along the last axis (each row collapses to a sum); `+⌿` reduces along the first axis (each column collapses to a sum).
7. Because `-` (subtraction) is elementwise by default, and `mean` is a scalar — Module 1's scalar extension applies automatically, subtracting `mean` from every element of `data` in one expression with no loop.
8. That the guard syntax (`condition:result`) fails outright with `Illegal : in immediate execution`, tested directly against this guide's exact invocation mode — even the simplest possible guard case failed.
9. A full table where position `[i;j]` holds `a[i] op b[j]` — every combination of one element from `a` with one from `b`.
10. It named a variable `nearest-per-store`, which APL parsed as an attempted subtraction between three undefined names, since `-` always means subtraction and hyphens can't appear inside identifiers — caught with a real `VALUE ERROR`, fixed by using a plain identifier instead.
11. `⌊/dist` reduces along the last axis — for each warehouse (row), the distance to its nearest store; `⌊⌿dist` reduces along the first axis — for each store (column), the distance to its nearest warehouse. Both are valid, different computations answering different questions.
12. Positions (a permutation) — the indices that, used to index the original array, would produce it in sorted order, not the sorted values themselves.
13. Reordering a *different* array (`names`) by a *first* array's (`scores`') sort order — only possible because grade returns reusable positions, not values tied to whichever array was graded.
14. For each position in the *original* array, its numeric rank (1st, 2nd, etc.) — verified by independently cross-checking every value against the already-computed leaderboard order, not merely trusted because the formula is a known idiom.
15. The type of `/`'s left argument — a dyadic operator (like `+`) triggers reduction; a boolean array triggers compress (filtering).
