# Modula-2 — A Historical & Conceptual Study Guide

**Promise:** understand precisely what Niklaus Wirth added to his own Pascal, four years later (1978), specifically to fix the two gaps the `pascal/` guide named directly: no standard way to split a program across files with a real, enforced interface, and no facilities for genuine low-level systems programming. Positioned, per your own sequencing, immediately after Pascal — read this as Wirth's own second draft, not a new language from an unrelated designer.

**Audience:** comfortable with the `pascal/` guide — Modula-2 is presented throughout as Pascal's block structure, records, and pointers kept essentially unchanged, extended with a real module system and a systems-programming escape hatch. Wirth built Modula-2 at ETH Zürich specifically to write the entire operating system for the Lilith personal workstation project — a real, documented use case this guide keeps returning to, since it's the reason several of Modula-2's features exist at all.

**The toolchain reality — read this before anything else:**

There is no maintained, easily installable Modula-2 compiler for this environment. GNU Modula-2 (`gm2`) exists as a real, still-maintained GCC front end, but using it means building GCC itself from source with the `m2` language enabled — a heavy, fragile process, not a `brew install`. Following this series' own precedent (`simula/00-overview.md`, facing the identical situation), this guide is **entirely documented, not executed** — every example is reconstructed from Wirth's own *Programming in Modula-2* (the language's primary reference text, several editions, 1982 onward) and well-established secondary sources, not verified against a real compiler.

**What carries real, independent confidence despite the lack of a compiler:** Modula-2's actual, well-documented historical role — designed by Wirth as Pascal's direct successor, used to implement the Lilith workstation's own operating system and development environment, and its module system (Module 2) genuinely predates, and is frequently cited as a direct conceptual predecessor to, information-hiding and interface/implementation separation as it later appears in Ada packages, and eventually the encapsulation half of mainstream object-oriented languages — a real, citable design lineage, not just a family resemblance.

## Module list

1. **Historical context and Wirth's stated goals** — the Lilith project, why Pascal wasn't enough, Modula-2's actual position between Pascal and Modula-3/Oberon (Wirth's own later languages, signposted, not covered)
2. **Modules: definition, implementation, and explicit import/export** — the headline feature, and the direct, named answer to `pascal/10-beyond-this-guide.md`'s units gap
3. **Opaque types and information hiding** — genuine data abstraction, predating mainstream OOP encapsulation
4. **Low-level systems programming: the `SYSTEM` module** — `ADDRESS`, `WORD`, `ADR`, direct memory access — what actually let Modula-2 write an OS, unlike Pascal
5. **Coroutines** — `NEWPROCESS`/`TRANSFER`, and the direct, real connection to Simula's own coroutines (this series' very next guide)
6. **Beyond this guide** — signposts, including a forward pointer to Simula
7. **Final assessment** + **Resources**

## A note on how to read this guide

Every code example here carries the same caution the ALGOL guide applied to call-by-name, and the Simula guide applied throughout: read the syntax as an accurate reconstruction of the real language's shape, corroborated against Wirth's own published reference and independent secondary sources, not as something compiled and checked in this environment. Where this guide's confidence is independently strong — Modula-2's historical role, its actual documented relationship to Pascal and to later languages — that's stated explicitly, the same way the Simula guide could independently verify Stroustrup's own account of Simula's influence on C++ even without a Simula compiler.
