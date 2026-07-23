# Module 1 — Foundations: Modules & `#lang`

By the end of this module you'll be able to split code across files with `require`/`provide`, and declare structured data with `struct`, including the mutable/immutable and `#:transparent` distinctions. Feeds Capstone 1.

## `#lang` and `require`/`provide`

**You'll be able to:** split a program across two files, exporting only specific names, and confirm the rest are genuinely inaccessible.

**Concept**

Every Racket file starts with a `#lang` line declaring which language it's written in — `#lang racket/base` (a smaller, faster-loading core) or `#lang racket` (the full standard library) are the two you'll see throughout this guide, `racket/base` by default. `require` pulls in another module's exports; `provide` declares which of a module's own definitions are visible to anything that `require`s it. Anything not explicitly `provide`d is genuinely private — Racket's actual enforcement, not a naming convention.

**Example**

`mathutils.rkt`:
```racket
#lang racket/base
(provide square cube)
(define (square x) (* x x))
(define (cube x) (* x x x))
(define (internal-helper x) (+ x 1)) ; not provided
```

`main.rkt`:
```racket
#lang racket/base
(require "mathutils.rkt")
(displayln (square 5))
(displayln (cube 3))
```

```
$ racket main.rkt
25
27
```

**Verified directly as genuine enforcement, not convention** — a separate file requiring `mathutils.rkt` and trying to call the unprovided `internal-helper`:

```
$ racket bad.rkt
bad.rkt:3:12: internal-helper: unbound identifier
  in: internal-helper
```

`internal-helper` isn't hidden by naming convention (an underscore prefix, say) — it's genuinely not part of the module's exported namespace at all, so referencing it from outside fails exactly like referencing a name that was never defined anywhere.

> **Pitfall:** `#lang racket/base` and `#lang racket` aren't interchangeable without thought — `racket/base` deliberately excludes a large amount of the full `racket` language's standard library (contracts, classes, and more all need an explicit `(require racket/contract)`/`(require racket/class)` even under `#lang racket`, but plenty of other conveniences are only available under the full `#lang racket`). This guide is explicit about which `require`s each example needs, rather than assuming a particular `#lang` line quietly provides everything.

**Practice**

- Add a third function to `mathutils.rkt`, forget to `provide` it, and confirm `main.rkt` can't call it.
- Split a program you've already written into two files, with one file's functions `require`d by the other.

## `struct`: structured data, and what `#:transparent` actually changes

**You'll be able to:** declare a `struct`, choose mutable or immutable fields, and explain what `#:transparent` changes about how a struct instance prints and compares.

**Concept**

`(struct name (field ...))` declares a new structured type — a constructor (`name`), a predicate (`name?`), and accessors (`name-field`) for each field, all generated automatically. Fields are immutable by default; `#:mutable` adds a setter for every field. `#:transparent` changes how instances print and compare — without it, a struct's internals are opaque, deliberately.

**Example**

```racket
(struct point (x y) #:transparent)
(define p (point 3 4))
(displayln p)
(displayln (point-x p))
(displayln (point? p))
(displayln (point? 5))

(struct mpoint (x y) #:mutable #:transparent)
(define mp (mpoint 1 2))
(set-mpoint-x! mp 99)
(displayln mp)

(struct opaque-point (x y))
(define op (opaque-point 1 2))
(displayln op)
```

```
#(struct:point 3 4)
3
#t
#f
#(struct:mpoint 99 2)
#<opaque-point>
```

Verified directly: `#:transparent` makes `point`'s fields visible when printed (`#(struct:point 3 4)`) — genuinely useful for debugging. `#:mutable` generates `set-mpoint-x!`, and mutating confirmed the change (`99` replacing `1`). The plain `opaque-point`, with neither flag, prints as `#<opaque-point>` — its field values are **not visible** at all from the printed representation, a deliberate, enforced information-hiding default, not a display quirk.

> **Pitfall:** opaque-by-default is a real design choice, not an oversight — a library author who wants callers to depend only on a struct's accessor functions, not on the ability to inspect or compare instances field-by-field, gets that for free by simply *not* adding `#:transparent`. Adding it later, once callers already depend on structural printing/equality, is a real interface change, not a cosmetic one.

**Practice**

- Declare a `#:mutable` struct without `#:transparent`, mutate a field, and confirm you can still observe the change through an accessor even though `displayln` won't show it directly.
- Predict, then verify, what `(equal? (point 1 2) (point 1 2))` returns for a `#:transparent` struct, versus the same test for a non-transparent one.

## Progress check

1. What does `provide` actually enforce, versus a naming convention like an underscore prefix?
2. What's the practical difference between `#lang racket/base` and `#lang racket`?
3. What does `#:mutable` add to a `struct` declaration that isn't there by default?
4. What does `#:transparent` change about a struct instance, concretely?
5. Why might a library author deliberately choose *not* to add `#:transparent` to a struct they export?

### Answers

1. It genuinely restricts what's accessible from outside the module — an unprovided identifier is unbound to any requiring module, not merely hidden by convention; attempting to reference it fails exactly like referencing an undefined name.
2. `racket/base` is a smaller, faster-loading core language; `racket` includes a much larger standard library by default — several major features (contracts, classes) need an explicit `require` under either, but plenty of other conveniences differ between the two.
3. Setter functions (`set-<name>-<field>!`) for every field — without it, a struct's fields are immutable after construction.
4. It makes a struct's field values visible in its printed representation, and enables structural (field-by-field) equality comparisons — without it, both are opaque by default.
5. To keep callers depending only on the struct's accessor functions and provided operations, not on its internal field values or structural identity — adding `#:transparent` later, once callers already rely on that visibility, becomes a real interface change rather than a safe addition.
