# Module 7 — Continuations

By the end of this module you'll be able to use `call/cc` to build early-exit control flow — escaping out of a recursive search or computation from arbitrarily deep inside it, with no exception system or special language support required. Feeds Capstone 2 directly.

## `call/cc`: capturing "the rest of the computation"

**You'll be able to:** explain what `call-with-current-continuation` (`call/cc`) captures, and use it to escape early from a computation.

**Concept**

At any point in a running program, there's an implicit answer to "what happens with this expression's result once it's computed?" — that answer is the **continuation**. `call/cc` hands you that continuation as an ordinary, callable procedure: calling it with a value makes the *original* `call/cc` expression evaluate to that value immediately, abandoning whatever computation was still in progress inside it.

**Example**

```scheme
(display (+ 1 (call/cc (lambda (k) (k 10) 999)))) (newline)
```

```
11
```

Verified directly: the result is `11`, not `1000`. `(k 10)` doesn't just return `10` from the `lambda` — it makes the entire `(call/cc ...)` expression evaluate to `10`, abandoning the `999` that would otherwise have been the `lambda`'s last expression. `(+ 1 10) = 11` is what actually happens; `999` never gets used for anything at all.

> **Pitfall:** it's tempting to think of `k` as "a way to return early from the `lambda`," but that undersells it — `k` represents everything waiting to happen with `call/cc`'s result, all the way out to wherever `call/cc` itself was called from, which is exactly why calling `k` from arbitrarily deep inside a nested computation (not just directly inside the `lambda`) still works correctly, as the next example shows.

**Practice**

- Change `(k 10)` to `(k 20)` and predict the new result before running it.
- Remove the call to `k` entirely (just evaluate to `999`) and confirm the expression falls through to `999` normally, exactly as an ordinary `lambda` body would.

## Early exit from deep inside a recursive search

**You'll be able to:** use a captured continuation to escape a recursive function from arbitrarily deep inside its call stack, without an exception mechanism.

**Concept**

Because the captured continuation represents "everything waiting to happen after `call/cc`," calling it works correctly no matter how many levels of recursion currently sit between the call site and the original `call/cc` — every one of those pending stack frames simply gets discarded. This is a direct, practical answer to a real limitation: Scheme has no built-in early-`return` statement the way most of this series' other languages do, since every procedure's value is just its last expression.

**Example**

```scheme
(define (find-first pred lst)
  (call/cc
    (lambda (return)
      (for-each (lambda (x) (if (pred x) (return x))) lst)
      #f)))
(display (find-first even? '(1 3 5 4 7 8))) (newline)
(display (find-first even? '(1 3 5 7))) (newline)

(define (product-early-exit lst)
  (call/cc
    (lambda (return)
      (define (iter l)
        (cond ((null? l) 1)
              ((= (car l) 0) (return 0))
              (else (* (car l) (iter (cdr l))))))
      (iter lst))))
(display (product-early-exit '(1 2 0 4 5))) (newline)
(display (product-early-exit '(1 2 3 4 5))) (newline)
```

```
4
#f
0
120
```

Verified directly: `find-first` correctly stops at `4` — the first even number — without scanning the remaining `7 8`, and correctly falls through to the `#f` default when nothing matches. `product-early-exit` demonstrates escaping from *inside a recursive call*, not just inside a `for-each` — the moment `iter` hits the `0` in `(1 2 0 4 5)`, `(return 0)` unwinds directly back to `call/cc`'s caller, abandoning every pending multiplication (`1 * 2 * (still waiting on the rest)`) that would otherwise still be sitting on the call stack. `product-early-exit` on a zero-free list falls through normally, computing `120` the ordinary recursive way.

> **Pitfall:** naming the captured continuation `return` (as above) is a deliberate readability choice, not special syntax — `call/cc` doesn't know anything about "returning"; it's an ordinary lambda parameter that happens to hold an escape continuation, and calling it by any name has the identical effect. This module only uses continuations for *escaping* — a continuation can also be saved and called again later, resuming a computation that already appeared to finish, which is a genuinely deeper and stranger capability this guide's Beyond This Guide module signposts rather than demonstrates.

**Practice**

- Write `find-first-negative` using the same `call/cc` pattern, over a nested list of numbers (hint: you'll need to recurse into sub-lists, calling `return` from inside that recursion, exactly like `product-early-exit` did).
- Predict what `product-early-exit` returns for `'()` (the empty list), and verify.

## Progress check

1. What does `call/cc` hand to the procedure passed to it?
2. In `(+ 1 (call/cc (lambda (k) (k 10) 999)))`, why is the result `11` and not `1000`?
3. Why does calling the captured continuation work correctly even from several levels deep inside a recursive call, not just directly inside the `call/cc`'s own `lambda`?
4. What does `product-early-exit` avoid computing when it hits a `0`, compared to a version without `call/cc`?
5. Is `return` in this module's examples special syntax, or an ordinary variable name?

### Answers

1. The current continuation — a callable procedure representing everything that would otherwise happen with the result of the `call/cc` expression, all the way out to its own caller.
2. Because calling `(k 10)` makes the entire `call/cc` expression evaluate to `10` immediately, discarding `999` entirely — `k` doesn't return a value from the `lambda`, it supplies the value for the whole `call/cc` expression and abandons anything still pending inside it.
3. Because the captured continuation represents the computation *outside and beyond* the current call, regardless of how many stack frames currently sit between the call site and `call/cc` — calling it discards every one of those pending frames uniformly.
4. It avoids ever multiplying the remaining elements after the `0` — every pending multiplication still "waiting" on the call stack for the recursive `iter` calls to return gets discarded the instant `return` is called, rather than completing and multiplying by the useless remaining values.
5. An ordinary variable name — it's just the parameter name given to `call/cc`'s `lambda`; nothing in Scheme's syntax treats `return` specially.
