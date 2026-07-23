# Module 4 — Arithmetic and Search

Modules 1–2 built everything on unification and backtracking alone. This module adds real arithmetic — which turns out to need its own operator, sharply distinct from `=` — and formalizes "generate candidates, then filter them" as a named pattern, including a genuine, verified crash this guide hit while building it, and the one-line fix. Every example run through `swipl`. Feeds Capstone 2.

## `is` vs. `=`: two completely different operators

**You'll be able to:** know, on sight, whether a piece of code needs `is` or `=`, and explain why confusing them fails silently rather than erroring.

**Concept**

Module 1 already showed `X = 1+2` binding `X` to the *compound term* `+(1,2)`, not the number `3`. Arithmetic evaluation is a **separate operator**, `is/2`: it evaluates the expression on its right and unifies the result with its left. `=:=` extends the same idea to comparison — arithmetic equality, evaluating both sides, as opposed to `==` (structural equality, no evaluation) and `=` (unification, no evaluation, but *can* bind variables where `==` and `=:=` cannot).

| Operator | Does |
|---|---|
| `X = Expr` | Unify `X` with the term `Expr`, unevaluated |
| `X is Expr` | Evaluate `Expr` arithmetically, unify `X` with the numeric result |
| `A =:= B` | Evaluate both sides arithmetically, succeed if numerically equal |
| `A == B` | Structural equality — succeed only if already the identical term, no evaluation |

**Example**

```prolog
?- X = 1+2, X =:= 3.
X = 1+2.

?- X = 1+2, X == 3.
false.
```

Verified: `X = 1+2` still binds `X` to the unevaluated term `1+2` (as in Module 1), but `X =:= 3` succeeds — `=:=` evaluates `X` (`1+2`, giving `3`) and compares it numerically against `3`. `X == 3` fails for the same reason `==` failed in Module 1: `1+2` and `3` are not the same *term*, regardless of what they evaluate to.

```prolog
?- X is 7/2.
X = 3.5.

?- X is 7 // 2.
X = 3.
```

Verified — a real, SWI-specific behavior worth knowing precisely: ordinary `/` between two integers that don't divide evenly returns a **float** in SWI-Prolog by default (`3.5`), which is looser than strict ISO Prolog (where this can be a type error). `//` is explicit integer (floor) division, giving `3`.

> **Pitfall, verified directly:** `is/2` requires its right-hand expression to be fully evaluable — every variable in it must already be bound to a number. `X is 1 + Y` with `Y` unbound doesn't fail quietly; it raises an actual error (`Arguments are not sufficiently instantiated`), the one place in this guide's core material where Prolog behaves more like a conventional language's runtime error than its usual "just fails" convention. This is worth knowing precisely because `=` never does this — `X = 1+Y` with `Y` unbound succeeds fine, producing the unevaluated compound term `1+Y`, which is exactly the kind of "looks similar, behaves completely differently" trap this guide's methodology note flags for the whole language.

**Practice**

- Predict, then verify, what `X is max(3, 7)` and `X is abs(-5)` produce — SWI-Prolog's `is/2` supports ordinary arithmetic functions, not just infix operators.
- Explain why `3 = 3.0` fails (verify it) while `3 =:= 3.0` succeeds (verify that too) — what does this say about the difference between unification and arithmetic comparison for numbers specifically?

## `between/3` and the generate-and-test pattern

**You'll be able to:** generate a bounded range of candidate values and filter them with an arithmetic test, in the right order.

**Concept**

`between(Low, High, X)` is a relation, in the same sense `parent/2` was: called with `X` unbound, it backtracks through every integer from `Low` to `High` in turn. Combined with an arithmetic filter, this is **generate-and-test** — Prolog's most common way to search a small, well-defined space: generate a candidate, then check it, and let backtracking retry with the next candidate whenever the check fails.

**Example**

```prolog
?- findall(X-Y, (between(1,5,X), between(1,5,Y), X+Y =:= 7), L).
L = [2-5, 3-4, 4-3, 5-2].
```

Verified: all four pairs of numbers from 1–5 that sum to 7, found by generating every `X`/`Y` combination and filtering with `=:=`. Order matters here in a way it hasn't yet in this guide: `between(1,5,X), between(1,5,Y), X+Y =:= 7` generates all 25 `X`/`Y` combinations before filtering any of them; writing the arithmetic check earlier wouldn't even parse, since `Y` doesn't exist yet at that point — but the general principle (constrain as early as the data dependencies allow) is what the next pitfall makes concrete and costly to ignore.

