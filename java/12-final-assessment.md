# Final Assessment

Across all nine modules and four capstones. Try each on paper first — no `java`.

1. Why does `b++` leave `a` unchanged after `int b = a`, but `sb2.append(...)` change what `sb1` prints after `StringBuilder sb2 = sb1`?
2. What's the real, verified difference between `s1 == s2` for two `new String("hi")` instances versus `s3 == s4` for two `"hi"` string literals?
3. What determines which class's `area()` actually runs when called through a `Shape`-typed reference — verified how?
4. What real compile-time conflict does Java force when a class implements two interfaces with a colliding `default` method, and what's the actual fix?
5. What's the real, verified consequence of calling a method declaring `throws IOException` without a `try`/`catch` or an onward `throws` declaration?
6. Contrast Java's checked-exception enforcement against Go's `result, _ := safeDivide(...)` and Rust's `Result<T, E>` — which of the three makes silently discarding a failure always possible, and which makes it never possible?
7. What did `stringBox.getClass() == intBox.getClass()` prove about `Box<String>` and `Box<Integer>` at runtime, and how does that differ from `cpp/`'s own templates?
8. Name the two real, verified compile errors that exist specifically because of type erasure.
9. What are the literal first four bytes of a compiled `.class` file, and what do they confirm about what `javac` actually produces?
10. What real, measured performance difference did this guide find between default JVM execution and `-Xint`?
11. In Capstone 4, what specifically survived being moved to a directory with no source files present at all, and why?
12. Name the one genuine, unforced cross-guide connection this guide's own overview names about `clojure/`, and state precisely what it claims.

## Answers

1. `int` is a primitive type — `b`'s assignment copied its *value*, making `b` a fully independent `5` that incrementing never touches back on `a`. `StringBuilder` is a reference type — `sb2 = sb1` copied the *reference*, so both variables point at the identical object, and mutating through either name is visible through both, verified directly with matching output.
2. `s1 == s2` is `false` — `new String(...)` explicitly forces two separate objects even with identical content. `s3 == s4` is `true` — string literals are interned in a shared pool by the JVM, so two identical literals genuinely share the same object. Both verified directly, side by side, in the same program.
3. The object's actual runtime type, not the reference's declared type — verified directly with a `Shape[]` array holding both `Circle` and `Rectangle` instances, each `s.area()` call resolving to its own concrete class's implementation despite every element being declared as the shared `Shape` type.
4. A real compile error (`class C inherits unrelated defaults ... from types A and B`) — Java refuses to silently pick one parent's default implementation, forcing the class to explicitly override the method itself, optionally calling back into one specific parent's version with `InterfaceName.super.method()`.
5. A real compile error — `error: unreported exception IOException; must be caught or declared to be thrown` — verified directly; the program produces no bytecode at all until the exception is either caught or the calling method declares it onward in its own `throws` clause.
6. Go's `result, _ := safeDivide(...)` makes discarding always syntactically possible — verified directly in `go/05-error-handling-explicit-returns.md` compiling and running with the error thrown away. Rust's `Result<T, E>` makes it never possible — the compiler forces every `Result` to be unwrapped or explicitly propagated. Java sits between the two: checked exceptions force handling, unchecked ones don't, a real, declared distinction neither Go nor Rust makes.
7. It proved they're the *identical* class at runtime — `getClass()` returned the same object, named simply `Box`, with no trace of `<String>` or `<Integer>` surviving into the runtime representation. This is the opposite of `cpp/`'s templates, which generate genuinely separate compiled code (monomorphization) per distinct type argument used.
8. `instanceof T` against a bare type parameter (`error: Object cannot be safely cast to T`) and creating an array of a type parameter directly, `new T[size]` (`error: generic array creation`) — both verified directly, both existing specifically because no runtime representation of the erased type parameter exists for either operation to work against.
9. `CAFEBABE` (hexadecimal), confirmed directly with `xxd` against a real compiled file — proof that `javac` produces platform-independent bytecode, not native machine code, since this magic number and the class-file format it introduces are identical regardless of what platform compiled the source or what platform eventually runs it.
10. A consistent, repeatable ~45% slowdown running the identical bytecode with `-Xint` (JIT entirely disabled) versus default execution — verified directly across six repeated rounds each way, not asserted from Java's own general reputation for speed.
11. The compiled `stats.jar` itself — moved alone, with zero `.java` or loose `.class` files present, `java -jar stats.jar` still ran correctly and produced identical output. It survived because the jar already contains every compiled class the program needs (Module 9's own bytecode-portability point, demonstrated physically rather than just asserted) plus a manifest naming the entry point.
12. `clojure/` has been running on the JVM this entire series without Java itself ever being named — this guide closes that thread directly: `clojure/`'s own guide already verified extending a built-in Java type from Clojure code, and every `.clj` file it compiled ultimately produces JVM bytecode of the identical kind this guide's own Module 9 inspected directly with `javap`. This guide is, among other things, the platform Clojure was hosted on the whole time, finally made explicit.
