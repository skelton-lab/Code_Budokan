# Module 9 — Capstone 4: A Rule-Based Expert System

**Proves:** cut semantics, negation-as-failure, `assert`/`retract`/`:- dynamic` (Module 8).

A small animal-classification expert system — the canonical Prolog demonstration domain, for good reason: static classification *rules* (which never change) reasoning over dynamic *observations* (which arrive, change, and get retracted during a live session), exactly the split Module 8 built toward. Every diagnosis below is a real, verified run.

## The knowledge base

```prolog
:- dynamic(observed/2).

is_a(Animal, bird) :-
    observed(Animal, has_feathers), !.
is_a(Animal, bird) :-
    observed(Animal, can_fly),
    observed(Animal, lays_eggs), !.
is_a(Animal, mammal) :-
    observed(Animal, has_fur), !.
is_a(Animal, mammal) :-
    observed(Animal, gives_milk), !.
is_a(Animal, fish) :-
    observed(Animal, has_gills),
    \+ observed(Animal, has_fur), !.

diagnose(Animal, Class) :- is_a(Animal, Class).
```

The rules (`is_a/2`) are fixed at load time, exactly like every earlier guide's static predicates — but what they reason *over*, `observed/2`, is declared `:- dynamic` specifically because a real session builds it up one `assertz/1` at a time as evidence arrives, the same mechanism Module 8 verified directly. Each `is_a` clause ends in a cut — this is Module 8's green-cut pattern: once an animal is confirmed a bird via feathers, there's no need to also check the fur/gills rules, and nothing about the clauses below it could have produced a *different* correct answer anyway (an animal with feathers is never simultaneously going to match the mammal rules in this knowledge base). The fish rule's `\+ observed(Animal, has_fur)` is Module 8's negation-as-failure, used correctly — `Animal` is already bound by the time `\+` runs, so it's checking a fully specified fact, not falling into the unbound-variable trap.

## A verified session

```
?- assertz(observed(tweety, has_feathers)), diagnose(tweety, C).
C = bird.

?- assertz(observed(rex, has_fur)), diagnose(rex, C).
C = mammal.

?- assertz(observed(nemo, has_gills)), diagnose(nemo, C).
C = fish.
```

Three animals, three different pieces of asserted evidence, three correct classifications — each one is `observed/2` facts added at runtime, then `diagnose/2` reasoning over whatever's currently in the dynamic database, exactly the way a real expert system accumulates evidence during a live consultation rather than having everything known upfront.

**Incomplete evidence, verified directly:**

```
?- assertz(observed(pingu, lays_eggs)), diagnose(pingu, C).
false.
```

`pingu` with only `lays_eggs` observed correctly fails to classify — the bird rule needs *either* `has_feathers` alone, *or* both `can_fly` and `lays_eggs` together, and `lays_eggs` alone satisfies neither. This is the expert system correctly reporting "not enough evidence yet," not a bug — exactly the kind of clean failure Module 8's `:- dynamic` pitfall predicted for a well-declared predicate with no matching case, rather than an error.

**Adding more evidence changes the diagnosis, live:**

```
?- assertz(observed(pingu, lays_eggs)), assertz(observed(pingu, has_feathers)), diagnose(pingu, C).
C = bird.
```

Verified: the same animal, now correctly classified once `has_feathers` is also asserted — nothing about `is_a/2` changed; only the dynamic evidence did.

**Retracting evidence changes the diagnosis too — the expert system reasons over whatever's currently true, not over history:**

```
?- assertz(observed(x, has_fur)), diagnose(x, C1),
   retract(observed(x, has_fur)), assertz(observed(x, has_gills)),
   diagnose(x, C2).
C1 = mammal, C2 = fish.
```

Verified: the exact same query variable `x` reclassifies from `mammal` to `fish` mid-session, purely because its dynamic fact base changed between the two `diagnose/2` calls — `is_a/2`'s rules never moved; what they were reasoning about did.

> **Pitfall:** this knowledge base has no rule at all for an animal observed with, say, `has_gills` *and* `has_fur` together (an artificial case, but a real gap) — `is_a/2` would try the fish rule, find `\+ observed(Animal, has_fur)` fails (since fur *was* observed), and fall through to no matching clause at all, `diagnose/2` failing cleanly. A real expert system needs either a genuinely complete rule set for every combination the domain can produce, or an explicit `is_a(Animal, unknown) :- true.` catch-all clause at the very end — and per Module 8's red-cut lesson, that catch-all would need to come *after* every specific rule, relying on their cuts to have already ruled out anything more specific, which is precisely the red-cut pattern Module 8 flagged as needing care, not blind copying.

## Practice

- Add a reptile rule (`has_scales`, no `has_fur`, no `has_feathers`) and verify a new animal classifies correctly through it.
- Add the `is_a(Animal, unknown) :- true.` catch-all from this module's pitfall, confirm it correctly classifies an animal with no matching evidence as `unknown` instead of failing `diagnose/2` outright, and confirm every previously-correct classification (`tweety`, `rex`, `nemo`) still comes out right rather than being swallowed by the catch-all.
- Write a `retract_all_observations(Animal)` helper using `retractall/1` (not covered directly in Module 8 — look up its signature) that clears every `observed/2` fact for one animal in a single call, and use it to reset `pingu` mid-session before re-diagnosing from scratch.
