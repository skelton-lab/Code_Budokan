# Companion — C (Budokan Module 4)

**Founding paper:** Ritchie, D.M. (1993). "The Development of the C Language." *ACM SIGPLAN Notices*, 28(3), 201–208. — sourced directly from the Code Budokan Reading Workbook, Strand C. (Presented at HOPL-II, the same 1993 History of Programming Languages conference that produced Kay's Smalltalk retrospective and Colmerauer & Roussel's Prolog retrospective — three languages' own creators, telling their own history, at the same event.)

## Historical note

C wasn't designed from a clean sheet — Ritchie's own retrospective traces a direct lineage: CPL → BCPL → B → C, four languages across roughly a decade, all at Bell Labs, all in pursuit of one specific, practical goal: a language portable enough to rewrite Unix in, since Unix's first version (1969) was written directly in PDP-7 assembly and couldn't move to new hardware without a full rewrite each time. C is, in a real sense, a systems-programming problem's answer, not a theoretical one — every design decision Ritchie explains (why pointers work the way they do, why the type system is minimal rather than rich) traces back to "what does an operating system actually need."

The Code Budokan history's [Era IV profile of Thompson & Ritchie](history/era-4-software-revolution.md) names the consequence precisely: C became the lingua franca of systems programming, and by extension the ancestor — directly or by deep influence — of nearly every widely used language since, including Python, Java, JavaScript, and Go. `c/00-overview.md`'s own framing captures the same idea from the teaching side: C is "the deliberate bridge from the 6502 assembly track toward C++," and its Capstone 5 (polymorphic shapes via manually-written vtables) is explicitly built to be "what a C++ compiler generates for `virtual`" — meaning this guide's own final capstone is, deliberately, a hand-built version of exactly the mechanism C++ (Module 7) automates.

## Reflection prompts

- Ritchie's paper explains specific design decisions (pointer semantics, a minimal type system) as direct consequences of C's original purpose (rewriting Unix, portably). Pick one C feature you've found awkward or dangerous, and trace it back to the systems-programming problem it was actually solving.
- `c/00-overview.md` names C's sanitizer flags (ASan/UBSan) as "the closest thing C has to the safety net a compiler gives you for free in a higher-level language." Read Ritchie's own account of why C's type system is minimal, then consider: is a sanitizer a genuine substitute for a stronger type system, or a fundamentally different kind of safety net?

## Short-answer questions

1. **What four languages does Ritchie's own retrospective trace as C's direct lineage, and what was the shared, practical goal across all of them?** CPL → BCPL → B → C — all developed at Bell Labs, all in pursuit of a language portable enough to rewrite Unix in, so it wouldn't require a full rewrite in assembly for each new hardware platform.
2. **What specific mechanism does C's own guide build by hand in Capstone 5, and what later guide automates it?** Polymorphic dispatch via manually-constructed structs of function pointers ("manual vtables") — `cpp/00-overview.md` names this directly as what a C++ compiler generates automatically for the `virtual` keyword.
3. **Why does `c/00-overview.md` treat the sanitizer flags (`-fsanitize=address,undefined`) as "load-bearing, not optional extras"?** Because C's own verification discipline (Module 4 especially) depends on them to actually demonstrate a real bug happening, not just describe one in prose — confirmed working locally, catching a real null-pointer write with a full diagnostic.
4. **What conference produced Ritchie's own 1993 C retrospective, and what two other language creators' own retrospectives were presented at the same event?** HOPL-II (History of Programming Languages II, 1993) — Alan Kay's Smalltalk retrospective and Alain Colmerauer & Philippe Roussel's Prolog retrospective were both presented there as well.

## Links into the guide

- [`c/00-overview.md`](../c/00-overview.md) — the "bridge from 6502 to C++" framing, and the sanitizer-as-safety-net argument.
- [`c/07-capstones.md`](../c/07-capstones.md) — Capstone 5, the manual-vtable polymorphic shapes system, directly answered by `cpp/03-inheritance-polymorphism.md`.

## Cross-thread connection

The Budokan workbook's own master table pairs C with Krizhevsky, Sutskever & Hinton's 2012 AlexNet paper — "both involve squeezing hardware to the limit." The connection holds up under scrutiny: C's entire design philosophy is extracting maximum performance from limited, fixed hardware resources (Ritchie's own 1970s PDP-11); AlexNet's own breakthrough was equally a hardware story — a deep convolutional network trained on GPUs, where the *availability* of parallel hardware, not just the algorithm, was what made the 2012 result possible at all.
