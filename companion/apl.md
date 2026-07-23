# Companion — APL (Budokan Module 11)

**Founding documents:** Iverson, K.E. (1962). *A Programming Language*. John Wiley & Sons (a book, not a paper — the notation later implemented as APL). Iverson, K.E. (1980). "Notation as a Tool of Thought." *Communications of the ACM*, 23(8), 444–465 (Iverson's own Turing Award lecture). — both sourced directly from the Code Budokan Reading Workbook, Strand C, which names the 1980 lecture as "the framing paper for the entire Budokan."

## Historical note

Iverson's 1962 book didn't originate as a programming language at all — it was a mathematical notation, designed to describe array operations (and algorithms generally) more precisely than conventional mathematical notation could, years before it was implemented as an interpretable language (1966). `apl/00-overview.md` states the consequence directly: APL is "older than every other language in this series," and its central instinct — operate on entire arrays at once, with no explicit loop — isn't a modern optimization technique dressed up as a library (the way `python/08-numpy-vectorization.md`'s own NumPy layer is); it's APL's own native, 1962-era design, the actual origin `python/`'s vectorization only arrived at decades later as a bolted-on convenience.

Iverson's 1980 Turing lecture makes the deeper claim the Budokan workbook treats as this entire project's own intellectual foundation: notation shapes thought — a language lacking concise array primitives forces its users to think in loops, while a language with rich array primitives lets its users think about transformations of whole data structures directly. This is precisely why `code-rookie` traces the same underlying instinct across three genuinely different eras — APL's own 1962 origin, NumPy's library-level realization decades later, and Julia's own `.`-broadcasting (companion: `julia.md`) as a third, deliberately visible middle position — rather than treating them as three unrelated features that happen to look similar.

## Reflection prompts

- Iverson's own reflection prompt, direct from the Budokan workbook: "How has learning Python shaped the kinds of problems you think you can solve? What problems have you not attempted because the notation made them seem hard?" Answer this before reading `apl/01-foundations-arrays-shape.md`, then answer it again after — has anything genuinely changed?
- `apl/00-overview.md` names a real, verified toolchain gotcha: GNU APL hangs indefinitely under the default locale. What does it mean that a language built specifically to make certain ideas thinkable also, in its modern implementation, requires a specific, non-obvious environment setting just to run at all — is this a coincidence, or does it say something about how thoroughly APL's own notation-first philosophy shaped even its tooling?

## Short-answer questions

1. **Was APL originally designed as a programming language, per Iverson's own 1962 book?** No — it was a mathematical notation for describing array operations and algorithms more precisely than conventional notation, designed years before it was implemented as an interpretable language in 1966.
2. **What is Iverson's own central claim in his 1980 Turing lecture, and why does the Budokan workbook treat it as foundational to the entire reading programme?** That notation shapes thought — a language without concise array primitives forces users to think in explicit loops, while one with rich array primitives lets users think in terms of whole-data transformations directly; the workbook treats this as the argument for why learning multiple programming paradigms genuinely changes how a person thinks, not just what syntax they know.
3. **What three points does `code-rookie` itself trace across the array-oriented programming thread, and in what order historically?** APL (1962, the language-level origin) → NumPy (a library layered onto Python decades later) → Julia's own `.`-broadcasting (a dedicated, visible language feature, neither APL's "everything is elementwise always" nor NumPy's "vectorized under the hood").

## Links into the guide

- [`apl/01-foundations-arrays-shape.md`](../apl/01-foundations-arrays-shape.md) — whole-array operations as APL's own native default, no explicit loop, verified directly.
- [`apl/00-overview.md`](../apl/00-overview.md) — the real, verified locale gotcha, and the "older than every other language in this series" framing.

## Cross-thread connection

The Budokan workbook's own master table pairs APL with Mikolov et al.'s 2013 Word2Vec paper — "embedding = array ops." The connection is precise, not decorative: a word embedding is, mechanically, an array — a dense vector — and every operation performed on it (similarity via dot product, the famous "king − man + woman = queen" analogy) is exactly the kind of whole-array operation APL's own 1962 design made native and Iverson's 1980 lecture argued shapes what a person even thinks to try. Every modern embedding-based system, RAG pipeline included (companion: `sql.md`'s own cross-thread note on Lewis et al.), is doing APL's own core operation, sixty years later, at a scale Iverson himself never had hardware to imagine.
