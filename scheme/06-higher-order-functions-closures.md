# Module 6 — Higher-Order Functions & Closures

By the end of this module you'll be able to write and return procedures from other procedures, use closures to carry private state, and process lists with `map`/`filter`/`fold-left`. Feeds Capstone 2, where continuations build on the same "procedures as first-class values" foundation.

## Closures: procedures that remember their environment

**You'll be able to:** write a procedure that returns another procedure, and explain what a closure actually captures.

**Concept**

`lambda` creates a procedure value — Scheme's procedures are first-class, meaning they can be passed around, returned, and stored exactly like any other value. A **closure** is what you get when a `lambda` refers to a variable from its surrounding scope: the returned procedure keeps access to that variable's binding, not just a snapshot of its value at creation time.

**Example**

```scheme
(define (make-adder n)
  (lambda (x) (+ x n)))
(define add5 (make-adder 5))
(display (add5 10)) (newline)

(define (make-counter)
  (let ((count 0))
    (lambda ()
      (set! count (+ count 1))
      count)))
(define counter (make-counter))
(display (counter)) (newline)
(display (counter)) (newline)
(display (counter)) (newline)
```

```
15
1
2
3
```

Verified directly: `add5` correctly remembers `n = 5` from `make-adder`'s scope, computing `10 + 5 = 15`. `make-counter` is the sharper demonstration — each call to `counter` mutates `count` with `set!`, and that mutation *persists* across calls (`1`, then `2`, then `3`), because the closure holds onto the actual binding, not a copy. Two separate calls to `(make-counter)` would create two independent counters, each with its own private `count` — closures are how Scheme gives a procedure genuinely private, persistent state with no class or object system involved at all.

> **Pitfall:** `set!` inside a closure mutates a binding shared by every reference to that closure — if `counter` were passed to three different parts of a program, all three would be incrementing the *same* underlying `count`, not independent copies. This is exactly the mutable-shared-state hazard this series has flagged in other languages, just expressed through closures instead of objects.

**Practice**

- Write `make-multiplier` analogous to `make-adder`, and confirm `(make-multiplier 3)` applied to `4` gives `12`.
- Create two separate counters with `make-counter` and confirm incrementing one doesn't affect the other's count.

## `map`, `filter`, and `fold-left`

**You'll be able to:** transform, select from, and combine a list using higher-order functions instead of hand-written recursion.

**Concept**

`map` applies a procedure to every element of a list, producing a new list of the results. `filter` keeps only the elements satisfying a predicate. `fold-left` combines every element into a single accumulated result, given a combining procedure and a starting value — the general-purpose tool underneath what a hand-written recursive `my-sum` or `my-length` (Module 1) was really doing.

**Example**

```scheme
(display (map (lambda (x) (* x x)) '(1 2 3 4))) (newline)
(display (filter even? '(1 2 3 4 5 6))) (newline)
(display (fold-left + 0 '(1 2 3 4 5))) (newline)
```

```
(1 4 9 16)
(2 4 6)
15
```

Verified directly: `map` squared every element; `filter` kept only the even ones; `fold-left` summed the list to `15`, exactly what a hand-written recursive summer would compute — but `fold-left` generalizes to *any* combining procedure, not just addition, which is the actual point of learning it rather than writing recursion by hand every time.

> **Pitfall:** MIT Scheme provides both `fold-left`/`fold-right` and `reduce`, with genuinely different argument orders and associativity — `fold-right cons '() '(1 2 3)` rebuilds the original list structure exactly (`(1 2 3)`) precisely because `cons`, applied right-to-left with `'()` as the seed, reconstructs list-building itself; `fold-left` with the same arguments would not produce the same result, because it associates in the opposite direction. Don't assume the two are interchangeable without checking which one an expression actually needs.

**Practice**

- Use `map` to convert a list of Fahrenheit temperatures to Celsius.
- Use `filter` and `fold-left` together to sum only the positive numbers in a list.
- Predict, then verify, what `(fold-left cons '() '(1 2 3))` produces, and explain why it differs from `(fold-right cons '() '(1 2 3))`.

## Progress check

1. What does a closure actually capture — a copy of a variable's value, or the binding itself?
2. What did the `make-counter` example demonstrate that `make-adder` alone did not?
3. What would happen if the same closure returned by `make-counter` were called from three different places in a program?
4. What's the difference between what `map` and `filter` each do to a list?
5. Why does `fold-right cons '() '(1 2 3)` reconstruct the original list, while `fold-left` with the same arguments would not?

### Answers

1. The binding itself — mutating the captured variable (via `set!`) is visible on every subsequent call to the closure, not just a value frozen at the moment the closure was created.
2. That closures can hold genuinely *mutable*, persistent state across multiple calls — `make-adder`'s captured `n` was never changed after creation, so it didn't demonstrate that a closure's captured state can evolve over time the way `make-counter`'s `count` does.
3. All three calls would share and mutate the exact same underlying `count` binding — incrementing from one call site would be visible to the others, since they're all the same closure, not independent copies.
4. `map` transforms every element into a new value (producing a list the same length as the input); `filter` selects a subset of the original elements unchanged (producing a list the same length or shorter, with no transformation applied).
5. `fold-right` combines right-to-left with `'()` as the innermost seed, which is exactly how `cons`-based list construction already works — it reconstructs the original structure; `fold-left` combines left-to-right, building up the result in the opposite associative order, which does not reproduce the same list shape for `cons`.
