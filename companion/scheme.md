# Companion — Scheme (Budokan Module 2)

**Founding paper:** McCarthy, J. (1960). "Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I." *Communications of the ACM*, 3(4), 184–195. — sourced directly from the Code Budokan Reading Workbook, Strand C, which names it as "one of the five most important papers in computer science."

## Historical note

McCarthy's paper invents LISP almost as a side effect of a different goal — he was trying to define computability using symbolic expressions rather than Turing's tape or Church's lambda calculus, and discovered along the way that a tiny set of primitives (`atom`, `cons`, `car`, `cdr`, `cond`, `lambda`) could express any computation, including computations over programs themselves. `scheme/00-overview.md` names the consequence directly: this is "the first language in this series where code and data share literally the same representation" — every earlier guide in `code-rookie` kept "the program" and "the data it manipulates" in genuinely separate categories. McCarthy's own paper is where that separation first stopped being necessary.

The Budokan workbook's own reflection exercise — implement a LISP interpreter handling atoms, lists, `lambda`, `if`, `define`, and `apply` — is precisely what `scheme/12-capstone-metacircular-evaluator.md` builds, in Scheme itself: an interpreter for a subset of Scheme, written in Scheme, making homoiconicity (code-as-data) a working program rather than an assertion. That capstone is this guide's own answer to McCarthy's 66-year-old challenge, verified directly rather than taken on faith.

## Reflection prompts

- McCarthy's paper shows that `cond` (the conditional expression) falls out almost as an aside from a small set of primitives. `scheme/11-environments-eval-apply.md` builds `eval`/`apply` directly. After reading both, which feels more fundamental to you — the conditional, or the eval/apply pair that makes a metacircular interpreter possible at all?
- The Budokan workbook's own prompt: implement a LISP interpreter in Python handling atoms, lists, lambda, if, define, and apply. Do this *before* reading `scheme/12-capstone-metacircular-evaluator.md`, then compare your Python version's shape to the guide's own Scheme-in-Scheme version. What does writing it in a language other than the one being interpreted change?

## Short-answer questions

1. **What was McCarthy actually trying to do when he invented LISP, per the Budokan workbook's own framing?** Define computability using symbolic expressions, as an alternative to Turing's tape-based machine or Church's lambda calculus — LISP itself emerged from that effort rather than being the original goal.
2. **What real capstone in `code-rookie`'s own Scheme guide directly answers the Budokan workbook's own reflection exercise?** `scheme/12-capstone-metacircular-evaluator.md` — an interpreter for a subset of Scheme, written in Scheme itself, verified directly rather than described.
3. **What does "code and data share literally the same representation" mean concretely, and why does `scheme/00-overview.md` call this a genuine first for this series?** A Scheme program's own source code (an S-expression) has the identical structure as Scheme's own list data — a program can construct, inspect, and evaluate other programs using the same operations it uses on ordinary data; every earlier `code-rookie` guide kept these as separate categories.

## Links into the guide

- [`scheme/11-environments-eval-apply.md`](../scheme/11-environments-eval-apply.md) and [`scheme/12-capstone-metacircular-evaluator.md`](../scheme/12-capstone-metacircular-evaluator.md) — the direct, working answer to McCarthy's own paper's central technical claim.

## Cross-thread connection

The Budokan workbook's own master table pairs LISP/Scheme with Bengio et al.'s 2003 neural language model paper — "symbolic → statistical continuum" — and separately notes Hunter's 2012 AI-and-law survey as bridging both. The genuine thread: McCarthy's own symbolic path (manipulate meaning via explicit rules and structure) and the statistical path (learn meaning as geometry, Bengio's own embeddings) were, for decades, treated as rival philosophies of what "intelligence" even meant computationally — the Hunter survey (companion: see the Prolog/Hunter connection) documents legal AI still choosing the symbolic path as late as 2012, the same year AlexNet made the statistical path suddenly, dramatically dominant.
