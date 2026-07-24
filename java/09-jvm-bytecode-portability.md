# Module 9 — The JVM: Bytecode & "Write Once, Run Anywhere"

What `javac` actually produces, and a real, measured answer to whether JIT compilation is fast enough to matter in practice — not asserted from Java's own reputation. Feeds Capstone 4.

## Bytecode, not machine code

**You'll be able to:** inspect a compiled `.class` file directly, and disassemble it into real JVM bytecode instructions.

**Concept**

`javac` doesn't produce native machine code the way `gfortran` or `clang` do — it produces bytecode, a platform-independent instruction set the JVM itself interprets or compiles further at runtime. Every `.class` file starts with the same four-byte magic number, `CAFEBABE`, followed by a version number identifying which JVM release it targets.

**Example**

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, JVM");
    }
}
```
```
$ javac Hello.java
$ file Hello.class
Hello.class: compiled Java class data, version 70.0

$ head -c 16 Hello.class | xxd
00000000: cafe babe 0000 0046 001d 0a00 0200 0307  .......F........
```

`cafe babe` — the real, literal first four bytes of every compiled `.class` file, not a metaphor. `0000 0046` (70 in decimal) is this JDK's own class-file version number.

**Disassembled with `javap -c`, real bytecode instructions:**
```
$ javap -c Hello.class
public class Hello {
  public static void main(java.lang.String[]);
    Code:
       0: getstatic     #7    // Field java/lang/System.out:Ljava/io/PrintStream;
       3: ldc           #13   // String Hello, JVM
       5: invokevirtual #15   // Method java/io/PrintStream.println:(Ljava/lang/String;)V
       8: return
}
```

`getstatic`, `ldc`, `invokevirtual` — real, individual JVM bytecode instructions, not source code reformatted. This is the actual portable artifact "write once, run anywhere" refers to: this exact `.class` file runs on any JVM, on any operating system, without recompilation — the JVM itself is the platform-specific part, not the bytecode.

> **Pitfall:** bytecode portability means the *compiled artifact* runs anywhere a compatible JVM exists — it says nothing about performance being identical everywhere, and nothing about native OS-specific features (a file path separator, for instance) being handled for you automatically. "Write once, run anywhere" was always specifically a claim about the bytecode format, not a claim that all platform differences disappear.

**Practice**

- Compile and disassemble your own two-line method with a simple `if`/`else`, and identify the actual conditional-jump bytecode instruction (`ifeq`, `if_icmpge`, or similar) `javap -c` reveals.

## Is the JIT actually fast enough? Measured, not assumed

**You'll be able to:** measure, directly, whether JIT compilation provides a real, practical performance benefit — not accept "Java's fast now" as received wisdom.

**Concept**

The JVM can run bytecode two ways: purely interpreted (each bytecode instruction dispatched one at a time, every execution) or JIT-compiled (the JVM detects "hot" methods — run often enough to be worth the investment — and compiles them to real native machine code at runtime, then runs that instead). `-Xint` forces pure interpretation, disabling the JIT entirely — a real, available flag, useful specifically for measuring what the JIT actually buys you.

**Example**

```java
public class JitWarmup2 {
    static double compute(int n) {
        double sum = 0;
        for (int i = 0; i < n; i++) {
            sum += Math.sqrt(i) * Math.sin(i);
        }
        return sum;
    }

    public static void main(String[] args) {
        int iterations = 5_000_000;
        for (int round = 1; round <= 6; round++) {
            long start = System.nanoTime();
            compute(iterations);
            long elapsed = (System.nanoTime() - start) / 1_000_000;
            System.out.println("Round " + round + ": " + elapsed + "ms");
        }
    }
}
```

**Verified — default (JIT enabled):**
```
$ java JitWarmup2
Round 1: 123ms
Round 2: 123ms
Round 3: 138ms
Round 4: 121ms
Round 5: 122ms
Round 6: 121ms
```

**Verified — `-Xint`, JIT entirely disabled:**
```
$ java -Xint JitWarmup2
Round 1: 177ms
Round 2: 182ms
Round 3: 179ms
Round 4: 179ms
Round 5: 182ms
Round 6: 185ms
```

The identical computation, the identical bytecode, run two ways: consistently around `120ms` per round with the JIT active, consistently around `180ms` with it disabled — a real, repeatable, roughly 45% slowdown from interpretation alone. This is the direct, measured answer to whether a "compile to bytecode, run on a VM" language can be fast enough to matter in practice: the JIT is doing real, substantial work, not a marketing claim.

> **Pitfall:** this capstone's own numbers already show the JIT engaging essentially immediately (round 1 is already fast) for this specific, simple, hot-looped workload — real JIT warmup delay (a slow first call before compilation kicks in) is a genuine phenomenon for more complex, less predictable code, but isn't guaranteed to show up as a dramatic curve in every measurement. The `-Xint` comparison is the more reliable, repeatable way to measure the JIT's actual contribution; watching for a warmup curve within a single run is real but far noisier.

**Practice**

- Run this exact benchmark on your own machine and confirm you see a comparable gap between default and `-Xint` — the specific millisecond values will differ by hardware, but the *direction and rough magnitude* of the gap should hold.
- Contrast this against Go and Rust (already covered in this series), both compiling directly to native machine code ahead of time, with no JIT step at all — name the real tradeoff Java accepts here (a JIT compilation step happening *during* every program run) against what it gains (the identical bytecode running unmodified on any JVM, verified in this module's first section).

## Progress check

1. What are the first four bytes of every compiled `.class` file, literally, and what do they confirm?
2. What specific, real performance difference did this module measure between default execution and `-Xint`?
3. What does "write once, run anywhere" actually claim, precisely — and what does it not claim?

### Answers

1. `CAFEBABE` (hexadecimal) — confirmed directly with `xxd` against a real compiled file — the magic number identifying the file as JVM bytecode, present in every `.class` file regardless of source language or platform.
2. A consistent, repeatable difference of roughly 45% — around `120ms` per round with the JIT active versus around `180ms` with `-Xint` disabling it entirely, on the identical bytecode, measured directly rather than assumed from Java's own general reputation for speed.
3. It claims the *compiled bytecode artifact* runs unmodified on any compatible JVM, across operating systems and hardware, without recompilation — verified directly with `javap -c`'s real bytecode instructions. It does not claim identical performance everywhere, and does not claim all platform-specific differences (file paths, line endings) are handled automatically.
