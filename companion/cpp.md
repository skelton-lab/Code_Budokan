# Companion — C++ (Budokan Module 7)

**Founding paper:** Stroustrup, B. (1993). "A History of C++: 1979–1991." *ACM SIGPLAN Notices*, 28(3), 271–297. — **independently supplied**, not present in the Budokan workbook's own Strand C body text (its master appendix table names only "Stroustrup (1982 — see ACM HOPL)" without a full citation). This is the well-known HOPL-II retrospective, presented at the same 1993 conference as Ritchie's C paper (companion: `c.md`) and Kay's Smalltalk paper — three language creators, same event, each telling their own history directly.

## Historical note

`cpp/00-overview.md` already states the real lineage precisely, independent of this companion: "`class` and `virtual` specifically descend from Simula (1967) by way of a direct, primary-sourced line through Bjarne Stroustrup's own account of what led him to write 'C with Classes.'" Stroustrup's own history confirms this isn't a loose family resemblance — he encountered Simula's class mechanism directly, during his PhD work at Cambridge, years before C++ existed, and set out specifically to bring Simula's organizational ideas (classes, and eventually virtual functions) into a language with C's own performance characteristics, rather than accepting Simula's own considerable runtime overhead. "C with Classes" (the pre-1983 name) describes the project with total accuracy: literally C, with Simula's most valuable idea grafted on.

This is the single clearest, most direct instance of a pattern this whole companion keeps surfacing: a language rarely invents its central idea from nothing. C++'s own genuinely new contribution wasn't `class` (Simula had it sixteen years earlier) — it was proving that idea could be made to cost nothing at runtime, compiled away rather than interpreted, which is precisely what `c/07-capstones.md`'s Capstone 5 demonstrates by hand: manually-written vtables are exactly what a C++ compiler generates automatically for `virtual`, and building it by hand first is what makes the automation legible rather than magical.

## Reflection prompts

- Stroustrup's own stated goal was Simula's organizational ideas at C's performance cost. Where else in this series does a language succeed not by inventing a new idea, but by making an existing idea's cost acceptable for a context that previously couldn't afford it? (Consider Rust's own relationship to manual memory management, covered in `rust.md`.)
- `cpp/00-overview.md` frames C++ Capstone 2 as "directly re-solves C Capstone 5" using real inheritance instead of manual vtables. Having read Stroustrup's own account of why he built `class` into C rather than adopting Simula wholesale, what specifically did compiling the abstraction away *cost* Stroustrup's design, relative to Simula's own more dynamic, more expensive model?

## Short-answer questions

1. **What was C++'s original name, and what does that name describe with unusual literal accuracy?** "C with Classes" — an accurate, literal description: C, with Simula's class mechanism added on top, before virtual functions and the rest of C++'s later feature set existed.
2. **Where did Stroustrup first encounter the ideas he later brought into C++, and roughly when, relative to C++'s own existence?** Simula's class mechanism, during his PhD work at Cambridge — years before C++ (or even "C with Classes") existed as a project.
3. **What does `c/00-overview.md`'s own Capstone 5 (manual vtables) exist specifically to demonstrate, in relation to C++?** That polymorphic dispatch via structs of function pointers, built by hand in C, is precisely what a C++ compiler generates automatically for the `virtual` keyword — building it manually first is what makes C++'s own automation legible rather than magical.
4. **What was C++'s genuinely novel contribution, if `class` itself already existed in Simula sixteen years earlier?** Proving that Simula's organizational idea could be compiled away entirely — costing nothing at runtime — rather than requiring Simula's own considerably more expensive interpreted/dynamic model.

## Links into the guide

- [`cpp/00-overview.md`](../cpp/00-overview.md) — the direct, primary-sourced Simula lineage, stated as the guide's own organizing principle for `class`/`virtual`.
- [`cpp/03-inheritance-polymorphism.md`](../cpp/03-inheritance-polymorphism.md) — `virtual`, Capstone 2's direct re-solving of C's manual-vtable capstone.
- [`c/07-capstones.md`](../c/07-capstones.md) — the C-side half of this same story: Capstone 5, built by hand, the thing C++'s compiler automates.

## Cross-thread connection

The Budokan workbook's own master table pairs C++ with Goodfellow et al.'s 2014 GAN paper — "multi-paradigm complexity." The connection is looser than some of this companion's other pairings, worth stating honestly rather than overclaiming: C++ supports multiple paradigms (procedural, object-oriented, generic, and later functional-flavored) within one language, and a GAN's own architecture is itself a composition of two separate models (generator, discriminator) trained against each other — both are examples of real, structural complexity arising from combining more than one computational approach in a single system, though the specific mechanisms involved are otherwise unrelated.
