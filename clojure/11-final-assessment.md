# Final Assessment

Across all nine modules and four capstones. Work through these before running anything — precision in your own reasoning is the actual test.

1. What does a missing-key lookup on a Clojure map return by default, and how does that differ from Scheme/Racket's `car`-on-empty-list behavior?
2. Why does `conj` add to the end of a vector but the front of a list?
3. What claim did this guide's own timing measurement prove about persistent vectors, and what number backed it?
4. In Capstone 1, why did `history`'s first entry (the empty initial balances) remain `{}` even after five more transactions were applied?
5. What's genuinely different about `extend-type` compared to declaring an interface at class-definition time in Racket?
6. Why couldn't `combine-discounts` (Capstone 2) be expressed as a `defprotocol` method?
7. What real, measured cost does multimethod dispatch trade against protocol dispatch?
8. What's the actual distinction Clojure draws between a "value" and an "identity"?
9. In Capstone 3, what specific three-step sequence caused the unprotected version to lose 79,181 updates?
10. Why does `swap!`'s function-based update form avoid the race condition that a `reset!`-based read-then-write sequence doesn't?
11. What does a map "become" when treated as a sequence via `first`/`rest`?
12. What did the `call-count`/`tested-count` experiments actually prove about laziness, that a simple assertion wouldn't have?
13. In Capstone 4, why did `(take 0 (traced-fib-primes))` test zero Fibonacci numbers for primality?
14. What real, honest numeric-precision finding did Capstone 2 share with `cobol/02-arithmetic-picture-clauses.md` and `scheme/02-exact-numbers.md`?
15. What's the practical difference between `atom`/`swap!` and `ref`/`dosync`/`alter`?

## Answers

1. It returns `nil`, a normal representable value, not an error — Scheme's/Racket's `car`/`cdr` on `'()` are hard errors requiring an explicit `null?` check first; Clojure's map lookup treats absence as a legitimate, non-exceptional outcome.
2. Because each collection exposes the insertion point that's cheap for its own internal representation — a vector's fast end is its tail; a linked list's fast end is its head.
3. That `assoc` on a large persistent vector is dramatically cheaper than a genuine full copy, not secretly performing one — backed by a measured ~6800× gap (0.72ms for 1000 `assoc` operations on a 1-million-element vector, versus ~4953ms for 1000 genuine full copies).
4. Because persistent collections never mutate — every `assoc` call in `build-history` produced a brand-new map, leaving every previously-`conj`'d snapshot in `history` completely untouched, with no explicit defensive copying required anywhere in the code.
5. `extend-type` attaches a protocol implementation to a type *after* that type already exists, from entirely separate code, with no access to or modification of the type's original definition — including types you don't own the source of (`java.lang.Long`); Racket's `class*` requires declaring interface implementation at the point a class is originally defined.
6. Because its dispatch decision genuinely depends on *both* arguments' kinds together, not on the type of one designated receiver — a protocol method is always attached to and dispatched through exactly one type, with no mechanism for combining information from a second argument into the dispatch decision.
7. Runtime speed — a protocol method call resolves through a fast, type-based mechanism; a multimethod's dispatch function runs as a genuine function call on every single invocation.
8. A value is immutable and never changes; an identity (like an `atom`) is a separate concept that, at any moment, points to one immutable value and can be updated to point to a different one — "change" means repointing the identity, never mutating a value.
9. Read the current value, compute one more, write it back — three separate, interruptible steps; two threads' sequences could interleave so that one thread's write silently overwrote the other's increment before it was ever recorded.
10. Because `swap!`'s update runs as one atomic operation (via compare-and-swap, automatically retried if another thread's update interleaved) rather than as separate read-then-write steps with a gap where a concurrent update can be silently lost.
11. A sequence of `[key value]` two-element vectors, one per map entry — a genuine, consistent sequence representation, not a special case.
12. That laziness is a checkable, provable runtime property, not just a documented claim to trust — realizing exactly `n` elements caused exactly `n` real computations, confirmed by an actual counter, both for a simple traced sequence and for a genuinely useful composed Fibonacci-primes pipeline.
13. Because nothing was ever asked for — `take 0` requests zero elements, and since both `fib-seq` and `filter` are lazy, and laziness composes across multiple layers, no upstream computation was ever forced at all, not even computed-and-discarded.
14. That `0.10` combined arithmetically (`1 - (0.9 × 0.9)`) produced `0.18999999999999995` rather than a clean `0.19` — the identical IEEE 754 binary-floating-point imprecision this series verified directly in COBOL and Scheme, confirming it's a property of the shared binary representation, not a language-specific quirk.
15. `atom`/`swap!` manages exactly one independent identity safely; `ref`/`dosync`/`alter` coordinates updates across *multiple* identities at once (Clojure's software transactional memory), guaranteeing all the coordinated changes happen together or not at all — needed for something like a transfer between two separate accounts, which a single `atom` alone can't express safely.
