# Companion — Clojure (not in the original Budokan module list)

**Founding paper: independently supplied.** Hickey, R. (2008). "The Clojure Programming Language." *Proceedings of the 2008 Dynamic Languages Symposium (DLS '08)*, ACM. Clojure doesn't appear in the Budokan workbook's own module list — like OCaml, Erlang-as-a-separate-entry, Docker, and Rails, it was added to `code-rookie` after the workbook's own original plan was set.

## Historical note

Hickey's own paper, and the language itself, is a real, deliberate synthesis rather than an extension of any single prior language: Lisp's own homoiconicity and macro system (companion: `scheme.md`'s McCarthy connection), hosted directly on the JVM (real, load-bearing Java interop, not a bolted-on extra), built around one central, opinionated bet — that most concurrency bugs come from *mutable shared state*, not from concurrency itself, and that a language whose default data structures are genuinely immutable eliminates that entire bug class by construction rather than by discipline. `clojure/00-overview.md` states the guide's own real payoff directly: persistent immutable collections with "real, measured structural-sharing performance" — not immutability purchased at the cost of copying an entire data structure on every change, verified in `clojure/01-foundations-persistent-collections.md` with real, measured numbers (1000 `assoc` operations on a 1,000,000-element vector: 0.72ms, versus ~4953ms for 1000 genuine full copies).

`clojure/06-value-vs-identity-atoms.md`'s own capstone makes the concurrency bet concrete and adversarial: ten real JVM threads incrementing a shared counter 10,000 times each, unprotected, lost 79,181 of the expected 100,000 updates — verified directly, not assumed — against an exact match once the identical operation went through `atom`/`swap!` instead. This is Clojure's own version of the same underlying question Erlang's actor model and Rust's ownership system each answer completely differently (companions: `erlang.md`, `rust.md`) — what should a language do about shared mutable state, and Clojure's answer is: make the *shared* part cheap and safe by making the *mutable* part explicit and narrow.

## Reflection prompts

- Clojure, Erlang, and Rust each answer the "shared mutable state" problem with a genuinely different mechanism — persistent immutable data plus explicit, narrow mutation points (`atom`); share-nothing message-passing; and compiler-enforced single ownership, respectively. Given a real system that needs ten workers updating one shared counter, which of the three would you reach for first, and why?
- `clojure/00-overview.md` frames the guide as "entirely comparative and additive" to Scheme and Racket, closing the Lisp-family arc. What did Clojure's own designers decide was worth keeping from that lineage (homoiconicity, macros), and what did they deliberately change (mutable-by-default state, in most Lisps, versus Clojure's own immutable-by-default)?

## Short-answer questions

1. **What real, measured performance numbers does `clojure/01-foundations-persistent-collections.md` provide for structural sharing versus genuine copying?** 1000 `assoc` operations on a 1,000,000-element persistent vector took 0.72ms, versus approximately 4953ms for 1000 genuine full copies of the same vector — a real, measured claim, not an assumed one.
2. **What real, adversarial experiment does `clojure/06-value-vs-identity-atoms.md`'s own capstone run, and what did it find?** Ten real JVM threads, each incrementing a shared counter 10,000 times with no protection, lost 79,181 of the expected 100,000 updates — verified directly against an exact, correct match once the same operation went through `atom`/`swap!` instead.
3. **What does Clojure's own founding bet claim about the actual source of most concurrency bugs, per this companion's own framing?** That most concurrency bugs come from mutable *shared* state specifically, not from concurrency itself — a language whose default data structures are genuinely immutable removes that bug class by construction, rather than requiring the programmer's own discipline to avoid it.

## Links into the guide

- [`clojure/01-foundations-persistent-collections.md`](../clojure/01-foundations-persistent-collections.md) — the real, measured structural-sharing performance numbers.
- [`clojure/06-value-vs-identity-atoms.md`](../clojure/06-value-vs-identity-atoms.md)/[`clojure/07-capstone-concurrency-safe-counting.md`](../clojure/07-capstone-concurrency-safe-counting.md) — the adversarial, verified concurrency-safety capstone.

## Cross-thread connection

No direct Budokan-workbook pairing exists for Clojure specifically, since it isn't in the workbook's own original module list. The genuinely relevant connection is internal to `code-rookie`: Clojure's own `defprotocol`/`extend-type` and `defmulti`/`defmethod` (two deliberately separate polymorphism mechanisms) are this series' own eighth entry in the polymorphism thread — worth reading directly against Julia's own multiple dispatch (companion: `julia.md`), since both languages treat dispatch on more than one argument's type as a real, load-bearing capability, arrived at through genuinely different design philosophies.
