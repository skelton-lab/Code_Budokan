# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test (00-overview.md's ecosystem-breadth triage table) — none of them change how Capstones 1–4 turn out, and none are required by an exercise you've been assigned. That's a scoping decision, not an oversight: each entry says what it is, why it matters, and where to go deeper when you actually need it.

### SWI-Prolog's C foreign-function interface

**What it is:** SWI-Prolog ships a full C API (`SWI-Prolog.h`, `PL_register_foreign`, and a family of `PL_*` functions for reading and constructing Prolog terms from C) for writing predicates whose actual implementation is native C code, called exactly like any ordinary Prolog predicate from the Prolog side.

**Why it matters:** this is this series' "C as universal FFI target" thread — named directly in `INDEX.md`'s cross-guide threads section, and previously seen from the Fortran side (`iso_c_binding`) and the C guide's own "C as FFI target" signpost — approached from a completely different kind of language this time. Where Fortran and C were both already "close to the metal," Prolog's C interface exists specifically to let a fundamentally different execution model (unification, backtracking, a WAM-style abstract machine — see below) call into, and be called from, ordinary imperative C.

**Minimal taste:**

```c
#include <SWI-Prolog.h>

foreign_t pl_square(term_t a0, term_t a1) {
    long x;
    if (!PL_get_long(a0, &x)) return FALSE;
    return PL_unify_integer(a1, x * x);
}

install_t install() {
    PL_register_foreign("c_square", 2, pl_square, 0);
}
```

**Where to go next:** the [SWI-Prolog C API documentation](https://www.swi-prolog.org/pldoc/man?section=foreign), starting with its "Foreign Language Interface" chapter.

### The module system

**What it is:** `:- module(Name, ExportList).` at the top of a file declares it a named module, exporting only the predicates listed — every other predicate stays private to that file, and two modules can define same-named predicates without colliding.

**Why it matters:** every capstone in this guide fit in one flat file, on purpose — the paradigm itself was the point, not multi-file project organization. A real, larger Prolog codebase (this guide's own scale times ten or more) needs exactly what every other guide in this series eventually needed some version of: namespacing, controlled exports, avoiding accidental name collisions between unrelated parts of a program.

**Minimal taste:**

```prolog
:- module(mymath, [square/2]).
square(X, Y) :- Y is X*X.
```

**Where to go next:** the [SWI-Prolog module system documentation](https://www.swi-prolog.org/pldoc/man?section=modules).

### WAM internals, clause indexing, and last-call optimization

**What it is:** the Warren Abstract Machine (WAM) — designed by David H. D. Warren in 1983 — is the instruction set nearly every real Prolog implementation, including SWI-Prolog, actually compiles clauses down to internally, rather than interpreting source text directly. Clause indexing (recognizing that a call with a bound first argument can skip clauses whose first argument can't possibly unify, without trying them) and last-call optimization (reusing a stack frame instead of growing it, when a clause's very last goal is a call to itself or another predicate) are the concrete reasons a well-written recursive Prolog predicate doesn't necessarily blow the stack the way Module 4's `length(L,N)` crash did for an unrelated reason.

**Why it matters:** doesn't change any capstone's correctness — Module 4's goal-ordering lesson, which *does* directly affect capstone outcomes, is taught in full. This is the layer underneath that: understanding *why* a correctly-ordered generate-and-test query is fast, down to how the abstract machine actually executes it.

**Where to go next:** Hassan Aït-Kaci's *Warren's Abstract Machine: A Tutorial Reconstruction* — the standard, freely available introduction; the [SWI-Prolog documentation on clause indexing](https://www.swi-prolog.org/pldoc/man?section=clauseindexing) for the practical, implementation-specific version of the same idea.

### Other Prolog systems

**What it is:** SWI-Prolog is this guide's one anchored toolchain, but it's not the only real, actively-used Prolog. GNU Prolog is a lighter, strictly ISO-conformant implementation with its own native-code compiler (`gprolog`) and a built-in constraint solver (`clpfd`-equivalent) from the start. SICStus Prolog is the commercial, industry-standard implementation, long used in telecom and other production settings. Trealla Prolog is a newer, smaller, WebAssembly-friendly implementation.

**Why it matters:** doesn't touch any capstone — every example in this guide runs correctly, unmodified, on SWI-Prolog specifically, and this guide builds no parallel cross-toolchain track. Worth knowing these exist the moment a real project's constraints (licensing, embeddability, strict ISO conformance, WebAssembly deployment) point away from SWI-Prolog's own trade-offs.

**Where to go next:** [gprolog.org](http://www.gprolog.org/) for GNU Prolog; [sicstus.se](https://sicstus.se/) for SICStus; the [Trealla Prolog GitHub repository](https://github.com/trealla-prolog/trealla) for the WebAssembly-oriented option.

### CHR and broader constraint logic programming

**What it is:** Module 5's `library(clpfd)` is constraint logic programming over one specific domain — finite integer ranges. Constraint Handling Rules (CHR), designed by Thom Frühwirth, is a more general rule-based language, embedded in Prolog, for writing constraint solvers over arbitrary domains rather than using a pre-built one; CLP(R) and CLP(Q) extend the same underlying idea to real and rational numbers.

**Why it matters:** `clpfd` alone was enough to take Capstone 2's N-Queens solver from 108 seconds to 1.14 seconds at N=11 — a real, measured, capstone-relevant result, which is exactly why it got a full module rather than a signpost. Writing an entirely new *kind* of constraint solver from scratch, rather than using the finite-domain one this guide already built with, is a different and considerably deeper skill.

**Where to go next:** the [SWI-Prolog CHR library documentation](https://www.swi-prolog.org/pldoc/man?section=chr); Frühwirth's *Constraint Handling Rules* (Cambridge University Press) for the full theory.

### Prolog's history and its place in AI

**What it is:** Prolog was designed in 1972 by Alain Colmerauer's group in Marseille, with major contributions from Robert Kowalski's group in Edinburgh on its logical foundations — it's the direct practical outcome of research into using formal logic (specifically, a resolution-based theorem-proving technique) as an actual programming mechanism, not just a specification tool. It became closely associated with 1980s-era expert systems (Module 9's capstone is a small version of exactly that genre) and was chosen as the base language for Japan's ambitious Fifth Generation Computer Systems project (1982–1992), a government-scale bet that logic programming would be the foundation of the next generation of computing.

**Why it matters:** doesn't touch any capstone directly, but it's real context for *why* this guide's paradigm exists at all, and why it looks nothing like the other eight languages in this series — Prolog wasn't designed as "a better way to write the same kind of program," it's the practical output of a specific, different research tradition (automated theorem proving) that the rest of this series' languages don't share an ancestor with.

**Where to go next:** Robert Kowalski's own retrospective writing on Prolog's origins (widely available, including on his academic homepage); the Fifth Generation Computer Systems project's own retrospectives for the AI-winter context.

### The wider ecosystem

- **[SWI-Prolog documentation](https://www.swi-prolog.org/pldoc/doc_for?object=manual)** — the complete manual for this guide's entire anchored toolchain, including every library this guide used (`lists`, `clpfd`, `plunit`) in full depth beyond this guide's capstone-driven scope.
- **The Association for Logic Programming** — the field's main academic and professional body, for anyone going deeper into logic programming as a research area rather than a single language.
- **Datalog** — a deliberately restricted subset of Prolog (no compound terms as arguments, guaranteed termination) used as a real, production query language in some modern databases and program-analysis tools — a genuinely different design trade-off from this guide's full, Turing-complete Prolog.
