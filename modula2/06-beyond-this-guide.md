# Module 6 — Beyond This Guide

Every topic here failed the capstone-impact test — none required to follow this guide's modules, and none this guide's necessarily narrower, documented-tier scope covers in depth. Each entry says what it is, why it matters, and where to go deeper.

### Oberon and Modula-3, in more depth

**What it is:** Module 1 named both — Oberon (1988), Wirth's own further simplification, and Modula-3 (1988), a separately-designed, larger language sharing Modula-2's name and module-system lineage.

**Why it matters:** this guide's scope stops at Modula-2 itself, positioned specifically between Pascal and Simula in this series' own sequencing — Wirth's continued evolution past Modula-2, and the independently-designed Modula-3, are both real, worthwhile further reading, just outside what this guide's placement in the series calls for.

**Where to go next:** Wirth's own writing on Oberon's design (a natural extension of the same primary-source material Module 1 draws on); the Modula-3 language definition, published by DEC Systems Research Center, for the independently-designed sibling.

### Concurrent and parallel programming beyond coroutines

**What it is:** Module 5's `NEWPROCESS`/`TRANSFER` are genuinely low-level, single-processor, cooperative coroutine primitives — real concurrent and parallel programming (multiple processors, preemptive scheduling, synchronization primitives like semaphores and monitors) is a considerably larger topic Modula-2's own ecosystem addressed with higher-level library modules built on top of these primitives.

**Why it matters:** doesn't change this guide's core modules — the `SYSTEM`-level coroutine primitives are the right depth for understanding Modula-2's actual contribution and its real connection to Simula's own coroutines, without needing the full scheduling/synchronization theory that real concurrent systems require.

**Where to go next:** Wirth's own *Programming in Modula-2*, which covers the higher-level `Processes` library module built on top of `NEWPROCESS`/`TRANSFER`.

### GNU Modula-2 and actually running code

**What it is:** `gm2`, a real, still-maintained GCC front end for Modula-2 — genuinely installable, but only by building GCC itself from source with the `m2` language enabled, a heavy, fragile process this guide's own environment didn't attempt (`00-overview.md`'s toolchain note).

**Why it matters:** every example in this guide is a documented reconstruction, not a compiler-verified fact — a reader who wants to actually run Modula-2 code, rather than read about it, has a real, if inconvenient, path to doing so.

**Where to go next:** the [GNU Modula-2 project documentation](https://www.nongnu.org/gm2/) for build instructions; a source-based Linux distribution or a dedicated build environment is likely to make this considerably less painful than attempting it on this guide's own toolchain setup.

### The wider ecosystem

- **Niklaus Wirth's own writings** — particularly *Programming in Modula-2*, the language's primary reference text, and his own retrospective accounts of the Lilith project.
- **This series' [Pascal guide](../pascal/00-overview.md)** — the direct predecessor this entire guide was built in contrast to, especially its own "Beyond This Guide" module naming the units gap this guide's Module 2 answers directly.
- **This series' [Simula guide](../simula/00-overview.md)** — this series' very next guide, and the direct destination of Module 5's coroutine comparison.
- **[GNU Modula-2](https://www.nongnu.org/gm2/)** — the real, if inconvenient, path to actually compiling and running Modula-2 code.
