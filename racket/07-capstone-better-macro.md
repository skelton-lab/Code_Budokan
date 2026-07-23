# Capstone 3 — A Better Macro

Combines every concept from Module 6: `define-checked`, a macro defining a function with an *optional* precondition, using syntax classes and `~optional`/`#:defaults` together — and an honest comparison against Capstone 1's `racket/contract` approach to the same underlying problem.

## The macro

```racket
#lang racket/base
(require (for-syntax racket/base syntax/parse))

(define-syntax (define-checked stx)
  (syntax-parse stx
    [(_ (name:id arg:id ...)
        (~optional (~seq #:pre pre:expr) #:defaults ([pre #'#t]))
        body:expr ...+)
     #'(define (name arg ...)
         (unless pre
           (error 'name "precondition failed for arguments: ~a" (list arg ...)))
         body ...)]))
```

`(name:id arg:id ...)` uses the `id` syntax class specifically — the function name and its arguments must be identifiers, not arbitrary expressions, and `syntax-parse` enforces that distinction automatically. `body:expr ...+` (the `+` requiring *at least one* body expression) means `define-checked` with an empty body is rejected at the macro's own pattern-matching stage, before it could ever produce a function with no body to call.

## Verification

```racket
(define-checked (safe-divide a b)
  #:pre (not (zero? b))
  (/ a b))
(displayln (safe-divide 10 2))

(define-checked (double x) (* x 2))
(displayln (double 21))

(safe-divide 5 0)
```

```
5
42
safe-divide: precondition failed for arguments: (5 0)
```

Verified directly: `safe-divide` with a real precondition works normally when satisfied (`10/2 = 5`), and `double` — defined with **no** `#:pre` clause at all, relying on `~optional`'s default of plain `#t` — works exactly like an ordinary `define` (`21 * 2 = 42`), confirming the keyword argument really is optional, not silently required. `(safe-divide 5 0)` correctly triggers the precondition failure with a clear, specific error naming the function and the actual arguments that violated it.

> **The honest comparison to Capstone 1's contracts:** `define-checked`'s error message is genuinely useful, but it's missing something Capstone 1's `racket/contract` gave you for free — **blame**. `pop!`'s contract violation named *which file* was at fault (the caller, for popping an empty stack). `safe-divide`'s precondition failure here just says the precondition failed — it doesn't distinguish "the caller passed a bad `b`" from "this function's own logic is broken," because that distinction isn't part of what this macro was built to express. This is a real, honest limitation, not a bug to fix: `racket/contract` is a purpose-built system for exactly this class of problem (interface-boundary checking with blame tracking); `define-checked` is a much smaller, hand-rolled tool solving a narrower slice of the same need. Knowing when to reach for a real contract instead of rolling your own macro-based check is itself part of what this capstone is meant to teach.

## Extending it yourself

- Add a `#:post` keyword (checking the function's *return value* against a predicate, analogous to a contract's range check) alongside the existing `#:pre`.
- Rewrite `define-checked` to actually blame differently based on whether `#:pre` or `#:post` failed — and notice how much closer this gets you to reimplementing a small piece of what `racket/contract` already does, which is exactly the point: contracts exist because this problem is more subtle than it first looks.
