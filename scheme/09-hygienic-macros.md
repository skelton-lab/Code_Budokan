# Module 9 — Hygienic Macros

By the end of this module you'll be able to define a new syntactic form with `define-syntax`/`syntax-rules`, and explain — with a direct, verified demonstration — what "hygienic" actually guarantees. Feeds Capstone 3.

## `define-syntax`/`syntax-rules`: a macro vs. a procedure

**You'll be able to:** write a macro that introduces a new control-flow form the language doesn't have natively.

**Concept**

A macro operates on *unevaluated* code — its arguments arrive as raw syntax, not computed values, and it produces new syntax to be evaluated in its place. This is the concrete payoff of Module 1's core idea (code and data share one representation): a macro is a function from S-expressions to S-expressions, running at expansion time rather than at the moment its "arguments" would otherwise be evaluated. `syntax-rules` defines a macro by pattern: each rule matches a shape of the macro's call and specifies what code to produce in its place.

**Example**

```scheme
(define-syntax my-while
  (syntax-rules ()
    ((_ condition body ...)
     (let loop ()
       (when condition
         body ...
         (loop))))))

(define i 0)
(my-while (< i 5)
  (display i) (display " ")
  (set! i (+ i 1)))
(newline)
```

```
0 1 2 3 4 
```

Verified directly: `my-while` behaves exactly like a native `while` loop, even though Scheme has no such keyword — the macro expands `(my-while (< i 5) body...)` into a named-`let` loop (Module 5) that checks the condition, runs the body, and recurses, entirely at expansion time. Crucially, `condition` is re-evaluated on every pass, exactly as a real `while` loop requires — this only works because the macro expanded to code that re-checks `condition` inside the loop, not because it evaluated `condition` once as an ordinary argument would be.

> **Pitfall:** a macro's arguments are never evaluated the way a procedure call's arguments are — passing `(begin (display "evaluated!") (< i 5))` as `my-while`'s condition would print `"evaluated!"` once *per loop iteration*, not once total, because the macro's expansion places that whole expression directly into the loop body, to be re-evaluated on every pass. This is exactly why a macro can do things an ordinary procedure fundamentally cannot — `my-while`'s condition couldn't be re-checked each iteration if it were an ordinary procedure argument, since procedure arguments are evaluated once, before the call happens.

**Practice**

- Write `my-unless` (already introduced briefly in this guide's own design-verification pass) as a macro expanding to `if`.
- Write `my-for` taking a variable name, a start value, and an end value, expanding to a counted loop using named-`let`.

## Hygiene: why a macro's internal names don't collide with yours

**You'll be able to:** explain, with a direct verified example, what "hygienic macro expansion" actually prevents.

**Concept**

A naively-implemented macro system risks **variable capture**: if a macro's expansion introduces a temporary variable (say, `temp`, for a swap operation), and the code calling the macro happens to already use a variable named `temp`, a non-hygienic macro system could silently let the two collide. Scheme's `syntax-rules` is **hygienic** — it guarantees that identifiers introduced by a macro's expansion never accidentally capture or get captured by identifiers from the code the macro is expanding into, even when the names are textually identical.

**Example**

```scheme
(define-syntax my-swap!
  (syntax-rules ()
    ((_ a b)
     (let ((temp a))
       (set! a b)
       (set! b temp)))))

(define temp 100)
(define y 200)
(my-swap! temp y)
(display (list temp y)) (newline)
```

```
(200 100)
```

Verified directly: the caller's own variable, deliberately named `temp` — the exact same name the macro uses internally for its own temporary binding — swapped correctly with `y`, producing `(200 100)`. A non-hygienic macro expansion would have textually substituted the caller's `temp` in for `a`, then created its *own* `temp` binding that shadows or collides with it, most likely producing a wrong result (`(200 200)`, both ending up holding `y`'s original value) or an outright error. Scheme's macro system distinguishes the macro's internally-introduced `temp` from the caller's `temp` automatically, with no manual gensym-style trickery required from whoever wrote `my-swap!`.

> **Pitfall:** hygiene protects the macro's *own* introduced identifiers from colliding with the caller's — it does not protect the caller from passing in genuinely conflicting expressions on purpose (`(my-swap! x x)`, say). Hygiene is about accidental capture from the macro's internal implementation details leaking out, not a general-purpose safety net for every way a macro's arguments could interact.

**Practice**

- Predict what `my-swap!` would need to do differently if `syntax-rules` were *not* hygienic, to avoid the `temp`-collision bug demonstrated above.
- Write a macro `my-or2` implementing two-argument short-circuit `or` from scratch using `if`, and verify it works correctly even when called as `(my-or2 tmp #t)` with a variable literally named `tmp`.

## Progress check

1. What's the fundamental difference between what a macro's "arguments" are, compared to a procedure's arguments?
2. Why does `my-while`'s condition get re-checked on every loop iteration, when an ordinary procedure argument would only be evaluated once?
3. What is "variable capture," and what did this module's verified `my-swap!` example show about it?
4. Does hygiene protect against every possible naming conflict a macro's caller could create, or something more specific?
5. Why couldn't `my-while` be written as an ordinary procedure instead of a macro?

### Answers

1. A macro's arguments are unevaluated syntax (raw S-expressions) that the macro pattern-matches against and rewrites into new code; a procedure's arguments are values, already computed before the call happens.
2. Because the macro expands `condition` directly into the loop body's `when` check, to be re-evaluated fresh on every pass through the named-`let` — it's genuinely re-checked source code in the expansion, not a value computed once and reused.
3. Variable capture is when a macro's internally-introduced identifier accidentally collides with an identifier already in use by the code calling the macro. This module's verified example showed that calling `my-swap!` on a variable literally named `temp` — colliding with the macro's own internal `temp` — still produced the correct result (`(200 100)`), because Scheme's hygienic macro expansion keeps the two `temp`s distinct automatically.
4. Something more specific — it protects the macro's *own* internally-introduced names from accidentally capturing (or being captured by) the caller's names; it doesn't prevent every conceivable way a caller's own arguments could interact with each other on purpose.
5. Because an ordinary procedure's arguments are evaluated once, before the call — `my-while`'s condition needs to be re-evaluated fresh on every single loop iteration, which requires the condition to exist as unevaluated code in the expansion, not as a single computed value passed in once.
