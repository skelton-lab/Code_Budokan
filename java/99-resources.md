# Resources & Cheat Sheet

## References

| Resource | Why it matters |
|---|---|
| [The Java Tutorials (Oracle)](https://docs.oracle.com/javase/tutorial/) | The complete reference for this guide's entire anchored toolchain |
| [OpenJDK](https://openjdk.org/) | The actual open-source project this guide's toolchain (26.0.1, via Homebrew) is built from |
| [JEP 395 — Records](https://openjdk.org/jeps/395) | Module 11's records signpost, the original proposal |
| [JEP 444 — Virtual Threads](https://openjdk.org/jeps/444) | Module 11's concurrency signpost, the finalized proposal |
| This series' [C++ guide](../cpp/03-inheritance-polymorphism.md) | The vtable-based dispatch mechanism Module 3's interfaces are directly contrasted against |
| This series' [Go guide](../go/05-error-handling-explicit-returns.md) | One of the two real comparison points in Module 5/Capstone 2's error-handling table |
| This series' [Clojure guide](../clojure/00-overview.md) | Runs on the JVM this entire series — this guide's own overview names the connection this guide finally closes |

## One-page cheat sheet

| Idea | Where |
|---|---|
| `javac` (compile) then `java` (run) — two separate steps | Module 1 |
| Primitives copy by value; references copy the reference | Module 1 |
| `==` (identity) vs. `.equals()` (content) — string literal pooling as the real exception | Module 1 |
| `ArrayList<T>`, `HashMap<K,V>` — compile-time type enforcement, verified | Module 2 |
| `interface`, `implements`, dynamic dispatch through the interface type | Module 3 |
| `default` methods, and the real diamond-conflict compile error | Module 3 |
| Checked (`Exception`) vs. unchecked (`RuntimeException`) — enforced by `javac`, not convention | Module 5 |
| Multi-catch: `catch (TypeA \| TypeB e)` | Module 6 |
| Generics are compile-time only; erased entirely by runtime — verified with `getClass()` | Module 7 |
| `instanceof T` and `new T[size]` — real compile errors, both caused by erasure | Module 7 |
| `CAFEBABE`, `.class` bytecode, `javap -c` disassembly | Module 9 |
| `-Xint` vs. default — ~45% measured JIT benefit, verified directly | Module 9 |
| `jar cfe name.jar MainClass *.class`, `java -jar` | Capstone 4 |

## Verification technique used throughout this guide

```bash
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
javac Whatever.java && java Whatever
```

Every compile error in this guide is a real, reproduced `javac` failure — not a described one. The diamond-conflict error, the checked-exception enforcement, both type-erasure compile errors, and the bounded-generics rejection were all triggered directly against this guide's own anchored toolchain (OpenJDK 26.0.1) and their exact text captured, not paraphrased. The JIT-benefit measurement in Module 9 was run six times each way (default execution, then `-Xint`) to confirm the ~45% gap was a real, repeatable pattern rather than one noisy sample.

## Where to go now

Java closes the OOP-dispatch lineage this series has traced since ALGOL — ALGOL → Pascal/Modula-2 (Wirth's procedural line) and, separately, Simula → Smalltalk → **C++** → **Java**, Gosling's own well-documented reaction to C++: keep the C-family syntax and the OOP model, drop manual memory management and multiple inheritance's genuine complexity (verified directly, in smaller form, by the default-method diamond conflict this guide reproduced). It also closes a second, quieter thread: `clojure/` has been running on the JVM this whole series without Java itself ever being named until now. The habit this guide leaned on hardest was the same one every guide in this series has insisted on since Fortran's `v(::-1)` error prompted the whole project's verification methodology: "Java is fast now" and "generics are erased" both read as plausible claims worth stating confidently — this guide measured the first directly (a real, repeatable ~45% JIT gap) and demonstrated the second with actual runtime evidence (`getClass()` equality, two real compile errors), rather than asserting either from reputation. From here, per this series' stated sequencing (`INDEX.md`): **JavaScript**, continuing the pathway.
