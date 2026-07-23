# Module 5 — Capstone 2: N-Queens, Two Ways

**Proves:** arithmetic, generate-and-test, `between/3`/`permutation/2`, cut-adjacent pruning via search order, and — in the extension — `library(clpfd)`, the idiomatic way real Prolog code actually solves this class of problem (Module 4).

Place N queens on an N×N board so none attacks another — the canonical Prolog search problem, built first the way Module 4's generate-and-test pattern naturally leads, then rebuilt with constraint logic programming to show exactly what that idiom buys you. Every number below is a real, measured run, not an estimate.

## The generate-and-test solver

```prolog
queens(N, Qs) :- numlist(1, N, Ns), permutation(Ns, Qs), safe(Qs).

safe([]).
safe([Q|Qs]) :- safe(Qs, Q, 1), safe(Qs).

safe([], _, _).
safe([Q|Qs], Q0, D0) :-
    Q0 =\= Q + D0,
    Q0 =\= Q - D0,
    D1 is D0 + 1,
    safe(Qs, Q0, D1).
```

`Qs` is a list where position `I` holds the column of the queen in row `I` — since no two queens can share a column by construction (`permutation/2` of `1..N` never repeats a value), only row and diagonal safety need checking. `numlist(1, N, Ns)` builds `[1, 2, ..., N]`; `permutation(Ns, Qs)` generates every reordering of it (Module 2's `append(X,Y,[1,2,3])` relational-splitting idea, generalized to full permutations); `safe/1` filters out any permutation with two queens on the same diagonal, checking each queen against every queen after it with a growing distance `D0`.

**Verified:**

```
?- queens(4, Qs).
Qs = [2, 4, 1, 3].

?- findall(Qs, queens(4, Qs), L).
L = [[2,4,1,3], [3,1,4,2]].
```

4-queens has exactly two solutions — matches the textbook-known count for N=4 — found by generating all 24 permutations of `[1,2,3,4]` and keeping the 2 that are diagonal-safe.

**Verified timing**, same solver, increasing `N`:

| N | Solutions | Wall time |
|---|---|---|
| 8 | 92 | 0.097s |
| 10 | 724 | 8.8s |
| 11 | 2,680 | 108.3s (1:48) |

92 solutions for 8-queens matches the well-known textbook result. But the timing column is the actual point: going from N=10 to N=11 — one more queen — took the runtime from under 9 seconds to nearly two minutes. `permutation/2` generates *all* `N!` orderings before `safe/1` gets to reject the unsafe ones; the search space grows factorially while the useful answers grow much more slowly, and nothing about this solver prunes a bad partial placement before it's already a complete permutation.

> **Pitfall:** this is Module 4's "constrain early" lesson at a larger scale, not a new one — `safe/1` only runs *after* `permutation/2` has already committed to a complete arrangement. A smarter pure-Prolog version would check each queen against previously-placed queens *as it places them*, failing (and backtracking) immediately on the first conflict instead of building the whole permutation first — genuinely better, but still fundamentally a "generate, then discover it was wasted work" search. The extension below solves the same problem with a mechanism that never generates a doomed placement in the first place.

## The `clpfd` extension: constraints, not generate-then-test

**Concept**

`library(clpfd)` (constraint logic programming over finite domains) inverts the order: instead of generating a complete candidate and testing it, you state the *constraints* a solution must satisfy — as relations between variables that are still only *partially* determined — and the constraint solver propagates them continuously, ruling out impossible values as early as possible, often before a single queen is ever concretely placed. `#=`, `#\=`, and friends are `clpfd`'s constraint-aware versions of `=:=`/`=\=` — they work on domain variables (a variable that isn't one fixed number yet, but a *range* of remaining possibilities), which plain arithmetic (`is`, `=:=`) cannot do at all.

```prolog
:- use_module(library(clpfd)).

queens(N, Qs) :-
    length(Qs, N),
    Qs ins 1..N,
    safe_queens(Qs),
    label(Qs).

safe_queens([]).
safe_queens([Q|Qs]) :- safe_queens(Qs, Q, 1), safe_queens(Qs).

safe_queens([], _, _).
safe_queens([Q|Qs], Q0, D0) :-
    Q0 #\= Q,
    abs(Q0 - Q) #\= D0,
    D1 is D0 + 1,
    safe_queens(Qs, Q0, D1).
```

`Qs ins 1..N` declares every queen's column as a domain variable ranging over `1..N` — not yet a specific number. `safe_queens/1` states the column-difference and diagonal constraints *before* anything is bound; `clpfd` narrows each variable's remaining possible values as constraints are added, often eliminating most of the search space before `label/1` (which does the actual, much smaller, remaining search) ever runs.

**Verified timing**, identical problem, identical N values, `clpfd` in place of `permutation`+`safe`:

| N | Solutions | Wall time (pure) | Wall time (`clpfd`) |
|---|---|---|---|
| 8 | 92 | 0.097s | 0.032s |
| 11 | 2,680 | 108.3s | 1.14s |
| 20 | (first solution only) | not attempted — would take a very long time | 2.49s |

N=11 alone: **108 seconds down to 1.14 seconds**, same answer count, same machine, verified back to back. N=20 wasn't even attempted with the pure generate-and-test version — `20!` orderings is not a search a permutation-based solver finishes in a reasonable session — while `clpfd` finds a first placement in under 3 seconds.

> **Pitfall:** `clpfd`'s constraint operators (`#=`, `#\=`, `#<`, etc.) are not drop-in replacements for `is`/`=:=`/`=\=` — they specifically work over domain variables declared with `ins` (or `in`), and mixing plain arithmetic into a `clpfd` program on a variable that's still a domain (not yet a concrete number) raises an error, the same "not sufficiently instantiated" category of failure Module 4 flagged for `is/2`, for a closely related reason: both need their variables to already carry the kind of value the operator can act on.

## Practice

- Extend the pure-Prolog solver's `safe/1` to fail as soon as it finds one conflict, without finishing the diagonal check for the rest of the list (a first step toward "prune during generation" — full early-exit pruning via cut is Module 8's territory).
- Time your own machine's N=10 run for both solvers and confirm the same order-of-magnitude gap this module measured (exact numbers will vary by hardware; the *ratio* shouldn't).
- The classic cryptarithmetic puzzle `SEND + MORE = MONEY` (each letter a distinct digit, no leading zero) is a `clpfd` problem, not a generate-and-test one — `all_different/1` plus one linear `#=` constraint over eight digit variables solves it directly. Write it, and confirm your solver finds the unique answer (`S=9, E=5, N=6, D=7, M=1, O=0, R=8, Y=2` — i.e., `9567 + 1085 = 10652`).
