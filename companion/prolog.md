# Companion — Prolog (Budokan Module 12)

**Founding papers:** Colmerauer, A. & Roussel, P. (1993). "The Birth of Prolog." *ACM SIGPLAN Notices*, 28(3), 37–52 (HOPL-II, the same conference as Ritchie's C paper and Kay's Smalltalk paper). Kowalski, R. (1979). "Algorithm = Logic + Control." *Communications of the ACM*, 22(7), 424–428. — both sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Colmerauer and Roussel's own retrospective locates Prolog's origin somewhere `prolog/00-overview.md` doesn't dwell on but is genuinely striking: natural language processing research in Marseille, 1972 — not an attempt to build a general-purpose programming language at all. The key technical insight, unification (pattern-matching on logical terms, allowing a variable to bind to a structure and be checked for consistency across an entire computation), turned out to be powerful enough to serve as a computational primitive in its own right, and Prolog's own execution model — depth-first search with backtracking — is, underneath, a theorem prover.

Kowalski's own 1979 paper gives that model its clean philosophical statement: any algorithm separates into logic (the specification — *what* to compute) and control (the strategy — *how* to compute it), and Prolog's own design commits to writing only the logic, leaving control to the interpreter's own built-in backtracking search. `prolog/00-overview.md`'s central promise — "model a problem as relations rather than procedures" — is Kowalski's own separation, made into a working discipline. This is precisely why `prolog/02-recursion-backtracking-lists.md` gets backtracking "as a language-level feature, free, with no code written for it" — a direct, verified contrast `scheme/08-capstone-continuations-control-flow.md` makes explicit by building the identical capability from scratch using `call/cc`, at real, measured cost in code volume and subtlety.

## Reflection prompts

- Kowalski's separation — logic vs. control — is Prolog's entire design philosophy. Pick a program you've written recently in an imperative language and try to separate its own "logic" from its own "control." How much of the code was actually specification, and how much was strategy for executing that specification?
- Colmerauer and Roussel's paper frames unification as "essentially a theorem prover." `prolog/09-capstone-expert-system.md` builds a real expert system on this foundation. What does it mean, precisely, that solving a real-world expert-system query and proving a mathematical theorem are, underneath Prolog's own execution model, the identical operation?

## Short-answer questions

1. **Where did Prolog's own creators say it actually originated, per their own 1993 retrospective — and how does that compare to what the language became known for?** Natural language processing research in Marseille, 1972 — not an attempt to design a general-purpose programming language; it became known as the flagship logic-programming language despite that narrower original context.
2. **What does Kowalski's "Algorithm = Logic + Control" formula mean precisely, and how does Prolog's own design commit to one side of it?** An algorithm separates into logic (the specification of what to compute) and control (the strategy for how to compute it); Prolog's design has the programmer write only the logic, leaving control (depth-first search with backtracking) to the interpreter itself.
3. **What real, direct contrast does this series draw between Prolog's own backtracking and Scheme's, verified in both guides?** `prolog/02-recursion-backtracking-lists.md` gets backtracking as a free, built-in language feature; `scheme/08-capstone-continuations-control-flow.md` builds the identical capability from scratch using `call/cc`, verified to require materially more code and to be materially easier to get subtly wrong — a real `let`-vs-`let*` bug surfaced during that guide's own construction.

## Links into the guide

- [`prolog/02-recursion-backtracking-lists.md`](../prolog/02-recursion-backtracking-lists.md) — backtracking as a language-level default, Kowalski's own control half, built in.
- [`prolog/09-capstone-expert-system.md`](../prolog/09-capstone-expert-system.md) — unification as theorem-proving, applied to a real, working expert system.

## Cross-thread connection

The Budokan workbook's own master table pairs Prolog with Bench-Capon et al.'s 2012 "A History of AI and Law in 50 Papers" survey — a genuine Hunter-thread connection, since Dan Hunter himself contributed to that survey. The survey documents legal AI still committed to rule-based systems, case-based reasoning, and logic programming (Prolog specifically) as late as 2012 — the exact year AlexNet's own deep-learning breakthrough (companion: `c.md`'s own cross-thread note) redirected the rest of the AI field toward statistical, learned approaches almost overnight. Prolog's own logic-programming lineage and legal AI's own history are, in this specific sense, the same story: a real, working paradigm that didn't disappear when a different paradigm suddenly dominated elsewhere, and is now being revisited via LLM-based reasoning rather than replaced outright.
