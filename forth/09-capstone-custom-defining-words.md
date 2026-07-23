# Capstone 3 — Custom Defining Words

Combines every concept from Module 8: `CONSTANT2` and `ARRAY` used together in one real program — named weight constants and a real data array, combined into a weighted average — including a second genuine, live-caught bug, this time in how the sum itself was accumulated.

## The setup

```forth
: CONSTANT2 ( n "name" -- ) CREATE , DOES> @ ;
: ARRAY ( n "name" -- ) CREATE CELLS ALLOT DOES> SWAP CELLS + ;

3 CONSTANT2 QUIZ-WEIGHT
5 CONSTANT2 EXAM-WEIGHT
2 CONSTANT2 HW-WEIGHT

3 ARRAY SCORES
80 0 SCORES !
90 1 SCORES !
70 2 SCORES !
```

Three named constants (quiz/exam/homework weights) and a three-element score array — both built from the exact same two custom defining words Module 8 verified independently, now put to real, combined use: readable, named vocabulary (`QUIZ-WEIGHT`, not a bare `3` scattered through the code) alongside genuine indexed storage.

## The bug, caught live — a second one, different from Capstone 1's

A first attempt at computing the weighted sum:

```forth
: WEIGHTED-SUM ( -- n )
  0 SCORES @ QUIZ-WEIGHT * +
  1 SCORES @ EXAM-WEIGHT * +
  2 SCORES @ HW-WEIGHT * + ;

WEIGHTED-SUM . CR
```

```
capstone3.fs:20: Stack underflow
WEIGHTED-SUM >>>.<<< CR
```

**This fails immediately.** Tracing the very first line reveals why: `0 SCORES @ QUIZ-WEIGHT *` correctly computes `80 × 3 = 240`, leaving `[240]` on the stack — but the trailing `+` on that *same* line has nothing to add `240` to. There's no running total yet; this is the *first* term of the sum, not an accumulation into a prior partial result. The `+` was copied mechanically onto every line, including the one where it doesn't belong yet.

**The fix — no `+` after the first term:**

```forth
: WEIGHTED-SUM ( -- n )
  0 SCORES @ QUIZ-WEIGHT *
  1 SCORES @ EXAM-WEIGHT * +
  2 SCORES @ HW-WEIGHT * + ;

: TOTAL-WEIGHT ( -- n ) QUIZ-WEIGHT EXAM-WEIGHT + HW-WEIGHT + ;

WEIGHTED-SUM . CR
TOTAL-WEIGHT . CR
WEIGHTED-SUM TOTAL-WEIGHT / . CR
```

```
830
10
83
```

Verified by hand: `80×3 + 90×5 + 70×2 = 240 + 450 + 140 = 830`, matching `WEIGHTED-SUM` exactly. `TOTAL-WEIGHT = 3 + 5 + 2 = 10`, matching exactly. `830 ÷ 10 = 83`, the correct weighted average, matching the final line exactly.

> **The actual point of this capstone, and its second bug:** Capstone 1's bug came from a word (`SQUARE`) operating on the wrong stack position when called twice in a row. This bug is different — it's about **accumulation pattern**, a genuinely common shape (first term stands alone, every subsequent term adds to a running total) that's easy to get wrong specifically because RPN's "operator last" style makes it tempting to write the *same* trailing operator on every line uniformly, rather than recognizing the first line needs to establish the total, not add to one that doesn't exist yet. Both bugs are real, verified, and kept in deliberately — together, they cover two of the most common real mistakes anyone writing genuinely stack-based code for the first time is likely to make.

> **Pitfall:** `WEIGHTED-SUM` and `TOTAL-WEIGHT` are entirely separate words, each recomputing from scratch every time they're called — there's no caching, and calling `WEIGHTED-SUM` twice genuinely reruns all three array lookups and multiplications both times. For this capstone's tiny, fixed-size data this is irrelevant; a real program with large or slow-to-access data would need to think about this explicitly, since nothing in Forth caches a word's result automatically.

## Extending it yourself

- Add a fourth category (`PROJECT-WEIGHT`) and a fourth score, updating `SCORES`'s declared size, `WEIGHTED-SUM`, and `TOTAL-WEIGHT` consistently — and notice how many separate places had to change, compared to how a loop over a parallel weights-array would only need one.
- Rewrite `WEIGHTED-SUM` to use a `DO`/`LOOP` over both `SCORES` and a second, parallel `WEIGHTS` array instead of hand-unrolling three lines — a real, worthwhile refactor once the pattern of "index into two parallel arrays and accumulate" becomes obvious from this capstone's own repetition.
