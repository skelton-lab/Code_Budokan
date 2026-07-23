# Capstone 4 — A Custom `#lang`

Combines every concept from Module 8: a complete, working, genuinely restricted language — `stacklang` — where programs are sequences of stack operations, not ordinary Racket function calls, verified as authentically different from Racket by confirming plain Racket operators simply don't exist inside it.

## The language

`stacklang/main.rkt`:

```racket
#lang racket/base
(require (for-syntax racket/base))
(provide (rename-out [stack-module-begin #%module-begin])
         #%app #%datum #%top
         push add sub mul print-top)

(define stack '())

(define (push n) (set! stack (cons n stack)))
(define (add) (let ((a (car stack)) (b (cadr stack)))
                (set! stack (cons (+ a b) (cddr stack)))))
(define (sub) (let ((a (car stack)) (b (cadr stack)))
                (set! stack (cons (- b a) (cddr stack)))))
(define (mul) (let ((a (car stack)) (b (cadr stack)))
                (set! stack (cons (* a b) (cddr stack)))))
(define (print-top) (displayln (car stack)))

(define-syntax (stack-module-begin stx)
  (syntax-case stx ()
    ((_ form ...)
     #'(#%module-begin form ...))))
```

`push`/`add`/`sub`/`mul`/`print-top` are the entire vocabulary this language offers. `#%app`, `#%datum`, and `#%top` are re-exported from `racket/base` unchanged — this language doesn't need to redefine what a function call or a numeric literal *means*, just restrict what names are available to call. `stack-module-begin` wraps the whole program's body in `#%module-begin`, unchanged — this language isn't customizing top-level program structure, just its vocabulary.

## A program written in `stacklang`

```
#lang s-exp "stacklang/main.rkt"
(push 3)
(push 4)
(add)
(push 2)
(mul)
(print-top)
```

## Verification

```bash
$ racket program.rkt
14
```

Checked by hand: `push 3` → stack `(3)`; `push 4` → `(4 3)`; `add` → pops `4` and `3`, pushes `7` → `(7)`; `push 2` → `(2 7)`; `mul` → pops `2` and `7`, pushes `14` → `(14)`; `print-top` displays `14`. `(3 + 4) * 2 = 14`, matching the program's actual output exactly.

**The verification that actually matters — proving this is a real, different language, not Racket with extra names:**

```
#lang s-exp "stacklang/main.rkt"
(+ 1 2)
```

```
program_bad.rkt:2:1: +: unbound identifier
  in: +
```

Verified directly: `+`, one of the most basic names in ordinary Racket, is **genuinely unbound** inside `stacklang` — not shadowed, not deprecated, simply never provided by this language's module at all. A `stacklang` program cannot reach for ordinary Racket arithmetic, string operations, conditionals, or anything else outside the five names `stacklang/main.rkt` explicitly exports. This is the actual, concrete meaning of "language-oriented programming": `stacklang` isn't a Racket library imported into a Racket program — from the perspective of anything written under its own `#lang` line, it's the only language that file knows.

> **The honest scope of this capstone:** `stacklang` reinterprets ordinary S-expression syntax — it's still parenthesized prefix notation underneath, just restricted vocabulary and custom semantics for `#%module-begin`. A language with genuinely different *surface syntax* (infix arithmetic, significant whitespace, anything that doesn't look like S-expressions at all) needs a custom **reader**, not just a custom set of provided forms — a materially larger undertaking than this capstone attempts, named honestly in Module 10's signposts rather than glossed over as "basically the same thing."

## Extending it yourself

- Add a `dup` operation (duplicate the top of the stack) and a `sub` fix if needed — trace through a program using it by hand before running it.
- Add a `#%datum` override that rejects non-integer literals outright (currently, `stacklang` inherits `racket/base`'s `#%datum`, which would happily accept `3.5` or `"hello"` even though this language's operations don't meaningfully support them) — and verify a program using a string literal now fails to compile, rather than failing confusingly at runtime inside `add`.
