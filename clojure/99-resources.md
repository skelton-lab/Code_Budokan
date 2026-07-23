# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [Clojure Reference](https://clojure.org/reference) | The anchored toolchain's own authoritative documentation |
| [Clojure CLI Guide](https://clojure.org/guides/deps_and_cli) | `deps.edn`, dependency management — beyond this guide's single-file scripts |
| *Clojure for the Brave and True* (Daniel Higginbotham) | Widely-recommended, approachable full introduction |
| This series' [Scheme guide](../scheme/00-overview.md) | Every Lisp-family foundational concept this guide assumed |
| This series' [Racket guide](../racket/00-overview.md) | The `racket/class`/`racket/contract` comparisons Modules 3 and 10 draw on directly |
| This series' [COBOL guide](../cobol/02-arithmetic-picture-clauses.md) | The fixed-decimal-vs-float thread Capstone 2 connects to directly |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `[1 2 3]`/`{:a 1}`/`#{1 2 3}`/`'(1 2 3)` — four core collection literals | Module 1 |
| `(:key m)`/`(m :key)`/`(get m :key)` — three equivalent lookup idioms | Module 1 |
| Missing map key → `nil`, not an error | Module 1 |
| `conj` — end for vectors, front for lists | Module 1 |
| Structural sharing, measured: ~6800× cheaper than a full copy | Module 1 |
| `defrecord`/`defprotocol` — single-dispatch, no inheritance between records | Module 3 |
| `extend-type` — retroactively extend *any* existing type, including Java's own | Module 3 |
| `defmulti`/`defmethod` — dispatch on anything, including multiple arguments together | Module 4 |
| `atom`/`swap!`/`deref`(`@`) — value vs. identity, made concrete | Module 6 |
| `swap!`'s function-based update avoids lost updates under real concurrency, measured | Capstone 3 |
| `first`/`rest`/`map`/`filter` — one sequence abstraction, every collection type | Module 8 |
| `lazy-seq`/`iterate`/`take` — laziness proven with a real call-counter, twice | Module 8, Capstone 4 |
| `ref`/`dosync`/`alter` — coordinated updates across multiple identities | Beyond This Guide |

## A note on this guide's verification tier

Every code example in this guide was run against Clojure CLI 1.12.5 on OpenJDK 26.0.1 — no example was written from memory of the language's documentation and left unverified. This guide went further than most in this series: every quantitative claim (structural-sharing efficiency, concurrent-update safety, laziness itself) was backed by an actual measurement taken on this machine, not a number quoted from Clojure's own documentation or asserted as generally true. The unsafe-concurrency capstone's 79,181 lost updates and the structural-sharing capstone's ~6800× gap are both specific, reproducible numbers from this exact run, not illustrative round figures.

## Where to go now

This guide completes this series' **Scheme → Racket → Clojure** arc — one Lisp-family lineage, followed all the way through, the same discipline `pascal/`/`modula2/` applied to Wirth's own procedural line earlier in this series. From here, `INDEX.md`'s own queued-candidates list has several genuinely independent next steps: **APL** (array-oriented programming's actual origin), **Julia** (modern scientific computing, multiple dispatch — worth comparing directly against this guide's own multimethods), **Erlang** (whose first implementation was literally written in Prolog), or the **Go**/**Rust** pairing (modern systems languages, one via Ken Thompson's direct C lineage, one as the compile-time-safety foil to `c/`/`cpp/`'s sanitizer story).
