# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones. Each entry states what it is, why it matters, and where to go deeper.

### Typed Racket

**What it is:** `#lang typed/racket/base` (or `typed/racket`) adds a real static type system on top of Racket — `(: add-one (-> Integer Integer))` style type annotations, checked at compile time.

**Why it matters, verified precisely rather than assumed:** tested directly against this guide's own anchored toolchain — `minimal-racket`'s CLI-only distribution does **not** include it by default. `#lang typed/racket/base` fails with `standard-module-name-resolver: collection not found`, confirming Typed Racket is a separate package (`raco pkg install typed-racket`), not bundled with the minimal install this guide anchors to. Worth knowing this precisely rather than assuming it "just works" the way `racket/contract` and `racket/class` did.

**Where to go next:** `raco pkg install typed-racket`, then the Typed Racket guide in the official Racket documentation.

### `racket/gui` and DrRacket

**What it is:** Racket's own GUI toolkit, and DrRacket, the flagship IDE built on it — genuinely central to how most Racket users, especially beginners, actually work with the language day to day.

**Why it matters:** this series stays CLI-first and verified by actually running code from a script, which is why this guide anchored to `minimal-racket` rather than the full `racket` cask from the start — not a judgment on DrRacket's real value, just a scope boundary consistent with every other guide in this series.

**Where to go next:** `brew install --cask racket` for the full distribution including DrRacket.

### `raco`: packaging and distribution

**What it is:** Racket's command-line tool for package management (`raco pkg install`), compiling to bytecode (`raco make`), and building standalone executables (`raco exe`).

**Why it matters:** every example in this guide ran as `racket file.rkt` directly from source — genuinely fine for a study guide, but a real Racket project or distributed tool would use `raco` for dependency management and packaging, the same role `uv`/`pip` played in `python/` or `cobc`'s build flags played in `cobol/`.

**Where to go next:** the `raco` chapter of the official Racket reference.

### A truly custom reader (non-S-expression surface syntax)

**What it is:** Capstone 4's `stacklang` reinterpreted ordinary S-expression syntax with restricted vocabulary — real language-oriented programming, but still parenthesized prefix notation underneath. A language with genuinely different surface syntax (infix math, significant whitespace, anything that doesn't parse as S-expressions at all) needs a custom **reader** — a module providing its own `read`/`read-syntax` functions that Racket's `#lang` mechanism calls before the ordinary S-expression reader ever gets involved.

**Why it matters:** this is the next real step beyond what Capstone 4 demonstrated, and it's how genuinely unusual `#lang`s in the wild (ones that don't look like Lisp at all) are actually built — a materially larger undertaking than this guide's own scope.

**Where to go next:** the `syntax/module-reader` library and the "Language Extension" chapter of *Beyond the Scheme Report* / the official Racket guide's own reader-extension material.

### Concurrency: green threads and places

**What it is:** Racket has its own lightweight concurrency (`thread`, cheap and managed by the Racket runtime itself, not OS threads) and `places` (genuine parallelism across CPU cores, with explicit message-passing between them, deliberately *not* sharing mutable state).

**Why it matters:** genuinely relevant to real Racket programs, but no capstone here needed concurrent execution to be correct or complete.

**Where to go next:** the official Racket guide's concurrency chapter, particularly the `places` vs. `thread` distinction (parallelism vs. concurrency, a real and often-confused difference).

## The wider ecosystem

- **The official Racket Guide and Reference** — `docs.racket-lang.org`, the anchored toolchain's own authoritative documentation.
- **This series' [Scheme guide](../scheme/00-overview.md)** — every foundational concept this guide assumed without re-teaching.
- **_Realm of Racket_** (Felleisen et al.) — a project-based introduction covering `racket/gui` and game-building, the practical complement to this guide's language-internals focus.
- **This series' upcoming Clojure guide** — a modern Lisp taking a genuinely different approach to the same underlying "extend the language itself" instinct, via protocols rather than Racket's `#lang` mechanism.
