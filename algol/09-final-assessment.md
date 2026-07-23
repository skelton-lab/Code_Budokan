# Final Assessment

Across all eight modules. Try each on paper first.

1. Name ALGOL 60's three most consequential contributions to language design, and one place each shows up in a language you've already studied.
2. What is stropping, and what specific error does mismatching it produce in this guide's toolchain?
3. Why couldn't original Fortran support recursion, while ALGOL 60 could?
4. What's genuinely ambiguous about `if a then if b then S1 else S2`, and how did ALGOL 60's report resolve it?
5. What ALGOL 68 syntax feature makes that ambiguous shape impossible to write at all?
6. What does call-by-value do with an argument, and how does call-by-name do something fundamentally different?
7. In Jensen's Device, why does the same `Sum` procedure work correctly for both a plain array sum and a dot product, unmodified?
8. Why is this guide's Module 5 the clearest example in this whole series of "important idea, not independently re-verifiable" — what specifically couldn't be executed, and why?
9. What two separate lineages descend directly from ALGOL, both named in Module 8?
10. Why does this guide's overall shape (promise, toolchain, verification standard) differ from every other guide in this series?

## Answers

1. Block structure with lexical scoping (the direct ancestor of `{ }` scoping in C, C++, and JavaScript), the first language specification formally written in BNF (used, directly or via a descendant notation, by every language spec since), and genuine support for recursive procedures (present in every language in this series except original Fortran).
2. The convention marking reserved words in plain text, standing in for the bold typeface the original ALGOL 60 report used to distinguish them from identifiers. Mismatching it in this guide's toolchain (using lowercase `begin`/`end` instead of the required uppercase `BEGIN`/`END`) produces a genuinely unhelpful generic syntax error that gives no hint the real problem is stropping convention.
3. Fortran's original memory model allocated storage for variables statically, at compile time, with no call stack deep enough for a procedure to call itself with fresh storage each time. ALGOL 60's block structure came bundled with dynamic, stack-based storage allocation, which recursion requires.
4. `else S2` could plausibly belong to either the inner `if b` or the outer `if a` — two different parse trees are both grammatically supportable from the same text. ALGOL 60's report resolved it with an explicit rule: `else` binds to the nearest unmatched `if`.
5. Mandatory closing keywords — every `IF` must be closed with its own `FI` — meaning each conditional is a structurally complete unit with no position where an `ELSE` could ambiguously belong to more than one `IF`.
6. Call-by-value copies the argument's current value at the moment of the call, giving the procedure an independent copy. Call-by-name substitutes the actual argument *expression* for every occurrence of the parameter, re-evaluating that expression fresh each time it's referenced within the procedure body.
7. Because `term` is never a fixed value — it's a live, re-evaluated expression supplied entirely by the caller (`a[i]` for a sum, `a[i] * b[i]` for a dot product). The procedure's own definition never mentions any specific array; it just re-evaluates whatever expression the caller wrote, using the shared, by-name loop variable `i`.
8. Module 5 (call-by-name and Jensen's Device) — call-by-name doesn't exist in ALGOL 68 at all (this guide's only available toolchain), so there was no way to compile and run these examples; they're sourced entirely from the actual 1960 Report and well-established secondary sources, verified by hand-traced logic rather than execution.
9. The object-oriented branch (Simula → Smalltalk, directly foreshadowing the class concept Stroustrup drew on for C++) and the systems-programming branch (BCPL → B → C).
10. Every other guide in this series had a "build real, working things" promise in a language still actively used — ALGOL has no such use today, so this guide's actual promise is historical and conceptual literacy instead, with a toolchain that's genuinely split between what's directly executable (ALGOL 68 Genie, for concepts shared with ALGOL 60) and what has to be documented from historical sources instead (ALGOL 60-specific features ALGOL 68 doesn't have).
