# Companion — Pascal (Budokan Module 6)

**Founding paper:** Wirth, N. (1971). "The Programming Language Pascal." *Acta Informatica*, 1(1), 35–63. — sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Pascal exists because Niklaus Wirth sat on the ALGOL 68 design committee and disagreed with the direction it took — `pascal/00-overview.md` states this relationship directly, not as background color but as the guide's own organizing principle: "every module that has a clean ALGOL counterpart says so, and states precisely what changed." Where ALGOL 68 grew more complex trying to be maximally general, Wirth built something smaller and stricter on purpose: strong static typing enforced throughout, no `goto` at all, a syntax designed from the start to be taught to students rather than merely used by working programmers. Wirth's own guiding principle, quoted directly in the Budokan workbook — "a program should be correct before it is fast" — is a real, load-bearing design philosophy, not a slogan; it shows up structurally in Pascal's own choices (mandatory type declarations, range-checked subranges) rather than just in the paper's prose.

The paper's real, lasting influence is easy to understate precisely because it succeeded: Pascal demonstrated that a language could be both strict and genuinely readable, and that combination — not any single feature — is what made it, for a generation, the dominant teaching language before C displaced it in that role. The Budokan workbook's own reflection prompt asks the sharper question directly: what does strong static typing cost, and what does it buy, relative to C's own deliberately more permissive model covered one module earlier?

## Reflection prompts

- Wirth's principle is "a program should be correct before it is fast." `c/00-overview.md`'s own sanitizer-focused verification discipline is arguably a *runtime* answer to the same correctness question C's own weaker type system doesn't answer at compile time. Which approach — Pascal's stricter compiler, or C's stricter runtime tooling — actually catches more real bugs, and under what conditions would you expect one to win over the other?
- Pascal was designed explicitly as a teaching language. `pascal/00-overview.md` frames this series' own Pascal guide the same way — a direct answer to what ALGOL simplified or fixed. What would you build differently if you were designing a language today with "explicitly for teaching" as the primary design constraint, rather than an afterthought?

## Short-answer questions

1. **What committee experience directly motivated Wirth to design Pascal, and what was his specific disagreement?** Wirth served on the ALGOL 68 design committee and disagreed with the direction the language's complexity took — Pascal was his own answer: smaller, stricter, and explicitly teaching-oriented rather than maximally general.
2. **What is Wirth's own stated guiding principle for Pascal's design, quoted directly from the Budokan workbook, and name one concrete Pascal feature that embodies it structurally.** "A program should be correct before it is fast." Mandatory, strong static typing (verified throughout `pascal/00-overview.md`'s own capstone log) is a direct structural embodiment — the compiler refuses to compile a large class of type errors rather than allowing them to surface as runtime bugs.
3. **What does `pascal/00-overview.md` name as the "opposite problem in the best way" compared to `algol/00-overview.md`'s own toolchain situation?** ALGOL had to split nearly every module into executed-vs-documented, since no maintained ALGOL 60 compiler exists; Pascal's anchored toolchain (Free Pascal 3.2.2) is real, current, and fully capable of running every example in the guide — every claim is executed and verified, no split needed.

## Links into the guide

- [`pascal/00-overview.md`](../pascal/00-overview.md) — the direct ALGOL-to-Pascal relationship, stated as the guide's own organizing principle.
- [`pascal/04-records-enums-subranges.md`](../pascal/04-records-enums-subranges.md) — Pascal's strong-typing discipline in concrete form (records, enumerated types, subranges), the clearest structural expression of "correct before fast."

## Cross-thread connection

The Budokan workbook's own master table pairs Pascal with Hinton & Salakhutdinov's 2006 deep-belief-network paper — "both about disciplined structure enabling deeper work." The parallel is genuine: Pascal's own strict typing discipline is a constraint that, properly used, makes larger programs more tractable to reason about; Hinton's 2006 insight (layer-by-layer pre-training before end-to-end fine-tuning) is likewise a disciplined structural constraint that made training genuinely *deep* networks tractable for the first time, ending the second AI winter in the process.
