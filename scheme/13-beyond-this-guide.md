# Module 13 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones. Each entry states what it is, why it matters, and where to go deeper.

### Common Lisp vs. Scheme

**What it is:** Scheme and Common Lisp are siblings, not the same language — both trace to McCarthy's original 1958 Lisp, but diverged sharply. Common Lisp (standardized 1984) kept a large, feature-rich standard library, separate namespaces for functions and variables (a "Lisp-2," where `(f f)` calling a function named the same as a variable is unambiguous), and no standard guarantee of proper tail calls. Scheme (1975 onward) went the opposite direction: a deliberately minimal core language, one shared namespace for functions and variables (a "Lisp-1" — this guide's own `(define (make-adder n) (lambda (x) (+ x n)))` relies on this, since `n` and the returned procedure share the same kind of binding), and the *guaranteed* proper tail calls Module 5 verified directly.

**Why it matters:** this series is about to build guides for Racket and Clojure — Racket is a direct Scheme descendant (this guide's `my-swap!`/`for-range` macro patterns transfer almost unchanged), while Clojure, despite being a modern Lisp, made several Common-Lisp-flavored choices of its own (and several genuinely new ones, like persistent immutable data structures by default). Knowing the Scheme/Common-Lisp split precisely is what makes both of those guides' own family-tree framing make sense later, rather than "it's all just Lisp."

**Where to go next:** *Practical Common Lisp* (Peter Seibel) for the CL side; the R7RS specification itself for exactly what Scheme standardizes.

### The R7RS module system (`define-library`)

**What it is:** R7RS-small standardizes `define-library`/`import` for splitting a program across files with explicit exports — Scheme's answer to the same problem COBOL's `COPY` copybooks (`cobol/10-copybooks-subprograms.md`) and every other language in this series has its own answer to.

**Why it matters:** none of this guide's capstones needed more than one file, so it never came up — but any Scheme program past a certain size needs it, and MIT Scheme's own library support has real, specific divergences from strict R7RS worth knowing about before relying on it.

**Where to go next:** the R7RS-small specification's library chapter; MIT/GNU Scheme's own reference manual for exactly where its support diverges.

### Full continuation theory: `dynamic-wind` and re-entrant continuations

**What it is:** Module 7/Capstone 2 used `call/cc` exclusively for **escape** continuations — calling a captured continuation once, to jump *out* of a computation. Scheme's continuations are actually far stranger: a captured continuation can be called *more than once*, even after the original `call/cc` expression has already returned a value once — genuinely resuming a "finished" computation from scratch. `dynamic-wind` is the standard mechanism for ensuring cleanup code runs correctly even when control jumps across it via a continuation.

**Why it matters:** re-entrant continuations are genuinely one of the strangest, most powerful control-flow ideas in mainstream programming-language design — but they're also subtle enough to get wrong in ways that don't show up until a program's control flow gets non-trivial, and neither of this guide's capstones needed anything beyond escape continuations to be correct and complete.

**Where to go next:** SICP's own continuations material (the book this guide's Capstone 4 pays direct homage to) covers this in depth; "Continuations, Generators, and Coroutines" style tutorials for concrete re-entrant examples.

### Concurrency and threads

**What it is:** MIT Scheme has its own threading facilities, distinct from the OS-thread model most of this series' other languages expose.

**Why it matters:** genuinely useful in real programs, but no capstone here needed concurrent execution to be correct.

**Where to go next:** MIT/GNU Scheme's reference manual, threading chapter.

### FFI and interop

**What it is:** calling code written in another language (typically C) from Scheme.

**Why it matters:** this series has a running C-as-universal-FFI-target thread (most directly demonstrated in `cobol/10-copybooks-subprograms.md`'s direct C interop) — MIT Scheme has its own facilities here, but this guide didn't verify a working example against this exact toolchain the way the COBOL guide did, so it's named honestly as unverified rather than demonstrated as fact.

**Where to go next:** MIT/GNU Scheme's reference manual for its specific C-interop facilities.

### Generic and object systems beyond `define-record-type`

**What it is:** `define-record-type` (used throughout Modules 11–12) gives you structured data with named fields, but no inheritance, no generic dispatch on type, no method overriding — the polymorphism mechanisms this series has traced since `c/`'s hand-built function pointers.

**Why it matters:** Capstone 4's `compound-procedure` record type was sufficient for a working metacircular evaluator; a larger Scheme program modeling a genuine class hierarchy would need more, and Scheme implementations vary widely in what they offer beyond the standard.

**Where to go next:** MIT/GNU Scheme's own object-oriented extensions, if any are needed; this series' upcoming Clojure guide, which takes a genuinely different, protocol-based approach to the same underlying problem.

## The wider ecosystem

- **_Structure and Interpretation of Computer Programs_ (Abelson & Sussman)** — the book this entire guide's Capstone 4 pays direct homage to; freely available, and the deeper, fuller version of nearly everything this guide covers.
- **MIT/GNU Scheme reference manual** — the anchored toolchain's own authoritative documentation.
- **This series' [Prolog guide](../prolog/00-overview.md)** — Capstone 2's `amb` is this guide's direct, hand-built answer to what Prolog's execution model gives you automatically.
- **This series' upcoming Racket guide** — the direct Scheme descendant, where this guide's own macro and closure patterns transfer almost unchanged.
