# Module 1 — Foundations

Java's real static-typing split — primitives versus references — and the compile-then-run workflow every later module assumes. Feeds all four capstones.

## Compiling and running: `javac` then `java`

**You'll be able to:** compile a `.java` file to bytecode and run it, and explain why those are two separate steps.

**Concept**

`javac` compiles source to `.class` bytecode files; `java` runs that bytecode on the JVM. Every Java program's entry point is `public static void main(String[] args)` inside a class — no bare top-level statements the way `php`/`python`/`javascript` all allow. The class name and filename must match exactly for a public top-level class.

**Example**

```java
public class Foundations {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}
```
```
$ javac Foundations.java
$ java Foundations
Hello, Java
```

> **Pitfall:** OpenJDK installed via Homebrew is keg-only — it is *not* linked onto your `PATH` by default, unlike most Homebrew formulas. `java -version` after a bare `brew install openjdk` still reports "Unable to locate a Java Runtime" until you either add `/opt/homebrew/opt/openjdk/bin` to `PATH` or run the `java` binary from that path directly. This guide is verified against exactly that setup.

**Practice**

- Compile and run the example above, then rename the file without renaming the class inside it, and confirm `javac` refuses with a real, specific error.

## Primitives copy by value; references copy the reference

**You'll be able to:** predict, correctly, whether mutating a variable after assignment affects the original.

**Concept**

Java has exactly eight primitive types (`int`, `long`, `double`, `boolean`, `char`, `byte`, `short`, `float`) — these copy by value on assignment, full stop. Everything else (`String`, arrays, every class instance) is a reference type: assignment copies the *reference*, not the object, so two variables can point at the same underlying object.

**Example**

```java
int a = 5;
int b = a;
b++;
System.out.println("a=" + a + " b=" + b);

StringBuilder sb1 = new StringBuilder("hello");
StringBuilder sb2 = sb1;
sb2.append(" world");
System.out.println("sb1=" + sb1 + " sb2=" + sb2);
```
```
a=5 b=6
sb1=hello world sb2=hello world
```

`b++` only ever touched `b`'s own copy — `a` stays `5`. But `sb2.append(...)` mutated the *same* `StringBuilder` object `sb1` also points at, so both variables show the change — they were never separate objects to begin with.

> **Pitfall:** `String` is a reference type but an *immutable* one — every apparent "mutation" (`s.toUpperCase()`, string concatenation) actually returns a brand new `String` object, leaving the original untouched. This is a real, easy source of confusion: `String` looks like it should behave like `StringBuilder` above, but doesn't, because none of its methods mutate in place at all.

**Practice**

- Write a method taking an `int` parameter and incrementing it inside the method; confirm the caller's own variable is unaffected — primitives pass by value into methods too, not just on assignment.
- Write the same experiment with an `ArrayList<String>` parameter, adding an element inside the method, and confirm the caller *does* see the addition — same value-copies-the-reference rule, at the method-call boundary this time.

## `==` versus `.equals()`

**You'll be able to:** explain precisely when `==` and `.equals()` diverge for reference types, verified directly against `String`'s own literal-pooling behavior.

**Concept**

For reference types, `==` compares whether two variables point at the *identical* object in memory — not whether their contents match. `.equals()` (when a class overrides it meaningfully, as `String` does) compares content. String literals are a real, specific exception worth knowing precisely: Java interns string literals in a shared pool, so two identical literals *do* share the same object — `==` between them is `true` — while two `String` objects built with `new String(...)` never share identity even with identical content.

**Example**

```java
String s1 = new String("hi");
String s2 = new String("hi");
System.out.println("s1 == s2: " + (s1 == s2));
System.out.println("s1.equals(s2): " + s1.equals(s2));

String s3 = "hi";
String s4 = "hi";
System.out.println("s3 == s4 (literals): " + (s3 == s4));
```
```
s1 == s2: false
s1.equals(s2): true
s3 == s4 (literals): true
```

> **Pitfall:** this is a genuinely common real bug, not a contrived example — code that works correctly in casual testing (where string literals happen to be compared) can silently break the moment a string arrives from user input, a file, or network data (`new String(...)`-equivalent construction under the hood), because `==` stops being reliable exactly there. Use `.equals()` for content comparison, always, never `==`, unless identity itself is specifically what's being checked.

**Practice**

- Predict, then verify, what `Integer.valueOf(100) == Integer.valueOf(100)` versus `Integer.valueOf(200) == Integer.valueOf(200)` print — Java caches boxed `Integer` values in the range −128 to 127, a real, verified parallel to the string-literal-pool behavior above, with an even sharper edge (the cache boundary itself).

## Progress check

1. What are the two separate steps `javac` and `java` each perform?
2. Why does `b++` leave `a` unchanged, but `sb2.append(...)` change what `sb1` prints too?
3. Why is `s3 == s4` `true` for two `"hi"` string literals, but `s1 == s2` `false` for two separately-`new`-constructed `"hi"` strings?

### Answers

1. `javac` compiles Java source into `.class` bytecode files; `java` runs that bytecode on the JVM — compiling and running are always two distinct commands, never one combined step.
2. `int` is a primitive type, copied by value on assignment — `b` became its own independent copy of `5` the moment it was declared, so incrementing it never touches `a`. `StringBuilder` is a reference type — `sb2 = sb1` copied the *reference*, so `sb1` and `sb2` point at the identical object, and mutating through either name is visible through both.
3. String literals are interned in a shared pool by the JVM, so two identical literals genuinely share the same object — `==` (identity comparison) is `true`. `new String(...)` explicitly forces a new, separate object each time, even with identical content, so `==` between two separately-constructed strings is `false` regardless of what they contain.
