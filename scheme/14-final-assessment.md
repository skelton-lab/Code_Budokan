# Final Assessment

Across all thirteen modules and four capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What does `quote` change about how an expression is evaluated, and why does it matter for representing code as data?
2. What error occurs if `car`/`cdr` is called on `'()`, and what discipline avoids it?
3. What's the difference between an exact number and an inexact number in Scheme, verified directly with a specific example?
4. Why did `(+ 0.1 0.2)` produce the identical result in Scheme as in Python, JavaScript, Ruby, and C?
5. Why does `sum?` check `pair?` before calling `(car expr)`?
6. What did `count-nodes` demonstrate about processing a nested expression tree?
7. What real, honest limitation does Capstone 1's `(+ x x)` (instead of `(* 2 x)`) reveal about its simplifier?
8. What's the actual definition of "tail position," and what did this guide's own verified test show about the consequence of a call not being in tail position?
9. What does a closure capture — a value, or a binding?
10. What did the `make-counter` example demonstrate that `make-adder` did not?
11. What does `call/cc` hand to the procedure passed to it?
12. In Capstone 2, what real bug did switching from `let` to `let*` fix, and why?
13. What's the fundamental difference between a macro's "arguments" and a procedure's arguments?
14. What did the `my-swap!` hygiene test prove, using a variable deliberately named the same as the macro's internal temporary?
15. What does an environment's chain of frames represent, and what did the worked `set-variable-value!` example show about shadowing?
16. In the metacircular evaluator, what real transformation does `definition-val` perform for the `(define (square x) (* x x))` shorthand?
17. Why did `fact`'s recursive self-call work correctly inside `my-eval`/`my-apply`, rather than failing to find `fact` at all?
18. What does this guide's own metacircular evaluator explicitly *not* implement, stated honestly rather than glossed over?

## Answers

1. `quote` suppresses evaluation, so an expression is treated as literal data (a list/symbol/number) instead of being evaluated as a procedure call or variable reference — this is the entire mechanism that lets Scheme code be represented and manipulated as ordinary list data, the foundation Capstone 4's evaluator is built on.
2. It's an error, not a graceful empty result — every recursive list-processing function needs to check `null?` before calling `car`/`cdr`.
3. An exact number (like `1/3`) is stored as a precise ratio with no approximation; verified directly, `(+ 1/3 1/6)` computes to exactly `1/2`, while an inexact number like `0.1` is an ordinary floating-point approximation from the moment it's written.
4. Because a decimal literal like `0.1` is inexact in Scheme too, using the same IEEE 754 binary64 representation every one of those languages uses — the imprecision isn't a Scheme-specific bug, it's a property of that shared binary representation.
5. Because `(car expr)` is an error if `expr` isn't a pair — checking `pair?` first, combined with `and`'s short-circuit evaluation, guarantees `car` is never called on something unsafe.
6. That correctly processing a nested expression tree means recursing into *every* branch, not just the top-level elements — `(+ x (* y 5))` counted as `5` nodes because the count recursed all the way into the `(* y 5)` sub-expression, not just treated it as one unit.
7. That the simplifier only ever checks against literal `0`/`1` values — it has no mechanism for recognizing that two structurally identical sub-expressions (`x` and `x`) could be combined into a coefficient, which would require comparing whole sub-expressions for structural equality, a materially harder problem left out on purpose.
8. A call is in tail position if it's the last thing a procedure does, with nothing left to compute after it returns. Verified directly: a tail-recursive sum to 10,000,000 completed correctly with no stack growth, while an otherwise-identical naive version (whose recursive call was not in tail position, since an addition still had to happen after it returned) aborted with "maximum recursion depth exceeded" at the same depth.
9. The binding itself, not a frozen copy of its value — mutating a captured variable via `set!` is visible on every subsequent call to the closure.
10. That a closure's captured state can be genuinely mutable and persistent across multiple calls, not just a fixed value captured once at creation time.
11. The current continuation — a callable procedure representing everything that would otherwise happen with the result of the `call/cc` expression, all the way out to its own caller.
12. Using `let` (simultaneous bindings) for `a`/`b` produced a still-technically-correct but non-leftmost result (`(5 5)` instead of `(1 9)`), because `amb`'s trap-door backtracking mechanism depends on a strict, sequential evaluation order that plain `let` doesn't guarantee; switching to `let*` fixed it.
13. A macro's arguments are unevaluated syntax that the macro pattern-matches and rewrites into new code at expansion time; a procedure's arguments are already-computed values, evaluated once before the call happens.
14. That Scheme's hygienic macro expansion keeps a macro's internally-introduced identifiers distinct from the caller's identifiers, even when they're textually identical — the swap correctly produced `(200 100)` rather than a wrong result from the two `temp`s colliding.
15. Each frame represents one level of lexical scope, chained to its enclosing environment via a parent pointer. The `set-variable-value!` example showed that mutating a variable through one environment (`global-env`) does not affect a separately-bound, shadowing copy of that same-named variable reachable only through a different environment (`inner-env`) — the two are genuinely distinct bindings, not aliases.
16. It detects the shorthand form (the definition's second element being a pair, not a bare symbol) and builds the equivalent explicit `(lambda (params) body)` form — `(define (square x) (* x x))` becomes exactly what `(define square (lambda (x) (* x x)))` would have produced.
17. Because `fact`'s closure captured its *defining environment* (`global-env`, via `make-procedure`), and `fact` itself was `define!`d into that same environment before being called — when the procedure's body looks up the symbol `fact` again during a recursive call, that lookup searches the same environment chain and finds the very definition it's currently executing.
18. `let`, `cond`, `and`/`or`, tail-call optimization guarantees within the evaluator's own recursive calls, `call/cc`, and macros — stated explicitly as a real, honest scope limit rather than left as a silent gap.
