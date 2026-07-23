# Module 2 — Recursion, Backtracking, and Lists

Module 1 established that a query can have more than one solution. This module makes that fact load-bearing: recursive rules that search arbitrarily deep, the actual backtracking mechanism producing multiple answers one at a time, and lists — Prolog's one built-in structured-data type, itself defined recursively. Every example verified via `swipl`. Feeds Capstone 1.

## Recursive rules

**You'll be able to:** write a rule that calls itself to search an arbitrarily deep relation, with a correct base case.

**Concept**

A recursive Prolog rule needs exactly what recursion needs in any language — a base case and a case that reduces toward it — but what's being "searched" is the database itself, not a data structure you're walking by hand. The classic example: `parent/2` only knows direct parents; `ancestor/2` needs to reach arbitrarily far back, which no fixed number of `parent` chains can express.

```prolog
ancestor(X, Y) :- parent(X, Y).                       % base case: direct parent
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).        % recursive case: parent of an ancestor
```

**Example**

```prolog
parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).
parent(pat, jim).

ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).
```

Verified: `findall(X, ancestor(X, jim), L)` reports `L = [pat, tom, bob]`. That specific order is worth tracing once, because it's not "closest ancestor first" — it's a direct consequence of clause order and depth-first search: the base-case clause runs first and immediately finds `pat` (`parent(pat, jim)` is a stored fact); only then does the recursive clause run, trying each `parent(X, Z)` fact in file order and checking whether `ancestor(Z, jim)` holds for each `Z`, finding `tom` (via `Z = bob`) before `bob` (via `Z = pat`) purely because `parent(tom, bob)` was written before `parent(bob, pat)` in the source file.

> **Pitfall:** the order of the two clauses matters for *which solution comes first*, not for *correctness* — swapping them still finds all three ancestors, just in a different sequence. But putting the recursive clause before a properly-guarded base case in a rule that doesn't already have one *does* matter for correctness: a recursive call with no way to ever hit a base case searches forever (or until the stack is exhausted) rather than failing cleanly. This guide's Capstone 2 module hits a real, verified instance of exactly this failure mode.

**Practice**

- Trace by hand why `ancestor(X, jim)` doesn't return `bob` before `tom`, using the clause-order-plus-fact-order explanation above, then verify against `swipl`.
- Write `descendant(X, Y) :- ancestor(Y, X).` and confirm it correctly reverses the relation without needing its own recursive case.

## Backtracking: how multiple solutions actually happen

**You'll be able to:** explain, mechanically, what happens when Prolog is asked for another solution.

**Concept**

Every choice point — a fact or rule clause that *could* have matched, but wasn't necessarily the only one — is remembered. When a goal later fails (or the user explicitly asks for another answer), Prolog **backtracks**: it rewinds to the most recent choice point, undoes whatever bindings happened after it, and tries the next alternative there. This is not a special mechanism reserved for search problems — it's what `likes(john, X)` returning two separate answers in Module 1 was doing the entire time, and it's what let the `ancestor` recursion above explore every possible chain of `parent` facts without any explicit loop.

**Example**

```prolog
?- ancestor(X, jim).
X = pat ;
X = tom ;
X = bob.
```

At the interactive toplevel, typing `;` after each answer explicitly asks Prolog to backtrack and find the next one; a bare `.` (or Enter) commits to the current answer and stops searching. This guide verifies multi-solution behavior programmatically instead, with `forall/2` (run a goal for every solution, as a side-effecting loop) or `findall/3` (collect every solution into a list):

```prolog
?- forall(ancestor(X, jim), (write(X), nl)).
pat
tom
bob
true.
```

Verified: this produces the same three answers, in the same order, as the interactive `;` sequence — `forall` is exactly "backtrack through every solution," made explicit and automatable rather than typed by hand at a prompt.

> **Pitfall:** `forall(Goal, Action)` reports success even when `Goal` has *zero* solutions — it means "for every solution of Goal, Action holds," which is vacuously true if there are no solutions at all, not "Goal must succeed at least once." Confirming "does this relation hold for anyone" needs a direct query (`ancestor(_, someone)`) or `\+ \+` (Module 8), not `forall` alone.

**Practice**

- Predict how many solutions `findall(X, parent(tom, X), L)` returns and in what order, then verify.
- Explain, in terms of choice points, why `likes(john, mary)` (Module 1, no variables at all) has no backtracking to do — succeed or fail, with nothing left to retry.

## Lists: Prolog's one built-in structured type

**You'll be able to:** write a predicate that recurses over a list, and use the standard library predicates for the common cases.

**Concept**

