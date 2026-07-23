# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| *Structure and Interpretation of Computer Programs* (Abelson & Sussman) | The book Capstone 4 pays direct homage to — the deeper, fuller version of nearly everything in this guide |
| [MIT/GNU Scheme reference manual](https://www.gnu.org/software/mit-scheme/documentation/stable/mit-scheme-ref/) | The anchored toolchain's own authoritative documentation |
| R7RS-small specification | The standard this guide follows where MIT Scheme doesn't diverge, named honestly where it does |
| This series' [Prolog guide](../prolog/00-overview.md) | Capstone 2's `amb` is this guide's hand-built answer to what Prolog's execution model gives for free |
| This series' [COBOL guide](../cobol/00-overview.md) | The `COPY`-copybook thread Module 13 points at for `define-library`'s own equivalent problem |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `quote`/`'` suppresses evaluation — code and data share one representation | Module 1 |
| `cons`/`car`/`cdr`, `null?` guard before recursing into a list | Module 1 |
| Exact rationals (`1/3`) vs. inexact floats — `(+ 0.1 0.2)` still shows the same binary64 imprecision every language shares | Module 2 |
| Predicate + selector pattern for classifying/destructuring nested S-expressions | Module 3 |
| `deriv` — sum rule and product rule, recursively applied to expression trees | Capstone 1 |
| Named-`let`/`do` — iteration built from ordinary recursive procedure calls | Module 5 |
| Proper tail calls are a *guaranteed* semantic, verified directly against a naive-recursion stack overflow at the same depth | Module 5 |
| Closures capture bindings, not values — `set!` inside one persists across calls | Module 6 |
| `map`/`filter`/`fold-left` — higher-order list processing | Module 6 |
| `call/cc` — capturing "the rest of the computation" as a callable escape | Module 7 |
| `amb`/`require` — hand-built backtracking search from `call/cc` alone | Capstone 2 |
| `define-syntax`/`syntax-rules` — macros rewrite unevaluated code | Module 9 |
| Hygienic expansion — a macro's internal names never collide with the caller's | Module 9 |
| `for-range`/`with-timing` — real control-flow forms only a macro can express | Capstone 3 |
| `define-record-type` — structured data with named fields | Module 11 |
| Environment = frame + parent chain; lookup/define/set! each behave differently | Module 11 |
| `my-eval`/`my-apply` — the eval/apply cycle, written in the language it evaluates | Capstone 4 |

## A note on this guide's verification tier

Every code example in this guide was run against MIT/GNU Scheme 12.1 — no example was written from memory of the language spec and left unverified. One genuine bug was caught and fixed live during Capstone 2's own construction: a first-draft `amb` search using `let` instead of `let*` produced a technically-correct but unexpected result, traced to `let`'s unspecified binding-evaluation order conflicting with `amb`'s sequential trap-door mechanism — left in as teaching material, following this series' own standing practice, rather than quietly rewritten before anyone could see the mistake.

## Where to go now

This guide sits at the head of this series' Lisp-family arc — **Scheme → Racket → Clojure** — tracing one lineage (Module 13 names the Common Lisp/Scheme split precisely, setting up how both descendants get framed) the same way `pascal/`/`modula2/` traced Wirth's own procedural lineage earlier in this series. From here: **Racket**, this series' next guide, where this guide's own closure and macro patterns transfer almost unchanged into a language built specifically for extending itself — the practical, modern payoff of everything Module 9's hygienic macros demonstrated here.
