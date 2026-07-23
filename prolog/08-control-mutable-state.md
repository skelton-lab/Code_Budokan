# Module 8 — Control and Mutable State

Two things that don't fit the pure relational model this guide has used since Module 1: explicit control over backtracking (cut), and a way to change the database at runtime instead of only ever reading it (`assert`/`retract`). Both are used constantly in real Prolog and both have sharp, well-documented edges — this module hits the canonical version of each, verified directly. Feeds Capstone 4.

## Cut: green cuts and red cuts

**You'll be able to:** use `!` to prevent wasted backtracking, and recognize the specific case where a cut silently becomes load-bearing for correctness rather than just performance.

**Concept**

`!` (cut), placed in a clause body, commits to every choice made so far in that clause **and** discards any remaining alternative clauses for the current call — once execution passes a cut, there's no backtracking into it. The distinction that matters in practice: a **green cut** only removes redundant backtracking that would have failed anyway (a pure optimization — removing it changes nothing about *which* answers a query produces, only how much wasted search happens finding them). A **red cut** changes the actual set of answers if removed — the clauses after it were relying on the cut to have already ruled something out, not on their own guard conditions.

**Example — a green cut**, every clause independently guarded:

```prolog
sign_green(N, negative) :- N < 0, !.
sign_green(N, zero) :- N =:= 0, !.
sign_green(N, positive) :- N > 0.
```

Verified: `findall(X, sign_green(-3, X), L)` gives `[negative]` — and removing every `!` from this version (tested directly, `sign_green_nocut/2`) gives the exact same `[negative]`. The cuts here are genuinely optional: each clause's own guard (`N < 0`, `N =:= 0`, `N > 0`) already makes the three clauses mutually exclusive, so no combination of inputs could ever produce a second, spurious answer even without the cut — it only stops Prolog from *trying* the later, doomed guards.

**Example — a red cut**, the third clause left unguarded:

```prolog
sign_red(N, negative) :- N < 0, !.
sign_red(N, zero) :- N =:= 0, !.
sign_red(N, positive).
```

Verified: **with** the cuts, `findall(X, sign_red(-3, X), L)` correctly gives `[negative]`. **Without** them (tested directly, `sign_red_nocut/2`, identical clauses minus `!`), the same query gives `[negative, positive]` — a genuinely wrong extra answer, because the third clause has no guard of its own at all and matches *any* `N` once the first two clauses have been tried and backtracked past. The cut in `sign_red`'s first two clauses isn't an optimization here — it's the only thing preventing the unguarded third clause from firing when it shouldn't.

> **Pitfall, verified precisely:** the difference between these two versions isn't visible by reading the clause that has the cut — it's determined by whether the *other* clauses have their own independent guards. `sign_red`'s third clause, `sign_red(N, positive).`, looks completely ordinary in isolation; its correctness silently depends on cuts in two clauses above it having already run. This is exactly why a red cut is considered a real Prolog code smell even when it "works": the correctness of one clause is coupled to control-flow decisions made in a different clause entirely, which nothing in the third clause's own text reveals.

**Practice**

- Rewrite `sign_red` to be a green cut by adding `N > 0` as an explicit guard to the third clause, and verify the cut becomes removable without changing any query's results.
- Predict, then verify, what `findall(X, sign_red(0, X), L)` returns with and without the cuts — does zero exhibit the same red-cut symptom negative numbers did?

## If-then-else

**You'll be able to:** write `( Cond -> Then ; Else )` and explain what it compiles down to.

**Concept**

`( Cond -> Then ; Else )` is Prolog's if-then-else: try `Cond`; if it succeeds (at least once), commit to that (as if a cut ran right after `Cond`) and run `Then`; if `Cond` fails, run `Else` instead, without ever trying `Then`. It's built from the same cut mechanism as the previous session, just packaged as a single, deterministic-by-construction control structure instead of a manually-placed `!`.

**Example**

```prolog
classify(N, R) :- ( N < 0 -> R = negative ; N =:= 0 -> R = zero ; R = positive ).
```

