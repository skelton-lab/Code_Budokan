# Module 1 — Foundations: Facts, Rules, and Unification

Every guide in this series before now has taught a language where you write a sequence of steps and the machine executes them. Prolog inverts that completely: you state facts and rules about a world, then *ask questions*, and the machine searches for every way to make your question true. There is no assignment statement anywhere in this module — internalizing that, precisely, is the actual point. Every example below was run through `swipl` and its real output recorded. Feeds Capstone 1.

## Facts, rules, and queries — the relational model

**You'll be able to:** state facts about a world, write a rule that combines them, and ask Prolog a question.

**Concept**

A Prolog program is a **database**: a set of **facts** (unconditionally true relations) and **rules** (relations true when some condition holds), consulted from a `.pl` file. A **query** then asks the database a question, and Prolog searches for bindings that make it true. There's no "calling a function and getting a return value" here — a query either **succeeds** (with the database in a specific state of variable bindings) or **fails** (no way exists to make it true).

```prolog
% facts
likes(mary, wine).
likes(john, wine).
likes(john, mary).
```

A query like `likes(john, mary).` isn't a function call — it's a yes/no question against the database, answered by literally matching the query against stored facts.

**Example**

```prolog
likes(mary, wine).
likes(john, wine).
likes(john, mary).
```

```
?- likes(john, mary).
true.

?- likes(mary, john).
false.

?- likes(john, X).
X = wine ;
X = mary.
```

Verified (`swipl -q -f facts.pl -g "..."`): `likes(john, mary)` succeeds, `likes(mary, john)` fails (no matching fact exists in either direction — Prolog never infers a relation is symmetric just because it looks like it should be), and querying with a variable (`likes(john, X)`) returns *every* fact that matches, one binding per solution — `X = wine`, then, on backtracking, `X = mary`.

A **rule** adds a condition, written `Head :- Body.` ("Head is true *if* Body is true"), where the body can chain several conditions with a comma (logical AND):

```prolog
parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
male(tom).

grandfather(X, Y) :- parent(X, Z), parent(Z, Y), male(X).
```

Verified: querying `grandfather(X, ann)` correctly returns `X = tom` — Prolog finds a `Z` (here, `bob`) such that `parent(tom, Z)` and `parent(Z, ann)` and `male(tom)` are all simultaneously true, entirely by searching the database, with no loop or conditional written anywhere in the rule itself.

> **Pitfall:** a fact like `likes(mary, wine)` looks like it should let you query `likes(wine, mary)` and get the same answer — it won't. Prolog facts aren't symmetric by any built-in rule; a relation only holds in the argument order and direction it was actually stated (or separately derivable via a rule you wrote). If you want symmetry, you write it explicitly: `likes(X, Y) :- likes(Y, X).` — and even then, watch for the infinite-loop trap that specific rule creates, which Module 8's cut session revisits directly.

**Practice**

- Add a fact `likes(mary, john)` and confirm, by hand-tracing the database, that `likes(john, mary)` and `likes(mary, john)` are now two *independent* true facts, not the same fact viewed two ways.
- Write a `sibling(X, Y)` rule from the `parent/2` facts above (`bob` and `liz` should come out as siblings, since they share a parent) and note what it also returns as a sibling of itself if you're not careful.

## Terms: the only kind of data Prolog has

**You'll be able to:** name every category of Prolog term, and tell an atom from a variable from a compound term on sight.

**Concept**

Everything in Prolog — a fact's arguments, a rule's variables, the database itself — is built from exactly four kinds of **term**:

| Term kind | Looks like | Examples |
|---|---|---|
| Atom | Lowercase-starting name, or single-quoted text | `tom`, `wine`, `'Multi Word'` |
| Number | Integer or float, ordinary syntax | `42`, `3.14` |
| Variable | Uppercase-starting name, or `_` | `X`, `Parent`, `_` (anonymous) |
| Compound term | A functor name plus arguments in parentheses | `parent(tom, bob)`, `point(3, 4)` |

Case is not a style convention here the way it is in every other language this series has covered — it's syntax the reader *must* determine meaning from: `tom` is an atom (a fixed, specific value, like a symbol); `X` is a variable (an unbound placeholder, or a name currently standing in for whatever it's been bound to). Verified: `atom(tom)` reports `true` in SWI-Prolog; a bare `Tom` in the same position is parsed as a variable, not the same term as the atom `tom`, no matter how visually similar they look.

**Example**

```prolog
?- X = point(3, 4).
X = point(3, 4).

?- X = point(3, 4), point(A, B) = X.
X = point(3, 4),
A = 3,
B = 4.
```

Verified: `point(3, 4)` is a compound term with functor `point` and arity 2 — indistinguishable, structurally, from how `parent(tom, bob)` was used as a fact above. A fact and a piece of data are the same kind of thing in Prolog; the only difference is whether it's stored directly in the database or appears as the value of a query.

The anonymous variable `_` means "I need a placeholder here, but I don't care what it binds to, and I don't want to give it a name":

```prolog
?- parent(tom, _).
true.
```

Verified: this succeeds (`tom` does have at least one child in the earlier facts) without ever reporting *which* child — using a named variable there would report the binding; `_` deliberately discards it.

