# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test (`00-overview.md`'s ecosystem-breadth triage table) — none of them change how Capstones 1–4 turn out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry says what it is, why it matters, and where to go deeper when you actually need it.

### Units and separate compilation

**What it is:** Pascal, as Wirth originally specified it, has no standard mechanism for splitting a program across multiple source files with controlled, explicit interfaces between them — Turbo Pascal's `unit`s (and Free Pascal's own extended version of the same idea) added this as a real, widely-used extension, but not part of the original language design.

**Why it matters:** doesn't touch any capstone here — every capstone in this guide fit comfortably in one file, which was a deliberate choice matching the scope Wirth actually designed Pascal's core language around. This gap is, directly and by name, the reason Wirth designed **Modula-2** next: a proper, built-in module system, with explicit imports and exports, was Modula-2's headline addition over Pascal specifically to solve this.

**Where to go next:** this series' own `modula2/` guide, next in the stated sequencing — its own Module on modules picks up exactly where this signpost leaves off.

### Object Pascal and Delphi-style extensions

**What it is:** later, much larger dialects built on top of standard Pascal — Object Pascal (Apple, 1986) and Borland's Delphi (1995) added classes, inheritance, and a large standard library, turning Pascal into a full object-oriented, GUI-application language.

**Why it matters:** out of scope by design — this guide teaches Wirth's original, procedural Pascal, the language actually positioned historically between ALGOL and Modula-2 in this series' own sequencing. Simula (this series' very next guide after Modula-2) is where object-oriented ideas actually enter this series' own timeline, from a completely different, independent lineage.

**Where to go next:** the [Free Pascal Object Pascal mode documentation](https://www.freepascal.org/docs.html) (`-Mobjfpc`/`-Mdelphi`), for anyone specifically curious about Pascal's own later object-oriented dialects.

### Strict ISO 7185 conformance

**What it is:** the actual international standard Pascal was formalized as (ISO/IEC 7185:1990), with a fully specified grammar and semantics — this guide checked its examples against Free Pascal's `-Miso` mode directly and confirmed they behave identically, but didn't chase every edge case the full standard defines (nested procedure scoping rules, the exact legal forms of a `case` statement's labels, and other genuinely deep conformance details).

**Why it matters:** doesn't touch any capstone — Module 8's pointer-arithmetic finding is exactly the kind of divergence between "FPC's practical default mode" and "the strict standard" this guide flagged precisely where it mattered (a real behavioral difference a capstone could plausibly hit), without treating full ISO conformance-checking as this guide's job.

**Where to go next:** the ISO/IEC 7185:1990 standard itself (available through ISO or ANSI); Jensen and Wirth's own original *Pascal User Manual and Report*, the closest thing to a primary source for the language as Wirth actually specified it.

### The wider ecosystem

- **[Free Pascal documentation](https://www.freepascal.org/docs.html)** — the complete reference for this guide's entire anchored toolchain, including every compiler mode (`-Mfpc`, `-Miso`, `-Mtp`, `-Mdelphi`, `-Mobjfpc`) named across this guide.
- **Niklaus Wirth's own writings** — particularly his own retrospective accounts of Pascal's design goals and its relationship to ALGOL 68, the primary-source context for Module 1's history.
- **This series' [ALGOL guide](../algol/00-overview.md)** — the direct predecessor this entire guide was built in contrast to, especially its own modules on call-by-name and the dangling-else problem.
- **This series' [Modula-2 guide](../modula2/00-overview.md)** — Wirth's own next language, picking up directly from this guide's "units" signpost above.
