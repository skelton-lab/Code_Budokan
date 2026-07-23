# Simula — A Historical & Conceptual Study Guide

**Promise:** trace the exact idea — Simula's `class` — that Bjarne Stroustrup pointed to directly as his inspiration for adding classes to C, and understand precisely which of Simula's other ideas (virtual procedures, especially) carried straight through into C++'s vocabulary, not just its concepts. Positioned, per your own sequencing, between the C and C++ guides.

**Audience:** comfortable with the ALGOL guide (this series' `algol/` companion) — Simula is presented throughout as ALGOL 60's block structure extended, not as a language from scratch. Comfortable with C also helps, since the payoff is seeing exactly what C++ took from here.

**The toolchain reality — more so than any other guide in this series:**

There is no installable Simula compiler in this environment — no Homebrew formula, no readily available alternative. Every code example in this guide is **documented, not executed** — reconstructed from the actual Simula 67 Common Base Language report and well-established secondary historical sources, not verified against a real compiler. Treat exact punctuation as illustrative of the language's real shape, not as compiler-checked fact, the same caution this series applied to ALGOL 60's call-by-name material — except here it applies to nearly the whole guide, not one module of it.

**What is independently, strongly verifiable, despite the lack of a compiler:** Bjarne Stroustrup's own account of Simula's influence on him. This isn't secondhand historical reconstruction — it's Stroustrup's own repeatedly-published statement (*The Design and Evolution of C++*, 1994; his 1991 HOPL-II paper "A History of C++: 1979–1991"; numerous interviews since), that Simula's class concept, encountered during his PhD work at Cambridge, is specifically what led him to add classes to C — first as "C with Classes" (1979–1980), renamed C++ in 1983. Module 6 draws on this directly.

## Module list

1. **Historical context** — Nygaard & Dahl, why "SIMULA," and Stroustrup's own account of what drew him to it
2. **The class as a generalized block** — extending the ALGOL block structure you already have
3. **Subclassing and prefix classes** — Simula's inheritance syntax
4. **Virtual procedures** — the exact term C++'s `virtual` came from
5. **Coroutines and discrete-event simulation** — `detach`/`resume`, the "why it's called SIMULA" module
6. **From Simula to "C with Classes"** — Stroustrup's synthesis, sourced from his own writing
7. **Beyond this guide** + forward pointer to Smalltalk
8. **Final assessment** + **Resources**

## A note on how to read this guide

Every other guide in this series opens with a toolchain you install and verify against. This one opens with an admission: you're reading history, not running a compiler. That's not a lesser guide — it's the honest shape of what Simula actually is to you in 2026. The value is entirely in seeing, precisely, where specific words and ideas in C++ (and, downstream, in every language in this series with a `class` keyword) came from.