`once/1` stops backtracking after the first solution, without needing a full cut (Module 8 covers `!` itself):

```prolog
?- once(member(X,[1,2,3])).
X = 1.
```

Verified: only the first match, no choice point left behind — this is precisely the fix Capstone 1's `plunit` pitfall needed for `grandparent(tom, ann)`.

> **Pitfall — a real crash, verified directly while building this guide:** `findall(L, (length(L,N), N =< 2), Ls)` looks like a reasonable way to say "all lists of length 0, 1, or 2." Run as written, it doesn't return three lists — it exhausts SWI-Prolog's stack entirely (`ERROR: ... Stack limit (1.0Gb) exceeded`, `Stack depth: 38,346,917`). The reason: `length(L, N)` with *both* arguments unbound doesn't generate "small lists first and stop" — it backtracks through every length, `0, 1, 2, 3, 4, ...`, forever, and `findall` never gets to see that the `N =< 2` filter would have ruled out anything past length 2, because it hasn't been tried yet. The fix is exactly this module's generate-and-test ordering principle, applied correctly: bind `N` to a small range *first*, then generate a list of that length —
> ```prolog
> ?- findall(L, (between(0,2,N), length(L,N)), Ls).
> Ls = [[], [_A], [_B,_C]].
> ```
> Verified: this returns immediately, with three lists of increasing length (the unbound elements, `_A`, `_B`, `_C`, are simply structure with no values assigned — `length/2` doesn't need element values to build a list of the right shape). The general lesson: when a generator can produce infinitely many candidates, put whatever bounds the search *before* it in the goal, not after.

**Practice**

- Use `between/3` and `=:=` to find every pair `X`, `Y` between 1 and 10 (inclusive) where `X * Y =:= 24`.
- Predict what happens if you write `findall(X, (X is _, between(1,5,X)), L)` — i.e., put an unbound `is` before the generator that would bind it — and verify your prediction (hint: revisit the previous session's pitfall about `is/2`'s instantiation requirement).

## Progress check

1. What's the precise difference between what `=` and `is` each do to their right-hand side?
2. Why does `X is 1 + Y` with `Y` unbound raise an actual error, while `X = 1 + Y` with `Y` unbound succeeds fine?
3. What does `between(1,5,X)` do when `X` is unbound, and what does it do when `X` is already bound to, say, `3`?
4. Why did `findall(L, (length(L,N), N =< 2), Ls)` exhaust the stack instead of returning three short lists, and what one reordering fixed it?
5. What does `once/1` do, and what specific Capstone 1 problem did it solve?
6. Why does `3 =:= 3.0` succeed while `3 = 3.0` fails?

### Answers

1. `=` unifies its two sides as terms, with no evaluation — `1+2` stays the compound term `+(1,2)`. `is` evaluates its right-hand side as an arithmetic expression and unifies the left-hand side with the resulting number.
2. `is/2` needs every variable in its expression already bound to a number to compute a result — an unbound `Y` makes the expression impossible to evaluate, which SWI-Prolog reports as an instantiation error rather than a silent failure. `=` never evaluates anything, so an unbound `Y` is just another term it can unify against, producing the unevaluated compound term `1+Y`.
3. With `X` unbound, it backtracks through every integer from 1 to 5 in turn, one per solution. With `X` already bound, it succeeds (once, no choice point) if `X` falls within the range, and fails otherwise — it's checking membership, not just generating.
4. Because `length(L, N)` with both arguments unbound generates lists of every possible length, `0, 1, 2, 3, ...`, without bound, and `findall` has to fully exhaust a goal before returning — since the `N =< 2` filter came *after* the unbounded generator, it never got a chance to stop the search. Reordering to generate `N` from a bounded range first (`between(0,2,N)`), then generating a list of that specific length, fixed it.
5. `once/1` runs a goal and commits to its first solution, discarding any further choice points, without needing a full cut. It fixed Capstone 1's `plunit` warning on `grandparent(tom, ann)`, which had succeeded correctly but left an unexplored choice point behind — `plunit` flagged that as a test that wasn't provably deterministic.
6. `=:=` evaluates both sides arithmetically before comparing, and `3` and `3.0` are numerically equal. `=` unifies terms without evaluation, and an integer `3` is not the identical term as a float `3.0` — different underlying representations, even though they're numerically the same value.