A Prolog list is written `[1, 2, 3]`, but under the syntax it's a chain of two-argument compound terms — conceptually `.(1, .(2, .(3, [])))` — a head and a tail, all the way down to the empty list `[]`. `[H|T]` pattern-matches (unifies) `H` against the first element and `T` against everything after it, which is why list recursion always has the same two-clause shape as `ancestor` above: a base case for `[]`, a recursive case for `[H|T]`.

**Example**

```prolog
sum_list_own([], 0).
sum_list_own([H|T], Sum) :- sum_list_own(T, Rest), Sum is H + Rest.
```

Verified: `sum_list_own([1,2,3,4], S)` correctly computes `S = 10`. (`is/2`, the actual arithmetic-evaluation operator used here, gets its own full treatment in Module 4 — for now, read it as "compute the right-hand side and bind the left-hand side to the result.")

The standard library ships the common list operations so hand-writing `sum_list_own` above is a learning exercise, not real practice: `member/2` (is X in this list), `append/3` (concatenate — and, uniquely, *split*, verified below), `length/2` (how many elements).

```prolog
?- member(3, [1,2,3,4]).
true.

?- append([1,2],[3,4],L).
L = [1,2,3,4].

?- append(X, Y, [1,2,3]).
X = [], Y = [1,2,3] ;
X = [1], Y = [2,3] ;
X = [1,2], Y = [3] ;
X = [1,2,3], Y = [].
```

Verified: `append/3` isn't a one-directional "concatenate" function the way it would be in every prior guide in this series — called with the first two arguments unbound and the third given, it backtracks through *every* way to split the list into two pieces. This is the same relational, any-argument-can-be-the-unknown property Module 1's unification section demonstrated with `point(A, B) = point(3, 4)`, now showing up in a standard-library predicate rather than a toy example.

> **Pitfall:** this multi-directional power isn't free — a predicate written expecting one specific "input/output" argument pattern can behave unexpectedly if called a different way (calling `append(X, Y, Z)` with *all three* unbound generates infinitely many solutions, one per possible list length, and never stops on its own). Module 4's search session covers goal-ordering specifically because of failure modes exactly like this one — a poorly-ordered generate-and-test query can exhaust available memory before ever reaching the constraint that would have ruled most of it out, which this guide hit directly (and will show, verified, output and all) once search is the actual topic.

**Practice**

- Predict, then verify, what `length([a,b,c], N)` binds `N` to, and what `length(L, 3)` (list unbound, length given) produces.
- Rewrite `sum_list_own` to also compute the count of elements alongside the sum, in one pass, using an extra argument.

## Progress check

1. What two things does every correct recursive Prolog rule need, and what happens if the base case is missing or unreachable?
2. Why did `ancestor(X, jim)` return `pat` before `tom`, specifically — what two ordering facts about the source file caused that?
3. What does backtracking actually do, mechanically, at a choice point?
4. Why does `forall(Goal, Action)` succeeding *not* prove `Goal` has at least one solution?
5. What is a Prolog list, structurally, underneath the `[H|T]` syntax?
6. Why can `append/3` be used to split a list into every possible two-piece division, when in most languages `append`/`concat` only goes one direction?

### Answers

1. A base case that terminates the recursion, and a recursive case that reduces toward it (here, one fewer `parent` link to search through). A missing or unreachable base case means the recursive clause can keep trying to satisfy itself indefinitely, which either runs forever or exhausts the stack rather than failing cleanly.
2. The base-case clause (`ancestor(X,Y) :- parent(X,Y)`) is written first and runs first, immediately matching `parent(pat, jim)` — so `pat` is found before any recursive search happens at all. `tom` then comes before `bob` in the recursive clause's search because `parent(tom, bob)` appears before `parent(bob, pat)` in the source file, and depth-first search tries facts in the order they're stored.
3. It rewinds execution to the most recent point where an alternative clause or fact could still match, undoes any variable bindings made since then, and retries with the next alternative.
4. Because "for every solution of Goal, Action holds" is vacuously true when Goal has zero solutions — there's nothing for the universal claim to fail on. Proving Goal succeeds at least once needs a direct query instead.
5. A chain of two-argument compound terms, conceptually `.(Head, Tail)` nested all the way down to the empty list `[]` — `[H|T]` syntax is pattern-matching (unifying) against that same underlying structure, which is why list recursion has the same base-case/recursive-case shape as any other recursive relation.
6. Because `append/3`, like every Prolog predicate, is a *relation* between its three arguments, not a one-directional function — calling it with the first two arguments unbound and the third bound doesn't compute a concatenation, it searches for every combination of the two unbound arguments that would unify with the given result, which for list-splitting means backtracking through every valid split point.
