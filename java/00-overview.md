# Java — A Session-Based Study Guide

**Promise:** read, write, and maintain Java as the JVM's own founding, still-dominant language — real static typing checked at compile time, checked exceptions as a genuinely distinct error-handling paradigm, interfaces with true dynamic dispatch, and the JVM's own "write once, run anywhere" bytecode model — verified against a current release (26.0.1), not asserted from Java's own long-standing reputation either way.

**Audience:** this series' existing reader, arriving right after `cpp/`. Gosling's own well-documented design goal for Java was keeping C++'s C-family syntax and OOP model while dropping manual memory management and multiple inheritance's genuine complexity — this guide verifies that complexity directly (Module 3's default-method diamond conflict) rather than just asserting Java "simplified" C++. It also closes a second, quieter thread: `clojure/` has been running on the JVM this entire series without Java itself ever being named until now.

**Toolchain (anchored):** **OpenJDK 26.0.1** (Homebrew, `brew install openjdk`) — keg-only, meaning it is *not* linked onto `PATH` automatically; this guide's own first pitfall names the fix directly (`export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"`). No build tool required — every capstone compiles and runs with bare `javac`/`java`/`jar`, Module 11 signposting Maven/Gradle for when that stops being enough.

## Capstone log

| # | Capstone | Proves |
|---|---|---|
| 1 | A Shape Inventory | Interfaces, default methods, and dynamic dispatch through a shared type — Java's own third, distinct mechanism alongside `cpp/`'s vtables and Smalltalk's message-passing |
| 2 | An Order Processor | Checked exceptions, multi-catch, and a genuine three-way comparison against Go's explicit error returns and Rust's `Result<T, E>` |
| 3 | A Generic Repository | One generic class reused, fully type-checked, across two unrelated domain types — with type erasure confirmed directly via `getClass()` |
| 4 | A Statistics Tool, packaged as a jar | Bounded generics, an interface, and a checked exception synthesized into one program, then packaged and run as a real, portable `.jar` — the practical form "write once, run anywhere" actually takes |

## Module list

1. **Foundations** — `javac`/`java`, primitives vs. references, `==` vs. `.equals()`.
2. **Collections** — `ArrayList<T>`, `HashMap<K,V>`, a first look at generic syntax.
3. **Interfaces & polymorphism** — `interface`, `default` methods, the diamond conflict, verified.
4. **Capstone 1** — the shape inventory.
5. **Checked vs. unchecked exceptions** — compiler-enforced handling, verified directly.
6. **Capstone 2** — the order processor, and the three-language comparison table.
7. **Generics & type erasure** — the marquee finding: one runtime class, regardless of type argument.
8. **Capstone 3** — the generic repository.
9. **The JVM: bytecode & portability** — `javap` disassembly, and a measured JIT benefit.
10. **Capstone 4** — the statistics tool, packaged as a jar.
11. **Beyond this guide** — Streams/lambdas, records, virtual threads, Spring, Android's history, Maven/Gradle.
12. **Final assessment.**

## Setup

```bash
brew install openjdk
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
java -version    # this guide is verified against 26.0.1
javac -version
```

No project scaffolding needed up front — every capstone compiles directly with `javac` and runs with `java`, the same way every example in this guide is actually built.
