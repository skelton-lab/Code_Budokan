# Capstone 2 — An Object Hierarchy

Combines every concept from Module 4: an interface, a base class, two derived classes each overriding a method and calling `super` to build on the parent's behavior, and a polymorphic computation running correctly over a mixed list of objects.

## The hierarchy

```racket
#lang racket/base
(require racket/class)

(define employee<%> (interface () compensation describe))

(define employee%
  (class* object% (employee<%>)
    (init name base-salary)
    (define nm name)
    (define base base-salary)
    (super-new)
    (define/public (compensation) base)
    (define/public (describe)
      (string-append nm ": $" (number->string (compensation))))))

(define manager%
  (class* employee% (employee<%>)
    (init name base-salary team-size)
    (define ts team-size)
    (super-new [name name] [base-salary base-salary])
    (define/override (compensation) (+ (super compensation) (* ts 1000)))))

(define engineer%
  (class* employee% (employee<%>)
    (init name base-salary stock-units)
    (define su stock-units)
    (super-new [name name] [base-salary base-salary])
    (define/override (compensation) (+ (super compensation) (* su 50)))))
```

Note `describe` is defined **once**, on `employee%`, and never overridden — it calls `(compensation)`, which resolves polymorphically to whichever class's version is actually appropriate for the receiving object, exactly the way Module 4's `loud-dog%` called `super` to build on (not replace) inherited behavior. `manager%` and `engineer%` each add their own compensation component on top of `employee%`'s base, via `(super compensation)`, rather than reimplementing base-salary logic from scratch.

## Verification

```racket
(define staff
  (list (new employee% [name "Ada"] [base-salary 80000])
        (new manager% [name "Grace"] [base-salary 95000] [team-size 6])
        (new engineer% [name "Alan"] [base-salary 90000] [stock-units 200])))

(for-each (lambda (e) (displayln (send e describe))) staff)

(define total
  (foldl (lambda (e acc) (+ acc (send e compensation))) 0 staff))
(displayln (string-append "Total payroll: $" (number->string total)))
```

```
Ada: $80000
Grace: $101000
Alan: $100000
Total payroll: $281000
```

Checked by hand: Ada (plain `employee%`) shows exactly her base salary. Grace (`manager%`, team of 6) shows `95000 + 6·1000 = 101000`. Alan (`engineer%`, 200 stock units) shows `90000 + 200·50 = 100000`. The total, `80000 + 101000 + 100000 = 281000`, matches `foldl`'s own computed result exactly — and critically, `foldl`'s `(send e compensation)` call works identically across all three object types in one mixed list, dispatching to whichever `compensation` implementation is correct for each object without a single `cond`/`case` checking "what type of employee is this" anywhere in the calling code.

> **Pitfall:** it's tempting to have `manager%` and `engineer%` reimplement `compensation` from scratch (`(+ base-salary (* ts 1000))`, duplicating `employee%`'s base logic) rather than calling `(super compensation)` — this would work today, but silently duplicates the base-pay calculation in three places; if `employee%`'s own base-pay logic ever changed (a cost-of-living adjustment applied uniformly, say), only the version that calls `super` would pick up the change automatically.

## Extending it yourself

- Add a `contractor%` class with its own distinct compensation formula (hourly rate × hours, no base salary at all — a case genuinely different enough that calling `super` might *not* make sense; decide for yourself whether it should still extend `employee%` or implement `employee<%>` directly).
- Add a `bonus-eligible<%>` interface with an `annual-bonus` method, implement it only on `manager%`, and write code that checks `is-a?` before calling it on a mixed list — confirming at runtime which staff members actually support it.
