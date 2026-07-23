# Companion — FORTRAN (Budokan Module 1)

**Founding paper:** Backus, J.W., et al. (1957). "The FORTRAN Automatic Coding System." *Proceedings of the Western Joint Computer Conference*, 11, 188–198. — sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

By 1954, IBM's own engineers estimated that half the cost of running a computer was the cost of programming it — and John Backus, leading a small team at IBM, made a claim almost nobody believed: that a machine could translate algebraic notation into code as efficient as a human's hand-written assembly. Skeptics had real grounds. Compiled code was assumed to be slow, bloated, wasteful of the era's scarce cycles and memory. FORTRAN (FORmula TRANslation) shipped in 1957 and won the argument empirically — an order-of-magnitude drop in the time it took to write scientific and engineering programs, with performance close enough to hand-tuned assembly that the "compilers are slow" objection collapsed within a few years.

The irony the Budokan workbook itself names precisely: Backus spent the rest of his career arguing that FORTRAN's own imperative style — the one he'd just made possible — was a mistake. His 1977 Turing Award lecture, "Can Programming Be Liberated from the von Neumann Style?", is a direct repudiation, arguing for function-level (later, functional) programming instead. The inventor of the first mainstream imperative language became one of imperative programming's most credentialed critics — worth sitting with before assuming any language's own advocate is also its permanent defender.

## Reflection prompts

- Why did Backus, having just proven imperative compiled code could work, spend decades afterward arguing it was the wrong style? Read the 1977 Turing lecture alongside the 1957 paper — where does his own later argument actually target the FORTRAN he built?
- FORTRAN's central bet was "a compiler can match hand-written assembly." `fortran/00-overview.md` names a different, much smaller-stakes bet this series' own Fortran guide got wrong on its first attempt (the `v(::-1)` array-slice claim). What's the structural similarity between "trust a plausible claim about what a language does" in 1954 and in this guide's own construction?

## Short-answer questions

1. **What specific cost problem was FORTRAN built to solve, and what was the skeptical claim it had to overcome?** The high cost (in programmer time) of writing scientific/engineering code directly in assembly; the skeptical claim was that compiled code could never match hand-written assembly's efficiency, which FORTRAN's own performance disproved within a few years.
2. **What did Backus argue in his 1977 Turing Award lecture, and how does it relate to the language he's most famous for?** He argued that imperative, "von Neumann style" programming (exemplified by FORTRAN itself) constrained how programmers think, and proposed function-level programming as an alternative — a direct critique of his own most famous creation.
3. **What real, verified finding does `fortran/00-overview.md` name as this entire series' own origin story?** That `v(::-1)` does not reverse a Fortran array — omitted subscript-triplet bounds default to the array's own declared bounds regardless of stride sign, so the expression returns an empty section, not a reversal — an error that motivated this series' mandatory verification-before-shipping discipline.

## Links into the guide

- [`fortran/00-overview.md`](../fortran/00-overview.md) — the origin-story bug, directly comparable to FORTRAN's own founding claim being tested rather than assumed.
- [`fortran/02-control-flow.md`](../fortran/02-control-flow.md) — read alongside Dijkstra's 1968 GOTO letter (companion overview, "Three framing papers"): FORTRAN predates structured programming by over a decade, and its own control-flow idioms show what programming looked like before Dijkstra's argument won.

## Cross-thread connection

The Budokan workbook's own master table pairs FORTRAN with Rumelhart, Hinton & Williams (1986) on backpropagation — both, at a distance of thirty years, are examples of "compiler-era numerical thinking": FORTRAN made numerical computation practical at scale for scientists; backpropagation made numerical optimization practical at scale for learning systems. Neither is a coincidence-free connection, but both are genuinely about the same underlying bet — that a mechanical, repeatable numerical process can replace what previously required a human doing the arithmetic by hand.
