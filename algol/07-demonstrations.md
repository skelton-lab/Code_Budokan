# Module 7 — Small Demonstrations

Not "capstones" in the usual sense this series uses that word — ALGOL's actual territory here is narrower by design, given this guide's historical/conceptual promise rather than a "ship something" one. Two demonstrations: one executed, tying together blocks, recursion, and arrays; one worked through by hand, closing the loop on Module 5's Jensen's Device.

## Demonstration 1 — Recursive and iterative Fibonacci, verified

**Proves:** recursion (Module 3), arrays (Module 6), and block-scoped local state (Module 2), together in one program — and a genuinely interesting ALGOL 68 syntax detail found while verifying it.

```algol68
PROC fib rec = (INT n) INT:
   IF n <= 1 THEN n ELSE fib rec(n - 1) + fib rec(n - 2) FI;

BEGIN
   [0:9] INT table;
   table[0] := 0;
   table[1] := 1;
   FOR i FROM 2 TO 9 DO
      table[i] := table[i - 1] + table[i - 2]
   OD;

   print(("iterative table: ", newline));
   FOR i FROM 0 TO 9 DO print((table[i], " ")) OD;
   print((newline));

   print(("recursive fib(9) = ", fib rec(9), newline));
   print(("do they agree? ", table[9] = fib rec(9), newline))
END
```

Verified — the exact output:
```
iterative table:
         +0          +1          +1          +2          +3          +5          +8         +13         +21         +34
recursive fib(9) =         +34
do they agree?  T
```

Both approaches agree: `fib(9) = 34`. The iterative version builds the sequence forward into an array, one array-bounded loop; the recursive version (Module 3's technique) computes the same value by breaking the problem down into smaller subproblems — two genuinely different computational strategies converging on an identical, verified answer.

> **A genuine syntax curiosity, found directly while verifying this:** `fib rec` — with a literal space inside the identifier — is valid ALGOL 68 syntax. Reserved words are a small, fixed set; anything else, including a multi-word phrase separated by spaces, is fair game as an identifier, as long as it doesn't exactly collide with a reserved word. This is unusual by the conventions of virtually every later language in this series, and it's a small, direct reminder of how differently ALGOL-family syntax was designed compared to what came after it.

**Practice**

- Time both versions (informally) at a larger `n` (say, 25) and observe the recursive version taking noticeably longer — it recomputes the same subproblems repeatedly, while the iterative version computes each value exactly once. This is the classic "naive recursion vs. memoization/iteration" performance lesson, in its most basic form.
- Rewrite the recursive version to take an accumulator parameter, avoiding the repeated-subproblem recomputation, and compare its speed against the plain recursive version at `n = 25`.

## Demonstration 2 — Tracing Jensen's Device by hand, documented

**Proves:** genuine understanding of call-by-name (Module 5), the closing exercise for this guide's historical thread.

This one isn't executed — it's the practice problem Module 5 set, worked through explicitly, since tracing it by hand *is* the actual skill this module is testing.

**The setup:** `Sum(i, 1, 3, a[i])` with `a = [10, 20, 30]` (using 1-based indexing to match the array).

**The trace:**

| Step | `i` (loop variable, shared with the caller by name) | `term` re-evaluated as `a[i]` | Running `temp` |
|---|---|---|---|
| Start | — | — | `0` |
| Iteration 1 | `i := 1` | `a[1] = 10` | `0 + 10 = 10` |
| Iteration 2 | `i := 2` | `a[2] = 20` | `10 + 20 = 30` |
| Iteration 3 | `i := 3` | `a[3] = 30` | `30 + 30 = 60` |
| Loop ends (`i > hi`) | — | — | `Sum := 60` |

`Sum(i, 1, 3, a[i])` returns `60` — `10 + 20 + 30`, exactly the array sum, produced by a procedure that never once mentions the array `a` in its own definition. The entire mechanism rests on one fact traced explicitly in this table: `i` is shared, by name, between the procedure's own loop and the caller's argument expression, so re-evaluating `term` on each iteration picks up the loop's current `i` automatically.

> **This is the actual point of this whole module:** you could not have produced this trace without genuinely understanding call-by-name's re-evaluation rule from Module 5 — there's no way to "run" your way to this understanding the way every other module in this series let you, since there's no compiler here to check the trace against. The trace itself is the verification.

**Practice**

- Re-run this exact trace for `Sum(i, 1, 3, a[i] * a[i])` (sum of squares) and confirm it produces `10² + 20² + 30² = 1400`.
- Write, in your own words, what would need to change about `Sum`'s definition if ALGOL 60 only had call-by-value — could the same procedure still compute an arbitrary array's sum without modification? (It could not, without passing the array itself as an explicit parameter — which is precisely why this device doesn't exist, or need to exist, in any later language in this series.)

## Progress check

1. What two genuinely different computational strategies does Demonstration 1 verify agree on the same answer?
2. Why is `fib rec`'s recursive version slower than the iterative version at larger `n`, structurally?
3. What ALGOL 68 syntax detail did verifying Demonstration 1 surface, and why is it unusual by later languages' conventions?
4. In the Jensen's Device trace, what specific value does `term` re-evaluate to on iteration 2, and why?
5. Why couldn't Demonstration 2 be "verified by execution" the way every other demonstration in this guide was?

### Answers

1. Recursive decomposition (breaking `fib(n)` into `fib(n-1) + fib(n-2)`) and iterative table-building (computing each value once, forward, storing it in an array) — both produce `fib(9) = 34`.
2. The recursive version recomputes the same smaller subproblems repeatedly (computing `fib(7)` freshly inside both the `fib(8)` and `fib(9)` branches, for instance), while the iterative version computes and stores each value exactly once.
3. That identifiers can contain literal spaces (`fib rec`) as long as they don't exactly collide with a reserved word — a genuine ALGOL 68 syntax allowance, unusual compared to essentially every later language in this series, which treats whitespace as a token separator that could never appear inside a single identifier.
4. `20` — because `i` has been set to `2` by that point in the shared loop, and `term` re-evaluates the expression `a[i]` fresh using that current value.
5. There's no ALGOL 60 compiler available to run it against (Module 5's central point), and ALGOL 68 doesn't implement call-by-name at all — the only way to confirm understanding of this mechanism is to trace the substitution rule by hand and check the trace's internal logic, which is exactly what this demonstration did.
