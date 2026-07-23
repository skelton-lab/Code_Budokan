# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [The Racket Guide](https://docs.racket-lang.org/guide/) | The anchored toolchain's own authoritative, example-driven documentation |
| [The Racket Reference](https://docs.racket-lang.org/reference/) | Precise semantics for every form this guide used |
| *Realm of Racket* (Felleisen et al.) | Project-based, covers `racket/gui` — the practical complement to this guide's language-internals focus |
| This series' [Scheme guide](../scheme/00-overview.md) | Every foundational concept this guide assumed without re-teaching |
| This series' [Prolog guide](../prolog/00-overview.md) | The polymorphism/interface comparison Module 4/Capstone 2 draw on |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `require`/`provide` — genuine enforcement, not naming convention | Module 1 |
| `struct` — `#:mutable`, `#:transparent` (opaque by default) | Module 1 |
| `(provide (contract-out [name contract]))` — runtime-enforced interface | Module 2 |
| Blame: argument violation → caller's file; return violation → library's own file | Module 2 |
| `interface`/`class*`/`is-a?` — a contract on an object's shape | Module 4 |
| `define/override` + `(super method args...)` — extend, don't discard | Module 4 |
| `syntax-parse` + syntax classes (`expr`, `id`) — real compile-time errors | Module 6 |
| `~optional`/`(~seq #:kw v)`/`#:defaults` — optional keyword macro arguments | Module 6 |
| `#%app`/`#%datum`/`#%module-begin` — the core forms every `#lang` must supply | Module 8 |
| `#lang s-exp "path"` — S-expression syntax, custom semantics | Module 8 |
| A custom language starts from nothing — every core form must be deliberately provided | Capstone 4 |

## A note on this guide's verification tier

Every code example in this guide was run against Racket CS v9.2 — no example was written from memory of the language's documentation and left unverified. Two real, honest findings came directly out of that process, both kept in as teaching material rather than smoothed over: `stacklang`'s first draft genuinely failed (`no #%app syntax transformer is bound`) before the fix that made it work, and Typed Racket was confirmed *not* to work out of the box against this guide's own `minimal-racket` toolchain — a fact checked directly rather than assumed either way.

## Where to go now

This guide is the second stop on this series' Lisp-family arc — **Scheme → Racket → Clojure**. From here: **Clojure**, this series' next planned guide, a modern Lisp taking a genuinely different path to the same "extend the language itself" instinct this guide's Capstone 4 explored directly — protocols and persistent immutable data structures by default, hosted on the JVM, rather than Racket's own `#lang` mechanism. Racket's `struct`/interface pattern (Module 1, Module 4) and Clojure's own approach to the same underlying problems are worth comparing directly once that guide exists.
