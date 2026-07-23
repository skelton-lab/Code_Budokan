# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| Wirth, *Programming in Modula-2* | The language's primary reference text, and the closest thing to a compiler-verified source this guide has, given no installable toolchain (`00-overview.md`) |
| [GNU Modula-2 (`gm2`)](https://www.nongnu.org/gm2/) | The real, if inconvenient (requires building GCC from source), path to actually compiling and running the code this guide documents |
| This series' [Pascal guide](../pascal/00-overview.md) | The direct predecessor — this guide's Modules 2 and 4 are named, specific answers to gaps `pascal/10-beyond-this-guide.md` identified directly |
| This series' [Simula guide](../simula/00-overview.md) | This series' next guide, and Module 5's direct point of comparison for coroutines |
| Wirth's own retrospective writing on the Lilith project | The primary-source context for Module 1's entire historical framing |

## One-page cheat sheet

| Idea | Where |
|---|---|
| Modula-2 = Pascal + modules + low-level facilities, built for the Lilith workstation project | Module 1 |
| Wirth's own next language is Oberon, not Modula-3 (a separately-designed sibling) | Module 1 |
| `DEFINITION MODULE` (public interface) vs. `IMPLEMENTATION MODULE` (hidden code) | Module 2 |
| `FROM Module IMPORT name;` (unqualified) vs. `IMPORT Module;` (qualified, `Module.name`) | Module 2 |
| Opaque types (`TYPE Name;`, no body, in the definition module) — real, compiler-enforced information hiding | Module 3 |
| `SYSTEM.ADDRESS`/`ADR` — direct memory addresses, walled off behind an explicit import | Module 4 |
| `SYSTEM.WORD`/`CAST` — raw, untyped memory and explicit type-punning | Module 4 |
| `SYSTEM.NEWPROCESS`/`TRANSFER` — explicit, low-level coroutines | Module 5 |
| Modula-2's coroutines and Simula's `detach`/`resume`: independent convergence, not direct influence | Module 5 |

## A note on this guide's verification tier

Every code example in this guide is documented, not executed — reconstructed from Wirth's own *Programming in Modula-2* and well-established secondary sources, following this series' own precedent (`simula/00-overview.md`, facing the identical toolchain gap). Where this guide makes a historical claim rather than a syntax claim — Modula-2's real connection to the Lilith project, its documented influence on later module systems, the precise (not overstated) relationship to Simula's coroutines — that claim rests on independently corroborated sources, stated with the same care this series applies everywhere a claim can't be checked by actually running code.

## Where to go now

This guide sits between Pascal and Simula in this series' resequenced order specifically to let Wirth's own procedural lineage (ALGOL → Pascal → Modula-2) complete before the object-oriented fork (Simula) begins — modules, opaque types, and low-level facilities all answering real, specific gaps Pascal's own guide named directly, not features invented for their own sake. From here: **Simula** — this series' next guide, where Module 5's coroutine comparison gets its other half, and where the object-oriented lineage this series has been building toward since the very first "polymorphism" cross-guide thread entry actually begins.
