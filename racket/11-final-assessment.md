# Final Assessment

Across all ten modules and four capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What does `provide` genuinely enforce about an unexported identifier, verified directly in Module 1?
2. What's the practical difference between `#lang racket/base` and `#lang racket`?
3. What does `#:transparent` change about a `struct`, and why might a library author deliberately omit it?
4. What's the difference between what a `racket/contract` checks and what a static type system checks?
5. In the verified `safe-sqrt`/`broken-square` examples, what determines whether blame lands on the caller or the library itself?
6. Why didn't a contract violation on `safe-sqrt`'s argument ever let `sqrt` run on a negative number and produce a complex result?
7. What does `is-a?` actually check, and why might it return `#f` for an object that happens to have a matching method name?
8. What does `(super method-name args...)` do, and how did Capstone 2's `manager%`/`engineer%` use it to avoid duplicating logic?
9. What does a syntax class like `expr` let `syntax-parse` do that plain `syntax-rules` pattern matching can't?
10. What does `~optional`/`#:defaults` let a macro's pattern express, and why did `#:defaults ([g #'"Hello"])` need the `#'`?
11. In Capstone 3, what real limitation did `define-checked`'s precondition check have compared to Capstone 1's `racket/contract` approach?
12. What does `#%app` govern, and what happened in this guide's own first, failed attempt at building `stacklang` without it?
13. Once `#%app`/`#%datum` were fixed, what verified fact proved `stacklang` was a genuinely different, restricted language rather than Racket with extra names?
14. Is a custom `#lang` automatically "Racket plus some extra functions," or does it start from a blank slate?
15. Verified directly against this guide's own anchored toolchain: does Typed Racket work out of the box with `minimal-racket`?

## Answers

1. That it's genuinely unbound to anything outside the module, not merely hidden by naming convention — attempting to reference an unprovided identifier from another module fails exactly like referencing a name that was never defined at all.
2. `racket/base` is a smaller, faster-loading core; `racket` includes a much larger standard library by default — several major features (contracts, classes) need an explicit `require` under either.
3. It makes a struct's fields visible when printed and enables structural equality comparison; a library author might omit it deliberately to keep callers depending only on the struct's accessor functions and provided operations, not on inspecting or comparing its internals directly.
4. A contract checks real values at the actual point they cross a module boundary, at runtime; a static type system checks all possible values a piece of code could produce, at compile time, without running it.
5. Whether the *argument* contract was violated (blames the caller, who supplied the bad value) or the *return* contract was violated (blames the library's own implementation, which failed to honor what it promised).
6. Because the contract check on the argument happens before the function's body ever runs — a value violating the argument contract never reaches the function's internals at all.
7. It checks whether an object's class was explicitly declared to implement a specific named interface; a class with a same-named method that was never declared via `(class* object% (some-interface<%>) ...)` would still return `#f`, because having the right method name alone isn't sufficient.
8. It calls the parent class's own implementation of that method from inside the current override. `manager%`/`engineer%` each called `(super compensation)` to reuse `employee%`'s base-salary logic rather than reimplementing it, so a future change to that base logic would automatically apply to both subclasses.
9. It lets `syntax-parse` know what *kind* of syntax each pattern variable is expected to match, which is exactly what lets it report specific, actionable errors (naming what was missing and where) instead of a generic "no matching clause" failure.
10. It lets a macro's pattern accept an argument that may or may not be present, with a fallback value when omitted, as a single pattern clause. `#:defaults`'s value needs to be syntax the macro's expansion can splice directly into its output, not a plain runtime value — `#'` performs that conversion.
11. It had no blame tracking — it could report that a precondition failed, but not distinguish "the caller passed a bad argument" from "this function's own logic is broken," a distinction `racket/contract` provides structurally.
12. It governs what a parenthesized, function-call-shaped expression actually means. `stacklang`'s first draft provided its own functions but never re-exported `#%app`, so expressions like `(push 3)` had no defined meaning at all, failing with "no #%app syntax transformer is bound."
13. That `+` — one of the most basic names in ordinary Racket — was genuinely unbound inside a `stacklang` program, confirmed directly rather than assumed, proving the language's vocabulary really was restricted to what its module explicitly provided.
14. A blank slate — every core form (application, literals, top-level references) must be deliberately provided by the language's own module if that language is meant to support it at all.
15. No — verified directly, `#lang typed/racket/base` fails with `standard-module-name-resolver: collection not found` against the `minimal-racket` CLI-only distribution this guide anchors to; it requires a separate `raco pkg install typed-racket`.
