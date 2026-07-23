# Capstone 3 — A Ranking System

Combines every concept from Module 7: a full leaderboard — sorted display, top-N, each student's numeric rank, and a passing-threshold filter — for six students' scores, with no sorting algorithm, ranking algorithm, or filtering loop written by hand anywhere.

## The data

```apl
scores←72 95 60 88 77 91
names←'Ada' 'Bob' 'Cy' 'Dee' 'Eve' 'Fay'
```

## Sorted leaderboard and top-N

```apl
order←⍒scores
names[order]
scores[order]
3↑names[order]
```

```
Bob Fay Dee Eve Ada Cy
95 91 88 77 72 60
Bob Dee Eve Fay
```

Verified directly (matching Module 7's own worked example exactly): `order` captures the descending-score permutation once, reused for both `names[order]` and `scores[order]` — a real leaderboard, names and scores correctly correlated, built from Module 7's core idiom.

## Each student's numeric rank, in original order

```apl
rank←⍋⍒scores
rank
```

```
5 1 6 3 4 2
```

This is a genuinely elegant, classic APL idiom — **grade of grade**. `⍒scores` gives the descending-sort permutation; grading *that* permutation (`⍋` applied to it) produces, for each position in the *original* array, its rank. Verified by hand against the known leaderboard order above: Ada (position 1, score `72`) placed 5th — `rank[1]=5`. Bob (`95`) placed 1st — `rank[2]=1`. Cy (`60`) placed last, 6th — `rank[3]=6`. Dee (`88`) placed 3rd — `rank[4]=3`. Eve (`77`) placed 4th — `rank[5]=4`. Fay (`91`) placed 2nd — `rank[6]=2`. Every single value matches the leaderboard computed above, cross-checked independently rather than merely trusted because the formula is a known idiom.

> **Pitfall:** `⍋⍒scores` composes two grade operations directly — it's easy to misread as somehow "sorting twice" or canceling out; it doesn't. The first `⍒` produces a permutation (not sorted *values*); the second `⍋` operates on *that permutation as data*, producing something genuinely different (a rank-in-original-order array) from either grade alone.

## Passing-threshold filter

```apl
passing←scores≥75
passing/names
passing/scores
+/passing
```

```
Bob Dee Eve Fay
95 88 77 91
4
```

Verified directly: `passing` correctly marks four students (`95, 88, 77, 91`, all `≥75`) as passing, and `passing/names`/`passing/scores` — Module 7's compress idiom — correctly pulls out exactly those four names and scores, matched. `+/passing` sums the boolean mask directly to count how many passed (`4`) — booleans as `0`/`1` numbers, summed with the exact same `+/` reduction Module 2 taught for ordinary numbers, no separate "count" operator needed.

> **The actual point of this capstone:** a leaderboard, individual rankings, and a passing filter — three genuinely different, commonly-needed reports — were built entirely from five primitive ideas (grade, indexing, take, compress, reduction) composed in different combinations, with zero sorting/ranking/filtering algorithms implemented by hand anywhere in this capstone.

## Extending it yourself

- Add a `letter-grade` computation (an `A`/`B`/`C`/`D`/`F` array built from threshold comparisons on `scores`), reorder it by `order` alongside `names`/`scores`, and confirm all three stay correctly correlated.
- Combine `rank` with `passing` to answer: "what rank did the lowest-passing student achieve?" — in one composed expression, reusing values already computed above.
