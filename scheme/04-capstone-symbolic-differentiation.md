# Capstone 1 — Symbolic Differentiation

Combines every concept from Modules 1–3: S-expressions as data, exact numbers, and data-directed recursion — a real symbolic differentiator that takes an algebraic expression represented as a list and produces its derivative, also as a list, applying the sum rule and product rule recursively.

## The program

```scheme
(define (variable? x) (symbol? x))
(define (same-variable? v1 v2) (and (variable? v1) (variable? v2) (eq? v1 v2)))

(define (sum? x) (and (pair? x) (eq? (car x) '+)))
(define (addend s) (cadr s))
(define (augend s) (caddr s))

(define (product? x) (and (pair? x) (eq? (car x) '*)))
(define (multiplier p) (cadr p))
(define (multiplicand p) (caddr p))

(define (make-sum a1 a2)
  (cond ((and (number? a1) (= a1 0)) a2)
        ((and (number? a2) (= a2 0)) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        (else (list '+ a1 a2))))

(define (make-product m1 m2)
  (cond ((or (and (number? m1) (= m1 0))
             (and (number? m2) (= m2 0)))
         0)
        ((and (number? m1) (= m1 1)) m2)
        ((and (number? m2) (= m2 1)) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list '* m1 m2))))

(define (deriv expr var)
  (cond ((number? expr) 0)
        ((variable? expr) (if (same-variable? expr var) 1 0))
        ((sum? expr) (make-sum (deriv (addend expr) var)
                                (deriv (augend expr) var)))
        ((product? expr)
         (make-sum
           (make-product (multiplier expr)
                          (deriv (multiplicand expr) var))
           (make-product (deriv (multiplier expr) var)
                         (multiplicand expr))))
        (else (error "unknown expression type" expr))))
```

`make-sum` and `make-product` aren't strictly necessary for correctness — `deriv` could build raw `(list '+ a1 a2)` everywhere — but without them, differentiating even a small expression produces a result cluttered with `(+ x 0)`, `(* 1 y)`, and similar dead weight. They're a real, if modest, simplifier, applying the algebraic identities `x + 0 = x`, `x * 0 = 0`, and `x * 1 = x` at construction time rather than as a separate cleanup pass.

## Verification

```
$ mit-scheme --quiet < capstone1.scm
1
y
(+ x x)
(+ (* x y) (* y (+ x 3)))
1/3
#t
```

Checked by hand against each input:

- `d/dx (x + 3) = 1` — the sum rule, with `3`'s derivative (`0`) simplified away entirely by `make-sum`.
- `d/dx (x * y) = y` — the product rule, with `y`'s derivative (`0`, since we're differentiating with respect to `x`) simplified away by `make-product`.
- `d/dx (x * x) = (+ x x)` — the product rule applied correctly (`x·d(x) + d(x)·x = x·1 + 1·x`), but landing on `(+ x x)`, **not** the more familiar `2x`. This is real and correct, not a bug: `make-sum` has no rule for combining two identical terms into a coefficient — it only ever simplifies against literal `0`/`1`.
- `d/dx ((x·y)·(x+3))` correctly applies the product rule one level deeper, producing `(+ (* x y) (* y (+ x 3)))` — worked out by hand: with `u = x·y`, `v = x+3`, `d(u·v)/dx = u·d(v) + d(u)·v = (x·y)·1 + y·(x+3)`, matching exactly.
- `d/dx (1/3 · x) = 1/3`, confirmed **exact** (`(exact? ...)` → `#t`) — Module 2's numeric-precision thread carried all the way through a multi-step symbolic computation with no float ever entering the picture.

> **Pitfall, real and left in deliberately:** `(+ x x)` instead of `(* 2 x)` is a genuine, honest limitation of this capstone's simplifier, not something quietly patched over. A production computer-algebra system needs a term-collection pass that recognizes `(+ x x)` as "the same term twice" and rewrites it — a materially harder problem than the literal-`0`/`1` simplifications `make-sum`/`make-product` perform here, and out of scope for what this capstone set out to prove.

## Extending it yourself

- Add `difference?`/`minuend`/`subtrahend` (Module 3's practice exercise) and extend `deriv` to handle `(- x y)` using the standard difference rule.
- Add a case for `(expt base n)` (a base raised to a constant power), implementing the power rule: `d/dx(uⁿ) = n·u^(n-1)·d(u)`.
- Try to make `make-sum` recognize `(+ x x)` and simplify it to `(* 2 x)` — and notice how much more this requires than the literal-value checks already there (you'll need `equal?` to compare two full sub-expressions for structural equality, not just `eq?` on symbols).
