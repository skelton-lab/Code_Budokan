# Companion — Modula-2 (not in the original Budokan module list)

**Founding paper: independently supplied.** Wirth, N. (1977). "Modula: A Language for Modular Multiprogramming." *Software—Practice and Experience*, 7(1), 3–35. (Modula-2 itself, the language `code-rookie` covers, followed in 1978 as Wirth's own refinement of this original Modula design.) Modula-2 doesn't appear in the Budokan workbook's own module list — it predates the workbook's writing, added to `code-rookie` after the original plan was set, as a direct sequel to Pascal (companion: `pascal.md`).

## Historical note

`modula2/00-overview.md` states the guide's own organizing premise with total precision: this is "Wirth's own second draft, not a new language from an unrelated designer" — the same designer, the same underlying block structure, records, and pointers, extended specifically to fix two real gaps `pascal/10-beyond-this-guide.md` already named directly: no standard way to split a program across multiple files with a genuinely enforced interface, and no facilities for real low-level systems programming. Both gaps existed for a concrete, documented reason: Wirth built Modula-2 at ETH Zürich specifically to write the entire operating system for the Lilith personal workstation project, a real deployment target Pascal itself was never designed to serve.

`modula2/02-modules-definition-implementation.md` covers the module system directly answering the first gap; `modula2/04-system-module-low-level.md` covers the `SYSTEM` module's own low-level escape hatch answering the second. `modula2/05-coroutines.md` closes a genuinely interesting loop this companion's own Simula entry opened: Modula-2's `TRANSFER` mechanism is compared directly against Simula's own, independently-designed `detach`/`resume` coroutine primitives — real convergence on the same underlying idea, arrived at from two genuinely unrelated directions, stated precisely as convergence rather than influence.

## Reflection prompts

- Wirth built Modula-2 to solve a specific, real deployment problem (the Lilith workstation's own operating system) — the same pattern as C's own origin (rewriting Unix, companion: `c.md`). What's genuinely different about how each language's designer responded to a similar "we need a systems-programming language for a real project" pressure?
- `modula2/05-coroutines.md` names Modula-2's `TRANSFER` and Simula's `detach`/`resume` as real convergence, not influence. What conditions would need to hold for two independently-designed mechanisms to converge on the same underlying idea without either designer having seen the other's work?

## Short-answer questions

1. **What real project directly motivated Wirth to build Modula-2, distinct from Pascal's own original teaching-language purpose?** The Lilith personal workstation project at ETH Zürich — Wirth needed to write the entire operating system for it, a deployment target Pascal itself was never designed to serve.
2. **What two specific gaps in Pascal does `modula2/00-overview.md` name as Modula-2's own direct motivation?** No standard way to split a program across multiple files with a genuinely enforced interface, and no facilities for real low-level systems programming — both named directly in `pascal/10-beyond-this-guide.md` as the specific reasons Wirth built Modula-2 next.
3. **What real, named coroutine mechanisms does `modula2/05-coroutines.md` compare directly, and what precise relationship does the guide state between them — convergence, or influence?** Modula-2's `TRANSFER` and Simula's `detach`/`resume` — the guide states this precisely as real convergence (two independently-designed mechanisms arriving at the same underlying idea), not one influencing the other.

## Links into the guide

- [`modula2/02-modules-definition-implementation.md`](../modula2/02-modules-definition-implementation.md) — the real, enforced module system, answering Pascal's own named gap.
- [`modula2/05-coroutines.md`](../modula2/05-coroutines.md) — the direct, honest convergence comparison with Simula.

## Cross-thread connection

No direct Budokan-workbook pairing exists for Modula-2 specifically. The genuinely relevant connection is internal to `code-rookie`'s own "Wirth's own lineage" thread: ALGOL 60 → (disagreement with ALGOL 68's complexity) → Pascal → Modula-2 — one designer's own continuous line of thought, traced explicitly across three guides in this series, distinct from the Simula/Smalltalk/C++ branch and the Cambridge/Bell Labs (BCPL/B/C) branch that also both descend from ALGOL 60.
