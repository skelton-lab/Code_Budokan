# Module 3 — Capstone 1: Kinship Knowledge Base

**Proves:** facts vs. rules, unification, backtracking, recursive predicates, `findall/3` (Modules 1–2).

A family tree as a Prolog database, with derived relations (`sibling`, `grandparent`, `aunt_or_uncle`, `cousin`) built entirely from two kinds of base fact — `parent/2` and gender — using nothing but unification and backtracking. Every query below was run and its actual output recorded.

## The knowledge base

```prolog
parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).
parent(liz, sue).
parent(pat, jim).

male(tom).
male(bob).
male(pat).
male(jim).
female(liz).
female(ann).
female(sue).

father(X, Y) :- parent(X, Y), male(X).
mother(X, Y) :- parent(X, Y), female(X).

sibling(X, Y) :- parent(P, X), parent(P, Y), X \= Y.

grandparent(X, Y) :- parent(X, Z), parent(Z, Y).

aunt_or_uncle(X, Y) :- sibling(X, P), parent(P, Y).

cousin(X, Y) :- parent(P1, X), parent(P2, Y), sibling(P1, P2).
```

Six base facts about who's whose direct parent, seven about gender, and five rules — every one of them Module 1's `Head :- Body` pattern or Module 2's recursion-free conjunction — derive every other relation in the family tree.

## Verified queries

```
?- findall(X-Y, father(X,Y), L).
L = [tom-bob, tom-liz, bob-ann, bob-pat, pat-jim].

?- findall(X, sibling(bob,X), L).
L = [liz].

?- findall(X, grandparent(tom,X), L).
L = [ann, pat, sue].

?- findall(X, aunt_or_uncle(X,ann), L).
L = [liz].

?- findall(X, cousin(sue,X), L).
L = [ann, pat].

?- findall(X, cousin(jim,X), L).
L = [].
```

Every one of these ran exactly as written, with no hand-adjustment after the fact. `cousin(jim, X)` correctly returns the empty list — `jim`'s only parent, `pat`, has one sibling (`ann`), and `ann` has no children in this six-fact family tree, so there's genuinely no cousin for the rule to find; an empty result here is the *correct* answer, not a bug to chase.

> **Pitfall:** `sibling/2` as written unifies with `X \= Y` to exclude a person being their own sibling, but it doesn't exclude a *reverse duplicate* — querying `sibling(X, Y)` with both arguments unbound would return `bob-liz` and, separately, `liz-bob`, as two distinct solutions, since nothing in the rule says those are "the same" answer. This is worth noticing here because it's the same shape of surprise `append(X, Y, [1,2,3])` produced in Module 2 (multiple structurally-valid answers where an imperative instinct expects one) — a Prolog relation reports every way it can be made true, not a canonical single answer, unless you write something that specifically prevents duplicates.

## Testing it with `plunit`

This guide's verification-discipline thread — Fortran's `check()`, the 6502 guide's memory-plus-C-harness technique, C/C++'s sanitizers, JavaScript's `bun test`, Ruby's `minitest` — has a direct Prolog counterpart: SWI-Prolog ships `library(plunit)`, predicate-level tests with the same "write it, run it, get a real pass/fail" discipline as every prior guide's testing story.

```prolog
:- use_module(library(plunit)).

:- begin_tests(kinship).

test(tom_is_bobs_father) :-
    father(tom, bob).

test(bob_and_liz_are_siblings) :-
    sibling(bob, liz).

test(tom_is_grandparent_of_ann) :-
    once(grandparent(tom, ann)).

test(sue_and_ann_are_cousins) :-
    cousin(sue, ann).

test(jim_has_no_cousins, fail) :-
    cousin(jim, _).

:- end_tests(kinship).
```

Verified: `swipl -q -g run_tests -t halt kinship_test.pl` reports all five tests passed.

> **Pitfall, real and verified:** the first draft of `tom_is_grandparent_of_ann` was written without `once/1`, as plain `grandparent(tom, ann)`. It still passed — but `plunit` additionally printed a warning: *"Test succeeded with choicepoint"*. A `plunit` test predicate that succeeds while leaving an unexplored choice point behind (Module 2's backtracking mechanism, again) means the test only checked that *one* proof exists, while silently leaving open whether backtracking into it could ever produce a different, unintended result — `plunit`'s own convention is that a test should commit to a single definite outcome. Wrapping the goal in `once/1` (formally introduced in Module 4 — for now, read it as "stop after the first solution, don't leave a choice point open") is the fix, and it's what made the warning disappear on the second run, verified directly.

## Practice

- Add `parent(sue, kim)` and `female(kim)`, then extend the test suite with a case confirming `cousin(jim, kim)` now succeeds (it shouldn't — `kim` is `sue`'s child, not a cousin of `jim` — write the test as a `fail`-expected case, the same pattern `jim_has_no_cousins` used).
- Write a `great_grandparent/2` rule reusing `grandparent/2` and `parent/2`, and add a `plunit` test for it against this family tree.
- Rewrite `sibling/2` to return only one of `bob-liz`/`liz-bob`, not both, using `@<` (SWI's standard order of terms comparison) instead of `\=` — verify the fix actually halves the result count for `findall(X-Y, sibling(X,Y), L)`.
