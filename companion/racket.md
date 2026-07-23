# Companion — Racket (Budokan Module 13)

**Founding paper:** Felleisen, M., et al. (2015). "The Racket Manifesto." *1st Summit on Advances in Programming Languages (SNAPL 2015)*, arXiv:1509.04085. — sourced directly from the Code Budokan Reading Workbook, Strand C.

## Historical note

Racket's own manifesto makes an unusual claim for a language paper to make: that Racket isn't really one language, but a *language-oriented* platform — a system for building new, genuinely restricted languages on top of a shared core, each with its own syntax, semantics, and guarantees suited to a specific problem. `racket/00-overview.md` calls this the guide's own "flagship capability," and `racket/09-capstone-custom-lang.md` builds one directly: a real, working, restricted language implemented on Racket's own platform, not a metaphor for what `#lang` does but the actual mechanism, exercised.

This is a direct, traceable descendant of McCarthy's own 1960 insight (companion: `scheme.md`) — if code and data share a representation, a program can generate programs, and a sufeiciently general enough host language can host other languages as a first-class capability rather than an add-on. Racket's own contribution is making that theoretical possibility into genuine, practical infrastructure: `syntax-parse` macros with real, actionable error messages (`racket/06-syntax-parse-macros.md`), not the cryptic expansion failures that made earlier Lisp-family macro systems a genuine barrier to entry.

## Reflection prompts

- `racket/00-overview.md` names Racket's central pitch as "building an entirely new language on top of Racket's own platform." Compare this to Forth's own `CREATE`/`DOES>` mechanism (companion: `forth.md`) — both let a program extend the language itself rather than merely use it, invented roughly 45 years apart. What's genuinely different about the two approaches, beyond surface syntax?
- The Racket Manifesto argues that a language-oriented platform is more valuable than a single, maximally general language. What would `code-rookie` itself look like if it were built the way Racket's manifesto argues software should be — as many small, purpose-built languages instead of 28 general-purpose ones?

## Short-answer questions

1. **What genuinely unusual claim does the Racket Manifesto make about what Racket actually is?** That Racket is not one language but a language-oriented platform — infrastructure for building new, genuinely restricted languages with their own syntax and semantics on a shared core, rather than a single general-purpose language.
2. **What real capstone in `code-rookie`'s own Racket guide directly builds the manifesto's own central claim, rather than just describing it?** `racket/09-capstone-custom-lang.md` — a real, working restricted language implemented on Racket's own platform.
3. **What specific, practical improvement does Racket's own macro system make over earlier Lisp-family macro systems, verified in `racket/06-syntax-parse-macros.md`?** `syntax-parse` macros that produce real, actionable error messages, addressing the cryptic macro-expansion failures that made earlier systems a genuine barrier to writing macros confidently.

## Links into the guide

- [`racket/06-syntax-parse-macros.md`](../racket/06-syntax-parse-macros.md) and [`racket/08-language-oriented-programming.md`](../racket/08-language-oriented-programming.md)/[`racket/09-capstone-custom-lang.md`](../racket/09-capstone-custom-lang.md) — the manifesto's own central claim, built and verified directly.

## Cross-thread connection

The Budokan workbook's own master table pairs Racket with Anthropic's 2022 Constitutional AI paper — "language-oriented design of values." The connection is genuinely apt: Constitutional AI's own core move is writing an explicit, auditable "constitution" the model critiques its own outputs against — a values specification treated as a first-class, inspectable artifact, the same instinct Racket's own manifesto applies to *languages themselves*: don't leave the rules implicit in a general-purpose system's behavior, make them an explicit, separately-authored, inspectable specification.