Verified: `classify(-3, R1), classify(0, R2), classify(5, R3)` gives `R1 = negative, R2 = zero, R3 = positive` — the same three-way result `sign_green/2` produced, written as one clause instead of three. `findall(R, classify(-3, R), L)` confirms `L = [negative]` with no leftover choice point (the same `plunit`-flagged concern from Capstone 1's `grandparent` test) — `->` commits automatically, the way `sign_green`'s explicit cuts had to be written by hand.

> **Pitfall:** `( Cond -> Then ; Else )` commits to `Cond`'s *first* solution only, exactly like a cut placed right after it — if `Cond` itself could have multiple solutions and a later part of the program needed to explore them, if-then-else silently forecloses that, the same way an overeager cut would. It's the right tool for genuinely if-this-then-that-else-the-other logic; it's the wrong tool anywhere you actually wanted `Cond`'s backtracking preserved.

**Practice**

- Rewrite `sign_green/2` from the previous session as a single clause using nested if-then-else, and confirm it produces identical results to the three-clause, explicit-cut version for `-3`, `0`, and `5`.

## Negation-as-failure and its real unsoundness

**You'll be able to:** use `\+/1` correctly, and recognize the specific, well-documented case where it gives a wrong-looking answer for a structural reason, not a bug in your logic.

**Concept**

`\+ Goal` succeeds if `Goal` has **no** solution, and fails if `Goal` has at least one — this is **negation as failure**, and it is explicitly *not* the same thing as logical negation, a distinction that matters the moment `Goal` contains an unbound variable. Prolog operates under the **closed-world assumption**: anything it can't prove true is treated as false, which is a reasonable, useful approximation right up until "can't prove true" and "is actually false" come apart.

**Example**

```prolog
likes(mary, wine).
likes(john, wine).

dislikes_wine(X) :- \+ likes(X, wine).
```

Verified: `dislikes_wine(susan)` succeeds (`susan` appears nowhere in the database, so `likes(susan, wine)` has no solution, so `\+` succeeds — closed-world reasoning working as intended). `dislikes_wine(mary)` correctly fails (`mary` does like wine).

**The real gotcha, verified directly:** `dislikes_wine(X)` with `X` **unbound** doesn't enumerate "everyone who doesn't like wine" — it fails outright, unconditionally, with zero solutions. Tracing why: `\+ likes(X, wine)` runs `likes(X, wine)` with `X` still unbound; that inner goal immediately succeeds (`X = mary` is the first matching fact), so `\+` — "does this goal have no solution" — correctly reports that it does have one, and fails. `\+` never binds `X` to anything in the process (whatever it tried internally is undone whether it succeeds or fails), so the outer query is left with nothing at all, not a list of non-wine-drinkers.

> **Pitfall, and the single most commonly cited Prolog gotcha for exactly this reason:** `\+ Goal` is only sound — only means what it looks like it means — when every variable in `Goal` is already bound at the point `\+` runs. `\+ likes(X, wine)` with `X` bound (`dislikes_wine(susan)`, `dislikes_wine(mary)`) behaves exactly as expected. The identical-looking code with `X` unbound doesn't compute "the complement of the set of wine-likers" — it just fails, categorically, the instant the underlying goal succeeds for *any* binding at all. Real Prolog code that needs "everyone except the wine-likers" needs to generate candidates from a known, bounded set first (Module 4's between-before-filter lesson, again) and check `\+ likes(X, wine)` against each *already-bound* candidate — never call `\+` on a goal with an unbound variable and expect it to enumerate anything.

**Practice**

- Fix `dislikes_wine/1` to correctly report every person in a separate `person/1` fact list who doesn't like wine, using a bounded `person(X)` generator before the `\+` check — confirm it now returns a real list instead of failing outright.
- Explain, using this session's exact mechanism, why `\+ \+ Goal` (double negation) is a real, documented Prolog idiom for "test whether Goal succeeds, without keeping any of its bindings" — what does the outer `\+` undo that a single `\+` wouldn't?

## Mutable state: `assert`, `retract`, and `:- dynamic`

**You'll be able to:** add and remove facts from the database while a program runs, and explain why declaring a predicate `dynamic` upfront matters.

**Concept**

Everything so far in this guide has treated the database as fixed at load time. `assertz/1` adds a fact to the *end* of a predicate's clause list; `asserta/1` adds to the *front*; `retract/1` removes the first clause matching what's given. `:- dynamic(Name/Arity)` declares upfront that a predicate may have clauses added or removed at runtime — this is Prolog's one form of ordinary mutable state, deliberately set apart from everything else in this guide, which has been purely relational.

