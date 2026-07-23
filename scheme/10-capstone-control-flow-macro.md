# Capstone 3 — A New Control-Flow Macro

Combines every concept from Module 9: two genuinely useful control-flow forms Scheme doesn't have natively, both requiring macro expansion rather than an ordinary procedure to work correctly.

## `for-range`: a counted loop with an exposed induction variable

```scheme
(define-syntax for-range
  (syntax-rules ()
    ((_ (var start end) body ...)
     (let loop ((var start))
       (when (< var end)
         body ...
         (loop (+ var 1)))))))
```

```scheme
(for-range (i 0 5)
  (display i) (display " "))
(newline)

(for-range (i 0 3)
  (for-range (j 0 3)
    (display (list i j)) (display " ")))
(newline)
```

```
0 1 2 3 4 
(0 0) (0 1) (0 2) (1 0) (1 1) (1 2) (2 0) (2 1) (2 2) 
```

Verified directly: single and nested `for-range` loops both work exactly as a native `for` loop would — `i` and `j` are genuine, independently-scoped loop variables introduced fresh by each macro expansion, not global mutable state shared between the two nested loops (confirmed by the nested example correctly producing all nine `(i j)` pairs, not garbage from the two loop variables colliding).

## `with-timing`: measuring a body without an explicit `lambda`

```scheme
(define-syntax with-timing
  (syntax-rules ()
    ((_ label body ...)
     (let ((start (runtime)))
       (let ((result (begin body ...)))
         (display label) (display ": ")
         (display (- (runtime) start))
         (display " sec")
         (newline)
         result)))))
```

```scheme
(define (busy-count n)
  (let loop ((i 0) (acc 0))
    (if (> i n) acc (loop (+ i 1) (+ acc i)))))

(display (with-timing "busy-count to 1,000,000" (busy-count 1000000)))
(newline)
```

```
busy-count to 1,000,000: .21000000000000002 sec
500000500000
```

Verified directly, checking both effects at once: `with-timing` printed a real, measured elapsed time (`(runtime)` — MIT Scheme's process CPU-time clock, called before and after `body`), *and* correctly returned `busy-count`'s actual result (`500000500000`, matching `n(n+1)/2` for `n=1000000`) back to the outer `display` — the macro is transparent to its body's return value, not just a side-effecting wrapper around it.

> **Why this genuinely needs to be a macro, not a procedure:** an ordinary procedure `(with-timing-proc label thunk)` could do the same job, but only if the caller wraps their code in an explicit `(lambda () ...)` first — `(with-timing-proc "label" (lambda () (busy-count 1000000)))`, not the cleaner `(with-timing "label" (busy-count 1000000))` shown above. The macro version lets `body ...` appear as ordinary-looking code at the call site, with the "wrap it so it doesn't run until the right moment" mechanics handled invisibly by the macro's expansion into a `let` — exactly Module 9's core lesson about what a macro can do that a procedure fundamentally can't (a procedure's arguments are always evaluated before the call, so there's no way to say "run this code, but only after I've started my timer" using an ordinary procedure call alone).

## Extending it yourself

- Add a `for-range` variant, `for-range-by`, taking an explicit step value: `(for-range-by (i 0 10 2) ...)`, counting by twos.
- Combine both macros: use `with-timing` to measure a `for-range` loop performing real work (like the tail-recursive sums from Module 5), and confirm the measured time scales roughly linearly as you increase the range.
