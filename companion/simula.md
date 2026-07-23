# Companion — Simula (Budokan Module 5)

**Founding paper:** Dahl, O.-J. & Nygaard, K. (1966). "SIMULA: An ALGOL-Based Simulation Language." *Communications of the ACM*, 9(9), 671–678. — sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

The Budokan workbook's own framing is the whole story in one line: "OOP was not a grand theory — it was a practical solution to a modelling problem." Dahl and Nygaard weren't trying to invent a new programming paradigm; they needed to simulate queuing systems (a bank's customer queue, a factory's parts flowing through machines), and the natural way to represent that — each customer or part as a thing with its own state and behavior — became `class`, `object`, and inheritance almost as a direct consequence of the modeling problem itself, built as an extension of ALGOL 60's own block structure. `simula/00-overview.md` states the payoff precisely: this is "the exact idea... that Bjarne Stroustrup pointed to directly as his inspiration for adding classes to C" (companion: `cpp.md`), and `simula/04-virtual-procedures.md` covers the specific mechanism — virtual procedures — that carried through into C++'s vocabulary essentially unchanged, "not just its concepts."

`simula/00-overview.md` also names the toolchain reality directly, "more so than any other guide in this series" — a genuine, honest constraint worth knowing before assuming every example here was executed the way this series' other guides' examples were.

## Reflection prompts

- Dahl and Nygaard's own motivating problem was queuing simulation. `simula/02-class-as-block.md` presents `class` as ALGOL's own block structure extended. Implement the same bank-queue simulation from the 1966 paper in a purely functional style (no classes) — what does the object-oriented version make natural that the functional version makes awkward, and vice versa?
- Trace `virtual` from Simula (1967) through Smalltalk's message-passing (companion: `smalltalk.md`) to C++'s own compiled dispatch (companion: `cpp.md`). Three languages, the same underlying idea, three genuinely different implementations. Which one is closest to what Dahl and Nygaard's own original paper actually described?

## Short-answer questions

1. **What practical problem — not a theoretical goal — directly motivated Dahl and Nygaard's own invention of classes and objects?** Simulating queuing systems (bank customer queues, factory part flows) — representing each queued entity as a thing with its own state and behavior was the natural modeling choice that became `class`/`object`/inheritance.
2. **What specific mechanism does `simula/04-virtual-procedures.md` cover that Stroustrup carried "not just as a concept but as vocabulary" into C++?** Virtual procedures — the same word, the same underlying mechanism, roughly three decades before C++'s own `virtual` keyword.
3. **What genuine, honest constraint does `simula/00-overview.md` name about this guide's own toolchain, more so than any other guide in the series?** That the toolchain reality is worth reading "before anything else" — a real, stated limitation on how much of this guide could be executed and verified directly, distinct from the fully-executable toolchains most of this series anchors to.

## Links into the guide

- [`simula/00-overview.md`](../simula/00-overview.md) — the direct Stroustrup/C++ inspiration, stated as the guide's own central payoff.
- [`simula/04-virtual-procedures.md`](../simula/04-virtual-procedures.md) — the specific mechanism carried into C++'s own vocabulary.

## Cross-thread connection

The Budokan workbook's own master table pairs Simula with Hewitt, Bishop & Steiger's 1973 actor-model paper — "actors emerged from the same AI context." The connection is real and specific: both are genuine instances of representing a system as a collection of independent, communicating entities, arrived at from two different directions in the same general era — Simula from simulation modeling, the actor model from an AI paper trying to formalize intelligence as concurrent message-passing. Neither team was building "object-oriented programming" or "concurrent systems" as an abstract goal; both were solving a specific modeling problem that happened to converge on the same underlying shape.
