# Module 10 — Beyond This Guide

Every topic here failed the capstone-impact test — real, worth knowing exists, but not required by any of this guide's four capstones. Each entry states what it is, why it matters, and where to go deeper.

### Refs and STM: coordinated updates across multiple identities

**What it is:** `atom` (Module 6/Capstone 3) manages exactly one identity safely. `ref`, combined with `dosync`, extends the same "value vs. identity" philosophy to **coordinated** updates across *multiple* identities at once — Clojure's software transactional memory (STM).

**Why it matters:** Capstone 3's bank-account-style example used a single `atom`; a *transfer between two accounts* — needing both to update together, correctly, under concurrency, or neither at all — is exactly what `ref`/`dosync` is for.

**Minimal taste, verified directly:**
```clojure
(def account-a (ref 100))
(def account-b (ref 50))
(defn transfer! [from to amount]
  (dosync
    (alter from - amount)
    (alter to + amount)))
(transfer! account-a account-b 30)
(println @account-a @account-b)
```
```
70 80
```

**Where to go next:** the official Clojure reference's "Refs and Transactions" page.

### Agents: asynchronous, independent state updates

**What it is:** a third identity type, `agent`, for state updates that happen asynchronously (fire-and-forget, processed on a thread pool) rather than `atom`'s synchronous, immediate `swap!`.

**Why it matters:** genuinely useful for state that doesn't need every update's result immediately, but no capstone here needed asynchronous semantics specifically.

**Where to go next:** the official Clojure reference's "Agents" page.

### `core.async`: CSP-style channels

**What it is:** a library (not core Clojure itself) bringing Communicating Sequential Processes-style channels and `go` blocks — a genuinely different concurrency model from `atom`/`ref`/`agent`, closer in spirit to Go's goroutines/channels than to shared-state concurrency.

**Why it matters:** widely used in real Clojure systems for coordinating between independent processes, but a substantial topic of its own.

**Where to go next:** the `core.async` GitHub repository and its own walkthrough documentation.

### `clojure.spec`: data validation and contracts

**What it is:** a library for describing the shape of data and function arguments/return values declaratively, then validating or generating test data against those descriptions.

**Why it matters, and the direct cross-guide connection:** this is Clojure's closest analogue to `racket/contract` (`racket/02-contracts.md`) — runtime-checked interfaces rather than compile-time types. Verified directly:
```clojure
(require '[clojure.spec.alpha :as s])
(s/def ::age (s/and int? #(>= % 0)))
(println (s/valid? ::age 25))
(println (s/valid? ::age -5))
```
```
true
false
```
Unlike Racket's contracts, `spec` doesn't automatically wrap function calls with blame-tracked checks at a module boundary by default — it's a more general-purpose validation and generative-testing library, used differently in practice, worth knowing as a genuinely different design point on the same "validate real data, not just types" spectrum.

**Where to go next:** the official `clojure.spec` guide.

### Transducers

**What it is:** composable, allocation-free transformations (`map`, `filter`, and friends, but decoupled from any particular input/output sequence) — a genuinely distinctive Clojure design for combining sequence operations without building intermediate lazy sequences at every step.

**Why it matters:** a real performance and composability tool for larger data-processing pipelines, but neither necessary nor natural for this guide's own capstones.

**Where to go next:** the official Clojure reference's "Transducers" page.

### Deeper Java interop

**What it is:** Capstone 3 already used `Thread`, `System/nanoTime`, and raw Java arrays directly — genuinely representative interop, but the surface goes much deeper: `proxy` (implementing a Java interface inline), `gen-class` (generating a genuine Java class from Clojure, for AOT-compiled interop scenarios Java code needs to call back into).

**Why it matters:** real Clojure programs on the JVM lean on this constantly; this guide's capstones only needed the basics.

**Where to go next:** the official Clojure reference's "Java Interop" page.

### ClojureScript

**What it is:** Clojure compiled to JavaScript, running in a browser or Node.js — the same language, persistent data structures, and (mostly) the same standard library, targeting a genuinely different runtime than this guide's JVM-hosted examples.

**Why it matters:** a real, widely-used sibling, but this guide's toolchain and every verified example are JVM-specific.

**Where to go next:** the official ClojureScript site and its own quick-start guide.

## The wider ecosystem

- **The official Clojure Reference** (`clojure.org/reference`) — the anchored toolchain's own authoritative documentation.
- **_Clojure for the Brave and True_** (Daniel Higginbotham) — a widely-recommended, approachable full introduction covering everything this guide didn't have room for.
- **This series' [Scheme guide](../scheme/00-overview.md)** and **[Racket guide](../racket/00-overview.md)** — the Lisp-family foundation this guide built on throughout.
- **This series' [COBOL guide](../cobol/02-arithmetic-picture-clauses.md)** — the fixed-decimal-vs-float thread Capstone 2's `0.18999999999999995` result connects back to directly.
