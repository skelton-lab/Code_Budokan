# Capstone 2 — Continuations-Based Control Flow

Combines every concept from Modules 5–7: closures, `call/cc`, and mutable state to build `amb` — McCarthy's ambiguous-choice operator, the classic demonstration of what Prolog gives you built into the language, built here entirely by hand from `call/cc` and nothing else.

## The direct connection to Prolog

`prolog/02-recursion-backtracking-lists.md` covers backtracking as a language-level feature — Prolog's engine automatically tries alternatives and retries on failure, with no code written for it at all. Scheme has no such built-in mechanism. This capstone builds the exact same capability from first principles: an `amb` form that tries a choice, and — if a later `require` fails — automatically resumes at the most recent unexplored choice, exactly like Prolog's own backtracking, except every step of *how* that happens is visible, hand-written Scheme.

## The `amb` operator

```scheme
(define fail (lambda () (error "amb tree exhausted")))

(define-syntax amb
  (syntax-rules ()
    ((amb) (fail))
    ((amb expr) expr)
    ((amb expr rest ...)
     (let ((old-fail fail))
       (call/cc (lambda (k-success)
         (call/cc (lambda (k-failure)
           (set! fail (lambda () (set! fail old-fail) (k-failure 'fail)))
           (k-success expr)))
         (set! fail old-fail)
         (amb rest ...)))))))

(define (require pred)
  (if (not pred) (fail)))
```

`(amb 1 2 3)` expands recursively: try `1` first, immediately jumping out (`k-success`) to continue the surrounding computation as if `1` were the only value. If a later `require` calls `fail`, control jumps back to `k-failure`'s continuation — which restores the *previous* `fail` and tries `(amb 2 3)` next. Each `amb` choice, in effect, leaves a trap door behind it that `fail` knows how to fall through.

## Verification

**Two-sum, using `amb` for genuine search rather than a loop:**

```scheme
(define (two-sum)
  (let* ((a (amb 1 2 3 4 5))
         (b (amb 5 6 7 8 9)))
    (require (= (+ a b) 10))
    (list a b)))
(display (two-sum)) (newline)
```

```
(1 9)
```

Verified directly: the search correctly found `a=1, b=9` — the *first* combination in left-to-right order satisfying `a + b = 10`, confirming `amb`'s backtracking explored `a=1` fully (`b=5,6,7,8` all failing the `require`) before advancing `b` to `9`, which succeeds, without ever needing to backtrack into `a` at all.

> **Pitfall, caught during this capstone's own verification:** the first draft of `two-sum` used `let` (simultaneous bindings) instead of `let*` (sequential bindings) for `a` and `b`. With `let`, the result came back as `(5 5)` — still a *correct* answer (`5+5=10`), but not the leftmost one a hand-trace would predict, because `let`'s binding evaluation order isn't guaranteed to be strictly sequential the way `amb`'s trap-door mechanism assumes. Switching to `let*` fixed it, and it's the form used throughout this capstone. `amb` depends on `fail` being reset in a precise sequence — an evaluation-order assumption `let*` guarantees and plain `let` does not.

**4-Queens and 6-Queens, the same generate-and-test structure `prolog/05-capstone-search.md` used, built here entirely from `amb`/`require`:**

```scheme
(define (queens-amb board-size)
  (define (safe? col placed dist)
    (cond ((null? placed) #t)
          ((= (car placed) col) #f)
          ((= (abs (- (car placed) col)) dist) #f)
          (else (safe? col (cdr placed) (+ dist 1)))))
  (define (place-queens row placed)
    (if (> row board-size)
        placed
        (let* ((col (amb 1 2 3 4 5 6 7 8)))
          (require (<= col board-size))
          (require (safe? col placed 1))
          (place-queens (+ row 1) (cons col placed)))))
  (reverse (place-queens 1 '())))

(display (queens-amb 4)) (newline)
(display (queens-amb 6)) (newline)
```

```
(2 4 1 3)
(2 4 6 1 3 5)
```

Verified by hand against the placement rules `safe?` itself enforces: no two queens share a column (all four/six values distinct), and no two share a diagonal (`|column difference| ≠ row difference` for every pair) — both are genuinely valid N-Queens solutions, found by a search this capstone built entirely out of `call/cc`, with no language-level search or backtracking feature involved anywhere.

> **The honest comparison to Prolog:** this is materially more code, and materially more subtle to get right (the `let`/`let*` bug above is real evidence of that), than Prolog's own N-Queens capstone — which needed no `amb`, no `fail`, no continuation-juggling at all, because backtracking search is simply how Prolog's execution model works by default. That gap is the actual point of this capstone: it's not that Scheme *can't* backtrack, it's that Prolog built it into the language's execution model from the ground up, and Scheme instead gives you `call/cc` — general enough to build backtracking (or generators, or exception handling, or many other control-flow patterns) yourself, at the cost of building it yourself.

## Extending it yourself

- Extend `queens-amb` to find *all* solutions for a given board size, not just the first — you'll need `amb`'s failure-driven-loop mechanism to keep exhausting choices rather than stopping at the first success (hint: catch `fail`'s eventual "no more choices" error at the top level, after collecting each solution found along the way).
- Solve a simple logic puzzle of your own design (three people, three houses, a handful of clues) using `amb`/`require`, directly mirroring the structure of a real Prolog program's facts-and-constraints style, just built from continuations instead.