**Example**

```prolog
:- dynamic(likes/2).
likes(mary, wine).
```

Verified: `assertz(likes(mary, tea))` then querying `likes(mary, X)` gives `[wine, tea]` — the new fact added at the end. `asserta(likes(mary, coffee))` (run against the original, unmodified file) gives `[coffee, wine]` — added at the front instead. `retract(likes(mary, tea))`, run after first asserting it, correctly removes exactly that fact, leaving `[wine]`.

> **Pitfall, verified precisely:** calling a predicate that was never declared `dynamic` and has no clauses at all raises an actual error (`Unknown procedure`) — a hard stop, not Module 8's negation-as-failure "unknown means false" convention. Verified separately: a predicate that *was* declared `:- dynamic` but currently has zero matching facts simply **fails**, cleanly, with no error — the same behavior every ordinary predicate call in this guide has had since Module 1. The practical consequence: declare a predicate `dynamic` *before* you ever expect to `assertz` its first fact, even if you're confident something will always be asserted before it's queried — an empty dynamic predicate fails quietly; an undeclared one crashes the program.

**Practice**

- Predict, then verify, what `likes(mary, X)` returns after `asserta(likes(mary, coffee))` *followed by* `assertz(likes(mary, tea))` in the same query, run against the original file — does the earlier `asserta`/`assertz` ordering example's result change if both happen before the query runs?
- Explain, precisely, why a genuinely undefined predicate call is an error while a `:- dynamic`-declared-but-empty one is a clean failure — what does the `dynamic` declaration actually tell Prolog to expect?

## Progress check

1. What's the precise, testable difference between a green cut and a red cut?
2. Why did removing the cuts from `sign_red/2` add a wrong extra answer for `sign_red(-3, X)`, when the exact same removal from `sign_green/2` changed nothing?
3. What does `( Cond -> Then ; Else )` commit to, and what earlier mechanism does that commitment resemble?
4. Why does `dislikes_wine(X)` with `X` unbound fail outright instead of enumerating everyone who doesn't like wine?
5. What's the one condition under which `\+ Goal` behaves the way its name suggests, and what happens when that condition isn't met?
6. Why does calling an undeclared, undefined predicate raise an error, while calling a `:- dynamic`-declared predicate with zero current facts just fails?

### Answers

1. A green cut only removes backtracking that would have failed anyway — every clause it interacts with has its own independent guard, so removing the cut changes nothing about which answers a query produces, only how much extra (doomed) search happens. A red cut is load-bearing for correctness — a later clause has no guard of its own and depends on the cut having already ruled out the cases that clause shouldn't handle; removing it adds genuinely wrong extra answers.
2. Because `sign_red`'s third clause, `sign_red(N, positive).`, has no guard of its own at all — without the cuts in the first two clauses, backtracking reaches it regardless of `N`'s actual sign, so it matches even for `N = -3`. `sign_green`'s third clause has its own `N > 0` guard, so it can never wrongly match a negative number whether or not the earlier cuts are present.
3. It commits to `Cond`'s first solution, exactly as if a cut ran immediately after `Cond` succeeded — the same mechanism cut uses, packaged as a single control structure instead of a manually placed `!`.
4. Because `\+ Goal` never binds `Goal`'s variables in the surrounding context — it runs `likes(X, wine)` with `X` unbound, that inner goal immediately succeeds for the first matching fact (`X = mary`), so `\+` correctly reports "this goal does have a solution" and fails, categorically, with no binding for `X` ever produced or reported.
5. `\+ Goal` is only sound when every variable in `Goal` is already bound before it runs — it then correctly answers "does this fully specified fact hold." With any variable in `Goal` still unbound, it degrades to "does *some* binding of this goal succeed," which fails the moment any single binding works, regardless of which bindings the caller actually cared about.
6. `:- dynamic` tells Prolog to expect this predicate might have zero clauses at some point during execution and to treat that as an ordinary, valid state (fail cleanly) rather than a sign the predicate was never defined at all. Without that declaration, a predicate with no clauses looks indistinguishable from a typo or a genuinely missing definition, which Prolog reports as an existence error instead of silently failing.
