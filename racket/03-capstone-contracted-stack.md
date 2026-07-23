# Capstone 1 — A Contracted Stack ADT

Combines every concept from Modules 1–2: a `struct`-backed stack, exported through `contract-out` with a genuinely useful precondition — `pop!`/`peek` are contractually forbidden on an empty stack — verified both in normal use and in a deliberate violation.

## The module

```racket
#lang racket/base
(require racket/contract)

(provide (contract-out
          [make-stack (-> stack?)]
          [stack? (-> any/c boolean?)]
          [stack-empty? (-> stack? boolean?)]
          [push! (-> stack? any/c void?)]
          [pop! (-> (and/c stack? (not/c stack-empty?)) any/c)]
          [peek (-> (and/c stack? (not/c stack-empty?)) any/c)]))

(struct stack (items) #:mutable #:transparent)

(define (make-stack) (stack '()))
(define (stack-empty? s) (null? (stack-items s)))
(define (push! s v) (set-stack-items! s (cons v (stack-items s))) (void))
(define (pop! s)
  (define top (car (stack-items s)))
  (set-stack-items! s (cdr (stack-items s)))
  top)
(define (peek s) (car (stack-items s)))
```

`pop!`/`peek`'s argument contract, `(and/c stack? (not/c stack-empty?))`, is doing real work: it's not just checking "is this a stack," it's enforcing a genuine precondition — *this stack must have something in it* — directly in the exported interface, rather than as a runtime check written by hand inside `pop!`'s own body.

## Verification

**Normal use — LIFO order confirmed directly:**

```racket
(define s (make-stack))
(displayln (stack-empty? s))
(push! s 1) (push! s 2) (push! s 3)
(displayln (peek s))
(displayln (pop! s))
(displayln (pop! s))
(displayln (stack-empty? s))
(displayln (pop! s))
(displayln (stack-empty? s))
```

```
#t
3
3
2
#f
1
#t
```

Verified directly: pushing `1`, `2`, `3` and then popping returns `3`, then `2`, then `1` — correct last-in-first-out order — and `stack-empty?` correctly tracks the stack's state throughout (`#t` when empty, `#f` with one item left, `#t` again after the final pop).

**Deliberate violation — popping an empty stack:**

```racket
(define s (make-stack))
(pop! s)
```

```
pop!: contract violation
  expected: (not/c stack-empty?)
  given: (stack '())
  in: an and/c case of
      the 1st argument of ...
  blaming: /path/to/bad.rkt
   (assuming the contract is correct)
```

Verified directly: the contract catches the violation *before* `pop!`'s body ever runs — there's no chance of `(car '())`'s own, far less informative "car: contract violation" or raw crash happening instead. And the blame correctly lands on the calling file, not `stack.rkt` — the stack module did nothing wrong; the caller tried to pop something it had no right to.

> **Pitfall:** this precondition-as-contract pattern (`(and/c stack? (not/c stack-empty?))`) is materially better than checking `(if (stack-empty? s) (error ...) ...)` by hand inside `pop!`'s body — not because the runtime behavior differs much, but because the constraint is visible directly in the exported interface (in `stack.rkt`'s own `provide` clause), readable by anyone who looks at the module's contracts without needing to read every function body to discover which operations have hidden preconditions.

## Extending it yourself

- Add a `size` operation with a contract guaranteeing a non-negative integer result.
- Add a `stack->list` operation that returns the stack's contents without mutating it, and write a contract ensuring its argument isn't mutated as a side effect (hint: this is genuinely hard to express as a contract — note what you'd actually need, and why contracts check *values*, not *the absence of a side effect*).
