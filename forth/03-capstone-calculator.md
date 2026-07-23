# Capstone 1 — A Stack-Based Calculator

Combines every concept from Modules 1–2: a small vocabulary of arithmetic words, composed into `HYPOT-SQ` (the squared hypotenuse of a right triangle, avoiding floating-point square roots) — including a genuine bug this capstone's own verification caught live, kept in exactly because it's the single most instructive mistake a newcomer to stack-based composition can make.

## The vocabulary

```forth
: SQUARE ( n -- n^2 ) DUP * ;
: ABS-VAL ( n -- |n| ) DUP 0 < IF NEGATE THEN ;
```

## The bug, caught live

A first attempt at `HYPOT-SQ` looked reasonable:

```forth
: HYPOT-SQ ( a b -- a^2+b^2 ) SQUARE SQUARE + ;
3 4 HYPOT-SQ . CR
```

```
259
```

**This is wrong** — `3² + 4²` should be `9 + 16 = 25`, not `259`. Tracing the actual stack reveals why: starting from `[3, 4]` (`4` on top), the first `SQUARE` operates on whatever's currently on top — `4` — leaving `[3, 16]`. The **second** `SQUARE` doesn't touch `3` at all; it squares the top of the stack again, which is now `16`, not the original `4`, giving `[3, 256]`. The final `+` computes `3 + 256 = 259`. `SQUARE SQUARE` doesn't mean "square each of the two values below" — it means "square the top, then square whatever's on top *now*," and after the first `SQUARE`, that's the first result, not the second original operand.

**The fix — explicit stack management with `SWAP`:**

```forth
: HYPOT-SQ ( a b -- a^2+b^2 ) SWAP SQUARE SWAP SQUARE + ;
3 4 HYPOT-SQ . CR
5 12 HYPOT-SQ . CR
```

```
25
169
```

Verified directly, traced step by step: `[3, 4]` → `SWAP` → `[4, 3]` → `SQUARE` (squares `3`) → `[4, 9]` → `SWAP` → `[9, 4]` → `SQUARE` (squares `4`) → `[9, 16]` → `+` → `25`. Correct. `5 12 HYPOT-SQ` similarly gives `25 + 144 = 169` — the well-known 5-12-13 right triangle, confirming `13² = 169`.

> **The actual point of this capstone:** in a named-variable language, `a*a + b*b` is unambiguous regardless of how it's written — each name always refers to the same value. In stack-based Forth, `SQUARE SQUARE +` looks superficially reasonable but is a genuine, easy-to-write bug, because **which value a word operates on depends entirely on stack position at that exact moment**, not on any name. Composing stack-based words correctly requires tracking stack state explicitly, by hand, the same discipline this capstone's own stack-effect comments (`( a b -- a^2+b^2 )`) exist to support — and, as Module 1 already established, a discipline the language itself does nothing to enforce.

> **Pitfall:** `SWAP SQUARE SWAP SQUARE +` isn't the only correct fix — an alternative using the return stack (`>R DUP * R> DUP * ROT +` or similar) would also work, at the cost of being harder to read. There's no single "right" way to manage the stack in Forth, only more-or-less-readable ways that all have to be verified correct by tracing them by hand, exactly as this capstone's own bug was caught.

## Verification

```forth
3 4 HYPOT-SQ . CR    \ 25 — a 3-4-5 triangle
5 12 HYPOT-SQ . CR   \ 169 — a 5-12-13 triangle
```

Both checked against well-known Pythagorean triples, confirming `HYPOT-SQ` is correct after the fix — not merely "it compiled and ran," but independently verified against known-correct values.

## Extending it yourself

- Write `IN-RANGE ( n lo hi -- flag )` using `ABS-VAL` and comparison words, testing whether `n` falls within `[lo, hi]`, and trace its stack state by hand before running it.
- Deliberately reproduce a `SQUARE SQUARE`-style ordering bug in a word of your own design, predict what wrong value it will produce by tracing the stack yourself, then verify your prediction by running it.
