# Module 1 — Historical Context and Wirth's Stated Goals

Modula-2 isn't Wirth's first attempt at this name — there was an earlier, singular "Modula" (1975–76), a research vehicle for exploring module and concurrency concepts, never intended as a production language. Modula-2 (design work from around 1977, published as a full report by 1980) is the second, refined take, and this time built for a specific, real, documented purpose: writing the entire system software for a real machine. Everything below is documented, not executed — see `00-overview.md`'s toolchain note.

## The Lilith project: why Modula-2 exists at all

**You'll be able to:** state, specifically, the real engineering problem Modula-2 was built to solve.

**Concept, documented:**

Around 1977, Wirth began the Lilith project at ETH Zürich — a personal workstation with a bitmapped display and mouse, genuinely ahead of its time, contemporaneous with (and influenced by) the Xerox Alto. Wirth's stated goal was to write *everything* — the operating system, the text editor, the compiler itself — in one single, systematically-designed language, rather than mixing a high-level language for applications with assembly or C for the low-level parts. Pascal, as it stood, could not do this: it had no facilities for direct memory access, no way to interface with hardware-level concerns, and — separately, but just as importantly for a project this size — no standard way to split a large system across multiple source files with any real, compiler-enforced interface between the pieces.

**Documented, and directly connecting back to `pascal/`:** `pascal/10-beyond-this-guide.md` named this exact gap — Pascal's lack of a standard separate-compilation mechanism — as the specific reason Wirth designed Modula-2 next. This module states the other side of that same claim: Modula-2's module system (Module 2) and its `SYSTEM`-level low-level facilities (Module 4) are not two unrelated features bolted onto Pascal — they're both direct, specific answers to what building Lilith's own system software actually required.

> **Historically well-corroborated, independent of any single source:** Modula-2's connection to the Lilith project, and Wirth's own stated dissatisfaction with Pascal's lack of modularity and low-level facilities, are documented consistently across Wirth's own published retrospectives and independent histories of the language — this isn't a single anecdote, but Modula-2's actual, stated design rationale.

**Practice**

- Write, in your own words, why a language designed to write an entire operating system needs direct memory access in a way a language designed purely for teaching structured programming (Pascal's original stated purpose, per `pascal/01-foundations.md`) does not.

## Where Modula-2 sits: after Pascal, before Oberon

**You'll be able to:** place Modula-2 correctly in Wirth's own sequence of languages, without conflating it with a similarly-named but differently-authored language.

**Concept, documented:**

Wirth's own language lineage continues past Modula-2: **Oberon** (1988) is Wirth's own further simplification — smaller than Modula-2, dropping some features (including, notably, a simplified module and generally reduced language complexity) in the same spirit that drove Pascal's original design. **Modula-3** (1988, developed primarily at DEC Systems Research Center and Olivetti, with Wirth himself not a primary designer) is a *different*, larger, more feature-rich language that borrowed Modula-2's name and some of its module-system ideas but added object-oriented features, exception handling, and garbage collection — a genuinely separate lineage that happens to share a name and a module-oriented ancestor, not Wirth's own direct next step.

> **Pitfall:** it's easy to assume "Modula-3" is simply "Modula-2, version 3, by the same author" — it isn't. Oberon, not Modula-3, is Wirth's own actual next language in this specific lineage; Modula-3 is a related but independently-designed language from a different team, sharing an ancestor rather than an author.

**Practice**

- Note, without needing to go deep on either, one feature Oberon removed relative to Modula-2, and one feature Modula-3 added relative to Modula-2 — the contrast itself is the point: one direction is Wirth's own continued simplification, the other is a different team's expansion.

## Progress check

1. What real, specific engineering project directly motivated Modula-2's design, according to Wirth's own stated account?
2. What two things did Pascal genuinely lack that Modula-2 was specifically designed to add, both connecting directly to that project's actual requirements?
3. Was there an earlier language literally called "Modula," and if so, what was its purpose?
4. What's the actual relationship between Modula-2 and Oberon versus Modula-2 and Modula-3?

### Answers

1. The Lilith personal workstation project at ETH Zürich — Wirth's stated goal was to write the machine's entire system software (operating system, editor, compiler) in one systematically-designed language, rather than mixing a high-level language with assembly or C for the low-level parts.
2. Direct memory access and other low-level, hardware-facing facilities (Module 4's `SYSTEM` module), and a standard module system for splitting a large program across files with a real, compiler-enforced interface (Module 2) — both directly required by a project the scale of writing an entire workstation's system software.
3. Yes — "Modula" (1975–76), an earlier, singular language Wirth used as a research vehicle for exploring module and concurrency concepts, not intended as a production language; Modula-2 is the refined, second iteration built for the Lilith project specifically.
4. Oberon (1988) is Wirth's own direct next language, a further simplification in the same spirit as Pascal's original design. Modula-3 (1988) is a separately-designed, larger language from a different team (DEC Systems Research Center and Olivetti) that borrowed Modula-2's name and some module-system ideas but added object-oriented features, exceptions, and garbage collection — a related lineage, not a direct authorial sequel.
