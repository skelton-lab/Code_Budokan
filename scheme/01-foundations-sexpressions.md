# Module 1 — Foundations: S-expressions, Pairs & Lists

By the end of this module you'll be able to write and read S-expressions, build and take apart lists with `cons`/`car`/`cdr`, define procedures, and write basic recursive functions. Feeds Capstone 1 (Symbolic Differentiation).

## S-expressions: code and data, the same notation

**You'll be able to:** distinguish an S-expression being evaluated from one being treated as literal data, using `quote`.

**Concept**

Every previous language in this series kept "the program's syntax" and "the data the program manipulates" as separate things — a Python list literal isn't the same kind of object as a Python function call's syntax tree. Scheme's fundamental idea is that they're the *same* representation: a parenthesized list like `(+ 1 2)` is both a valid piece of data (a three-element list) and, when evaluated, a procedure call. `quote` (or the shorthand `'`) tells Scheme "don't evaluate this — treat it as literal data."

**Example**

```scheme
(display (quote (1 2 3))) (newline)
(display '(a b c)) (newline)
```

```
$ mit-scheme --quiet < m1.scm
(1 2 3)
(a b c)
```

Verified directly: `'(a b c)` printed as literal data — `a`, `b`, `c` were never looked up as variables or evaluated as procedure calls, exactly because `quote` suppressed evaluation. Without the quote, `(a b c)` would be evaluated as a procedure call, attempting to call whatever `a` refers to.

> **Pitfall:** `(+ 1 2)` and `'(+ 1 2)` look almost identical but mean completely different things — one evaluates to `3`, the other evaluates to the literal three-element list containing the symbol `+` and the numbers `1` and `2`. This distinction is the entire foundation Capstone 4's metacircular evaluator is built on.

**Practice**

- Evaluate `(display (+ 1 2))` and `(display '(+ 1 2))` side by side and confirm the difference in output.
- Predict what `(car '(+ 1 2))` returns before running it.

## Pairs and lists: `cons`, `car`, `cdr`

**You'll be able to:** build a list from individual values with `cons`, and take one apart with `car`/`cdr`.

**Concept**

A Scheme list is built from **pairs** — `cons` joins two values into a pair; a list is a chain of pairs ending in the empty list `'()`. `car` returns a pair's first element, `cdr` returns the rest of the chain. This is the single data structure list-processing builds everything from.

**Example**

```scheme
(display (cons 1 (cons 2 (cons 3 '())))) (newline)
(display (car '(1 2 3))) (newline)
(display (cdr '(1 2 3))) (newline)
(display (car (cdr '(1 2 3)))) (newline)
(display (pair? '(1 2))) (newline)
(display (pair? 5)) (newline)
(display (null? '())) (newline)
```

```
(1 2 3)
1
(2 3)
2
#t
#f
#t
```

Verified directly: `(cons 1 (cons 2 (cons 3 '())))` built the exact same list `(1 2 3)` as the literal `'(1 2 3)` would — a list literal is genuinely just nested `cons` calls in disguise. `car`/`cdr` composed (`(car (cdr '(1 2 3)))`) correctly retrieved the second element, `2`.

> **Pitfall:** `car`/`cdr` on the empty list `'()` is an error, not a graceful "no value" — every recursive list-processing function needs to check `null?` before calling `car`/`cdr`, exactly the way Module 5's file-reading loop needed `AT END` in the COBOL guide, or Prolog's own base-case-before-recursive-case discipline.

**Practice**

- Build the list `(10 20 30)` using nested `cons` calls, and confirm it prints identically to the literal `'(10 20 30)`.
- Write an expression using only `car`/`cdr` that extracts `3` from `'(1 (2 3) 4)`.

## `define` and basic recursion

**You'll be able to:** define named procedures, and write a recursive function with a correct base case.

**Concept**

`(define (name args...) body)` defines a procedure. Recursion, not looping constructs, is Scheme's default way to process a list or count down — every recursive function needs a base case (usually `null?` for lists, or a numeric bound) and a recursive case that makes genuine progress toward it.

**Example**

```scheme
(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))
(display (factorial 5)) (newline)

(define (my-length lst)
  (cond ((null? lst) 0)
        (else (+ 1 (my-length (cdr lst))))))
(display (my-length '(a b c d))) (newline)
```

```
120
4
```

Verified directly: `factorial 5` = `120`; `my-length` correctly walked all four elements of `'(a b c d)` and returned `4`, with `(null? lst)` catching the base case at the empty tail.

> **Pitfall:** `cond`'s `else` clause is not automatic — a `cond` with no matching clause and no `else` returns an unspecified value silently, not an error, in most Scheme implementations. Always give a recursive list-processing `cond` an explicit `else` (or an explicit `(null? lst)` check as the very first clause), the same discipline this series applied to COBOL's `WHEN OTHER`.

**Practice**

- Write a recursive `my-sum` that adds up all numbers in a list.
- Write a recursive `my-reverse` that reverses a list using only `cons`/`car`/`cdr`/`null?`.

## Progress check

1. What does `quote` (or `'`) actually change about how an expression is treated?
2. What are `car` and `cdr` each responsible for on a pair?
3. What happens if `car` or `cdr` is called on `'()`?
4. Why is `else` important in a `cond` used for recursive list processing?
5. What are the two things every correctly-written recursive function needs?

### Answers

1. It suppresses evaluation — the expression is treated as literal data (a list/symbol/number) rather than being evaluated as a procedure call or variable reference.
2. `car` returns a pair's first element; `cdr` returns everything after it (the rest of the chain, for a proper list).
3. It's an error — there's no graceful "empty" result; a caller must check `null?` before calling `car`/`cdr`.
4. Without it, a `cond` with no matching clause silently returns an unspecified value rather than signaling that no case was handled — this is easy to miss in a recursive function that should always hit either the base case or the recursive case.
5. A base case that terminates the recursion, and a recursive case that makes genuine progress toward that base case on every call.
