# Capstone 1 — Pattern Matching: Prolog's Direct Descendant

Combines every concept from Modules 1–2: a family-tree kinship system — `parent`, `grandparent`, `sibling` — solving the *exact* problem `prolog/03-capstone-kinship.md` solved, reimplemented with Erlang's pattern-matched function clauses instead of Prolog's own facts and rules.

## The family tree

```erlang
parent(tom, liz) -> true;
parent(tom, bob) -> true;
parent(liz, ann) -> true;
parent(bob, pat) -> true;
parent(bob, jim) -> true;
parent(_, _) -> false.

grandparent(X, Z) ->
    lists:any(fun(Y) -> parent(X, Y) andalso parent(Y, Z) end,
              [tom, liz, bob, ann, pat, jim]).

sibling(X, Y) when X =/= Y ->
    lists:any(fun(P) -> parent(P, X) andalso parent(P, Y) end,
              [tom, liz, bob, ann, pat, jim]);
sibling(_, _) -> false.
```

`parent/2`'s clauses are the *direct* function-clause equivalent of a Prolog fact base — each specific `parent(X, Y) -> true` clause corresponds exactly to a Prolog fact like `parent(tom, liz).`, and the catch-all `parent(_, _) -> false.` is what an Erlang function needs explicitly (returning `false` rather than simply failing the way an unmatched Prolog goal would). `grandparent`/`sibling` play the role Prolog's own rules would — `parent(X, Y), parent(Y, Z)` becomes `parent(X, Y) andalso parent(Y, Z)`, checked across every candidate `Y` via `lists:any`, since Erlang has no built-in backtracking search the way Prolog's engine does natively (a real, honest difference — Module 2/Capstone 2's actor model gives Erlang other strengths, but automatic backtracking isn't one of them).

## Verification

```erlang
io:format("parent(tom, liz) = ~p~n", [parent(tom, liz)]),
io:format("parent(tom, ann) = ~p~n", [parent(tom, ann)]),
io:format("grandparent(tom, ann) = ~p~n", [grandparent(tom, ann)]),
io:format("grandparent(tom, pat) = ~p~n", [grandparent(tom, pat)]),
io:format("sibling(pat, jim) = ~p~n", [sibling(pat, jim)]),
io:format("sibling(pat, ann) = ~p~n", [sibling(pat, ann)]).
```

```
parent(tom, liz) = true
parent(tom, ann) = false
grandparent(tom, ann) = true
grandparent(tom, pat) = true
sibling(pat, jim) = true
sibling(pat, ann) = false
```

Checked by hand against the family tree (`tom` → `liz`, `bob`; `liz` → `ann`; `bob` → `pat`, `jim`): `tom` is `liz`'s direct parent (`true`), but not `ann`'s (`false` — `liz` is). `tom` is correctly a grandparent of both `ann` (via `liz`) and `pat` (via `bob`). `pat` and `jim` are correctly identified as siblings (both children of `bob`); `pat` and `ann` are correctly identified as *not* siblings (different parents, `bob` and `liz` respectively).

> **The actual point of this capstone, stated honestly:** the *pattern-matching* vocabulary this guide has built — multi-clause functions, guards, matching on structure — transfers directly from Prolog's own facts-and-rules style. What doesn't transfer is Prolog's automatic backtracking search: `grandparent`/`sibling` had to explicitly enumerate candidates (`lists:any` over a fixed list of names) because Erlang has no engine automatically trying every possible binding for `Y` the way Prolog's own resolution does for free. This is a real, honest limit on the Prolog comparison, not glossed over — Erlang inherited Prolog's *pattern-matching* syntax and semantics precisely, but not its *search* engine.

> **Pitfall:** the catch-all `parent(_, _) -> false.` clause is load-bearing — without it, calling `parent(ann, tom)` (a pair with no matching clause at all) would crash with a `function_clause` error rather than cleanly returning `false`. Prolog's own unmatched-goal behavior (simply failing, not crashing) has no automatic equivalent in Erlang function clauses; it has to be provided explicitly.

## Extending it yourself

- Add `X is tom's cousin` logic (`cousin(X, Y)` — sharing a grandparent but not a parent), reusing `grandparent`/`sibling` as building blocks.
- Rewrite `parent/2` to read its facts from a list of `{Parent, Child}` tuples instead of hard-coded function clauses, and use `lists:member/2` to check membership — compare this data-driven style directly against the hard-coded-clauses version for which one reads more like Prolog's own fact base.
