# Module 7 — Grade-Up/Down and Boolean Masking

By the end of this module you'll be able to sort any array — and, critically, reorder a *second, related* array by the same ordering — using grade-up/down, and filter an array with a boolean mask using compress (`/`). No comparison-based sorting algorithm gets written anywhere. Feeds Capstone 3.

## `⍋`/`⍒`: grade returns positions, not sorted values

**You'll be able to:** use `⍋` (grade up) and `⍒` (grade down) to get the *permutation* that would sort an array, and use that permutation to reorder both the original array and a related one.

**Concept**

`⍋array` (grade up) doesn't sort — it returns the array of **positions** that, used to index the original array, would produce ascending order. `⍒` is its descending counterpart. This distinction — grade gives you *indices*, not values — is exactly what makes it possible to sort one array by another's order, a genuinely common real need.

**Example**

```apl
scores←72 95 60 88 77 91
⍒scores
scores[⍒scores]
```

```
2 6 4 5 1 3
95 91 88 77 72 60
```

Verified directly: `⍒scores` returns `2 6 4 5 1 3` — position `2` (value `95`) is the largest, position `6` (value `91`) the second largest, and so on. `scores[⍒scores]` uses that permutation to index back into `scores` itself, producing the genuinely sorted descending values `95 91 88 77 72 60`.

> **Pitfall:** it's tempting to assume there's a direct "sort" primitive that just returns sorted values — there is (`scores[⍒scores]` composes to exactly that), but understanding *why* it's two separate pieces (grade computes a permutation; indexing applies it) is what makes the next section's "sort names by scores" possible at all. A language whose sort primitive only ever returns sorted values of the *same* array couldn't do that.

**Practice**

- Sort `scores` ascending using `⍋` instead, and confirm the result is the exact reverse of the `⍒` version.

## Reordering a *second* array by the first's sort order

**You'll be able to:** use one array's grade permutation to reorder a completely different, related array — the actual payoff of grade returning positions rather than values.

**Concept**

Because `⍒scores` is just a list of positions, that *same* permutation can index into any array of matching length — not just `scores` itself. This is exactly how a real leaderboard works: sort by score, but display the names in that same order.

**Example**

```apl
names←'Ada' 'Bob' 'Cy' 'Dee' 'Eve' 'Fay'
names[⍒scores]
2↑names[⍒scores]
```

```
Bob Fay Dee Eve Ada Cy
Bob Fay
```

Verified directly: `names[⍒scores]` reorders `names` using `scores`' own sort permutation — position `2` (`Bob`, who scored `95`) comes first, position `6` (`Fay`, `91`) second, and so on, matching the score ordering exactly, even though `names` was never itself compared or sorted. `2↑` (take) grabs the first two elements of that reordered list — the top two scorers' names, `Bob` and `Fay`, with no explicit "find the top scorer" logic written anywhere.

> **Pitfall:** `names` and `scores` must be the same length and in *correspondingly matched order* for this to mean anything — `names[⍒scores]` silently produces a plausible-looking, completely wrong leaderboard if the two arrays were ever built or maintained out of sync with each other, with no error raised at all.

**Practice**

- Add a third array, `grades` (letter grades), and reorder it by the same `⍒scores` permutation, confirming all three arrays (`scores`, `names`, `grades`) stay correctly correlated.

## Boolean masking with compress (`/`)

**You'll be able to:** filter an array using a boolean mask and the compress form of `/`.

**Concept**

A comparison like `scores>80` produces a boolean array (`0`/`1` per element) the same length as `scores`. Used as the left argument to `/` (the same symbol as reduction, in a different, dyadic-with-boolean-left-argument role — "compress"), it filters, keeping only the elements where the mask is `1`.

**Example**

```apl
mask←scores>80
mask
mask/scores
mask/names
```

```
0 1 0 1 0 1
95 88 91
Bob Dee Fay
```

Verified directly: `mask` correctly marks positions `2`, `4`, `6` (scores `95`, `88`, `91`) as `1`. `mask/scores` keeps exactly those three scores. `mask/names`, using the **same mask**, keeps the correspondingly matched names — `Bob`, `Dee`, `Fay` — the students who actually scored above `80`, with no explicit filtering loop, and the same "reuse one boolean/permutation array across multiple correlated arrays" idiom this module used for sorting too.

> **Pitfall:** `/` here means something genuinely different from Module 2's reduction `/` — a boolean left argument triggers compress (filtering); a dyadic operator like `+` on the left triggers reduction. Same symbol, dispatched on the *type* of its left argument, not a coincidence to memorize separately from reduction but a real, load-bearing overload worth understanding precisely.

**Practice**

- Combine both techniques: find the names of everyone scoring above `80`, sorted by score descending, in one composed expression.

## Progress check

1. What does `⍋`/`⍒` actually return — sorted values, or something else?
2. Why does `scores[⍒scores]` work to produce genuinely sorted values?
3. What real capability does `names[⍒scores]` demonstrate that sorting `names` directly could not?
4. What real risk does reordering two separately-maintained arrays by one's permutation carry?
5. What determines whether `/` means reduction or compress?

### Answers

1. Positions (a permutation) — the indices that, used to index the original array, would produce it in sorted order; not the sorted values themselves.
2. Because `⍒scores` returns the sequence of positions in sorted order, and indexing `scores` with that sequence (`scores[...]`) retrieves the values at those positions in that order — producing genuinely sorted output.
3. Reordering a *different* array (names) by a *first* array's (scores') sort order — something only possible because grade returns positions, reusable against any array of matching length, not values tied to the array that was graded.
4. If the two arrays are ever out of sync (different lengths, or not correspondingly matched position-for-position), the reordering silently produces a plausible-looking but completely wrong result, with no error raised.
5. The type of `/`'s left argument — a dyadic operator (like `+`) triggers reduction; a boolean array triggers compress (filtering).
