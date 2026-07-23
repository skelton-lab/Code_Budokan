# Final Assessment

Across all seven modules. Try each on paper first.

1. What specific problem was Simula I originally built to solve, and what does the name literally mean?
2. What Turing Award citation did Dahl and Nygaard jointly receive?
3. What single conceptual change turns an ALGOL block into a Simula class?
4. What does `Ref(Point)` declare, and what's the documented difference between `:-` and `:=`?
5. How does Simula express "class B inherits from class A," and what mental model does that phrasing emphasize differently from `extends`/`:` syntax?
6. What does declaring a procedure `Virtual` guarantee about how a call to it resolves?
7. Is C++'s `virtual` keyword an independently-chosen word, or something more direct — and what's the evidence either way?
8. What can a coroutine do that an ordinary procedure call can't, and why did simulating many independent entities specifically need that capability?
9. What three Simula ideas did Stroustrup identify as the core of "C with Classes," and what did he deliberately leave behind?
10. What's this guide's confidence level on the big-picture Simula-to-C++ narrative, and why is that confidence level justified despite having no compiler to verify anything against?
11. How does Smalltalk's later, different direction (Module 7's forward pointer) help you read C++'s design choices more precisely, once you've seen both?

## Answers

1. Discrete-event simulation — modeling systems of many independent, stateful entities whose states change at distinct points in simulated time. "SIMULA" is literally "SIMUlation LAnguage."
2. The 2001 ACM Turing Award, "for ideas fundamental to the emergence of object-oriented programming."
3. Persistence — the block's local state, instead of ceasing to exist when the block "ends," is given its own independent lifetime through object creation, outliving the call that created it.
4. `Ref(Point)` declares a reference to a `Point` object, distinct from a plain value. `:-` is reference assignment ("make this variable refer to that object"); `:=` is value assignment ("copy this value in") — a distinction most later languages collapsed into a single operator, using the variable's declared type to determine which behavior applies.
5. By writing the superclass name as a prefix directly in front of the subclass's own `class` declaration (`A class B`). This phrasing emphasizes structural/textual composition ("B is A, with something added onto it") rather than taxonomic specialization ("B is a specialized kind of A," the framing `extends`/`:` syntax emphasizes).
6. That a call to it, made through a reference to the base class, dispatches to whichever redefinition belongs to the object's actual, concrete type — not necessarily the base class's own version.
7. Something more direct — Stroustrup's own published account states he carried Simula's own term across for the identical mechanism. The evidence is primary-sourced (Stroustrup's own writing), not inferred from similarity alone.
8. A coroutine can suspend itself mid-execution, retaining its own local state exactly as it was, and later be resumed from precisely that point. Simulating many independent entities needed this because each entity requires its own persistent, in-progress state while only one entity can actually execute on real hardware at any given moment — coroutines let entities take turns without losing individual progress between turns.
9. The class as a unit combining data and its operating procedures, inheritance for building specialized classes from general ones, and virtual procedures for dynamic dispatch. He left behind Simula's coroutine-based simulation-scheduling framework, since his actual problem (general systems programming) didn't need it.
10. High confidence on the big-picture narrative, since it's corroborated across Stroustrup's own primary-source writing (his book, his HOPL-II paper) and isn't seriously historically disputed — explicitly lower, unclaimed confidence on precise year-by-year chronology of every individual feature, which would need direct primary-source verification this guide didn't independently perform beyond citing the well-established headline narrative.
11. Simula and Smalltalk both descend from "objects with their own state" but land in different places — Simula keeping ALGOL's static, compiled discipline with `Virtual` as a bounded dynamic-dispatch mechanism; Smalltalk making everything dynamically message-passed with no compile-time class-checking at all. Seeing both makes it clear that C++ (Module 6) is a specific, deliberate choice — structurally much closer to Simula's static discipline than to Smalltalk's fully dynamic model — rather than "the obvious" way to add objects to a language.