> **Pitfall:** a variable that starts with a lowercase letter isn't a syntax error — it's not a variable at all. `x = 5` doesn't do anything resembling assignment; it attempts to *unify* the atom `x` with the number `5`, which simply fails, silently, with no complaint about your intent being unclear. Capitalization is the entire signal Prolog uses to decide "is this a fixed value or a placeholder," and getting it backwards produces a program that runs and quietly does the wrong thing rather than one that refuses to compile.

**Practice**

- Classify each of the following as atom, number, variable, or compound term: `foo`, `Foo`, `42`, `foo(42)`, `_Result`, `'foo bar'`.
- Explain why `parent(tom, bob)` can be used both as a stored fact and as a piece of data passed around in a query — what does that tell you about what a "fact" actually *is* in Prolog?

## Unification: the one operation everything else is built from

**You'll be able to:** predict exactly what `=` does given any two terms, including when it should fail.

**Concept**

`=` is not assignment. `=` attempts **unification**: given two terms, find the most general substitution of variables that makes them identical, or fail if none exists. This single operation is also, silently, what happens every time a query is matched against a fact or a rule head — Module 1's very first example (`likes(john, X)` matching `likes(john, wine)`) was unification the whole time, just not named yet.

The rules, precisely:
- An atom unifies only with the identical atom.
- A number unifies only with the identical number.
- An unbound variable unifies with *anything*, and becomes bound to it.
- A compound term unifies with another compound term only if the functor names match, the arity matches, *and* every corresponding argument unifies (recursively).

**Example**

```prolog
?- X = 1+2.
X = 1+2.

?- X = 1+2, X == 3.
false.
```

Verified: `X = 1+2` binds `X` to the *compound term* `+(1, 2)` — it does not evaluate the arithmetic. Confirming that: `X == 3` (structural equality, not unification) reports `false`, because `X` is bound to `1+2`, a two-argument compound term with functor `+`, not the number `3`. Module 4 covers `is/2`, the actual arithmetic-evaluation operator, and the sharp `is` vs. `=` distinction this exact confusion causes.

```prolog
?- foo(1,2) = bar(1,2).
false.

?- foo(1,2) = foo(1,2,3).
false.
```

Verified: both fail — different functor name in the first case, different arity in the second. Unification requires the term's *shape*, not just its contents, to match.

> **Pitfall, and a real, documented SWI-Prolog default worth knowing precisely:** ISO-standard unification includes an **occurs check** — refusing to bind a variable to a term that contains that same variable, since that would create an infinite structure. SWI-Prolog's `=` does **not** perform this check by default, for performance reasons shared by most Prolog implementations. Verified directly: `X = f(X)` *succeeds* in SWI-Prolog, silently creating a cyclic term — `acyclic_term(X)` afterward correctly reports `false` (cyclic). The safe alternative, `unify_with_occurs_check/2`, exists precisely for this case and correctly fails on the same input (also verified). This isn't a hypothetical footgun; it's the default behavior of the exact `=` this guide uses everywhere else.

**Practice**

- Predict, then verify with `swipl`, what `point(X, 4) = point(3, Y)` binds `X` and `Y` to.
- Predict, then verify, whether `f(X, X) = f(1, 2)` succeeds or fails, and explain why in terms of the "recursively unify every argument" rule above.
- Explain, in one sentence, why a query like `likes(john, mary)` from this module's first session is really just unification between the query term and a stored fact term — with no variables to bind, so it either matches exactly or it doesn't.

## Progress check

1. What does a Prolog fact actually assert, and what's fundamentally different about querying it compared to calling a function in every other language this series has covered?
2. Why doesn't `likes(mary, wine)` let you also query `likes(wine, mary)` successfully?
3. What are the four kinds of Prolog term, and what's the one syntactic signal (not a keyword, not punctuation) that distinguishes an atom from a variable?
4. What does `X = 1+2` actually bind `X` to, and why does `X == 3` afterward report `false`?
5. What does SWI-Prolog's `=` do by default when asked to unify a variable with a term containing that same variable, and what predicate exists specifically to get ISO-correct occurs-check behavior instead?
6. Why does a query like `parent(tom, X)` against a database of facts return multiple answers instead of just one?

### Answers

1. A fact asserts that a relation unconditionally holds for specific arguments — it's stored data, not executable steps. Querying it doesn't "run" anything; it asks whether the query term can be matched (unified) against what's stored, succeeding or failing, possibly with variable bindings, rather than returning a computed value.
2. Because Prolog facts are exactly what you wrote and nothing more — there's no built-in notion of relational symmetry. `likes(mary, wine)` and `likes(wine, mary)` are two structurally different, entirely independent facts; only the first was ever asserted.
3. Atoms, numbers, variables, and compound terms. The signal is capitalization: a name starting with an uppercase letter (or `_`) is a variable; a name starting lowercase is an atom.
4. `X` is bound to the compound term `+(1, 2)` (written `1+2`) — `=` unifies, it never evaluates arithmetic. `X == 3` checks structural equality between `X`'s current binding and the number `3`; a two-argument `+` compound term is not structurally identical to a number, so it reports `false`.
5. It succeeds without checking, silently producing a cyclic (self-referential, effectively infinite) term — verified directly, and confirmed cyclic via `acyclic_term/1`. `unify_with_occurs_check/2` performs the ISO-correct check and correctly fails on the same input.
6. Because unification against a variable-containing query can match more than one stored fact — `parent(tom, X)` unifies against every fact whose first argument is `tom`, and Prolog reports each successful match as a separate solution on backtracking (formalized in Module 2), rather than stopping after the first.
