# Module 7 — Generics & Type Erasure

Java's generics, and the real, verified runtime consequence that makes them genuinely different from `cpp/`'s templates, already covered in this series. Feeds Capstone 3.

## Writing a generic class

**You'll be able to:** write a class parameterized over a type, and use it with two different concrete types safely.

**Concept**

`class Box<T>` declares a type parameter `T`, usable as if it were a real type throughout the class body. `Box<String>` and `Box<Integer>` are both valid, fully type-checked uses of the same class — Module 2's compile-time list-type enforcement was this exact mechanism, applied to `ArrayList<E>`.

**Example**

```java
class Box<T> {
    private T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
    void set(T value) { this.value = value; }
}

Box<String> stringBox = new Box<>("hello");
Box<Integer> intBox = new Box<>(42);
System.out.println(stringBox.get());
System.out.println(intBox.get());
```
```
hello
42
```

**Practice**

- Write a generic `Pair<A, B>` class holding two differently-typed values, with a `swap()` method returning a new `Pair<B, A>`.
- Add a bounded type parameter, `class NumberBox<T extends Number>`, and confirm `new NumberBox<String>(...)` is now a real compile error — bounding restricts which types are legal, not just which methods are available.

## The verified consequence: type erasure

**You'll be able to:** state, with direct evidence, what actually happens to generic type information at runtime — and why that differs genuinely from `cpp/`'s own template mechanism.

**Concept**

Java generics are a compile-time-only construct: the compiler enforces `Box<String>` versus `Box<Integer>` fully at compile time, then **erases** the type parameter entirely from the compiled bytecode. At runtime, there is exactly one `Box` class, not a separate one per type argument — this is precisely the opposite of `cpp/`'s own templates (already covered in this series), where each instantiation (`Box<std::string>`, `Box<int>`) generates genuinely separate compiled code (monomorphization).

**Example — verified directly, not asserted:**

```java
Box<String> stringBox = new Box<>("hello");
Box<Integer> intBox = new Box<>(42);
System.out.println("Same class at runtime: " + (stringBox.getClass() == intBox.getClass()));
System.out.println("Class name: " + stringBox.getClass().getName());
```
```
Same class at runtime: true
Class name: Box
```

Both objects report the *identical* `Class` object at runtime, and its name is plain `Box` — no `<String>` or `<Integer>` survives anywhere in the runtime representation. The compiler checked the distinction fully at compile time and then discarded it; nothing about it exists once bytecode is produced.

> **Pitfall:** this is easy to misdescribe as "Java generics aren't real" — they're real at exactly one point (compile time, where `javac` genuinely refused `names.add(42)` against a `List<String>` in Module 2) and genuinely absent at another (runtime, where the two `Box` instances above are indistinguishable). Precision about *which* point matters here; conflating the two leads to real confusion about what generics can and can't do.

**Practice**

- Verify the identical finding for two `ArrayList` instances of different type parameters — `new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass()` — confirm it's also `true`, the same erasure applying to every generic class in the standard library, not something special about a hand-written `Box`.

## Two real, verified consequences of erasure

**You'll be able to:** name and reproduce two genuine compile errors that exist specifically because of erasure, not incidentally.

**Concept**

Because a type parameter doesn't exist at runtime, two things that would otherwise seem reasonable are real, hard compiler errors: checking `instanceof` against a bare type parameter, and creating an array of a generic type parameter directly.

**Example — `instanceof` against a type parameter:**

```java
static <T> boolean checkType(Object obj) {
    return obj instanceof T;
}
```
```
$ javac GenericMethodErasure.java
GenericMethodErasure.java:5: error: Object cannot be safely cast to T
        return obj instanceof T;
               ^
  where T is a type-variable:
    T extends Object declared in method <T>checkType(Object)
1 error
```

There is no `T` left at runtime for `instanceof` to check against — the compiler refuses outright, rather than letting the check silently mean something other than what it appears to.

**Example — creating an array of a type parameter:**

```java
public class GenericArrayBad<T> {
    private T[] items;
    GenericArrayBad(int size) {
        items = new T[size];
    }
}
```
```
$ javac GenericArrayBad.java
GenericArrayBad.java:4: error: generic array creation
        items = new T[size];
                ^
1 error
```

The standard workaround — `items = (T[]) new Object[size];` with `@SuppressWarnings("unchecked")` — creates a real `Object[]` and casts it, accepting an unchecked cast specifically because the erased runtime has no other way to represent "an array of whatever `T` turns out to be."

> **Pitfall:** the `@SuppressWarnings("unchecked")` workaround is a real, standard, and *safe* idiom when used correctly (as the standard library itself does internally) — but it is genuinely suppressing a real warning, not silencing a false alarm. Getting the surrounding logic wrong (storing the wrong type into that `Object[]` before it's ever read back out as `T`) is exactly the class of bug the warning exists to catch, opted out of deliberately.

**Practice**

- Reproduce both compile errors yourself, then verify the `(T[]) new Object[size]` workaround compiles (with the suppressed warning) and works correctly for storing and retrieving values.
- Given everything verified in this module: does `cpp/`'s own template-based generics have an equivalent to *either* of these two specific errors? Explain why or why not, grounded in what monomorphization versus erasure actually does differently at compile time.

## Progress check

1. What's the real, verified difference in what `Box<String>` and `Box<Integer>` are at runtime — one class, or two?
2. Why does `instanceof T` (a bare type parameter) fail to compile, precisely — what's actually missing at runtime?
3. Contrast Java's erasure with `cpp/`'s templates: which one produces genuinely separate compiled code per type argument, and which one produces exactly one shared implementation?

### Answers

1. One class — verified directly: `stringBox.getClass() == intBox.getClass()` is `true`, and `getClass().getName()` reports the plain, unparameterized name `Box` for both. The compile-time distinction is real, but nothing survives it into the runtime representation.
2. Because `T` is erased by the time the bytecode runs — there is no runtime representation of "T" left for `instanceof` to check an object against, so the compiler refuses the check outright rather than let it silently mean something else (like an unconditional `instanceof Object`).
3. `cpp/`'s templates use monomorphization — a genuinely separate compiled implementation is generated for each distinct type argument used. Java's generics use erasure — exactly one shared implementation exists at runtime regardless of how many different type arguments were used at compile time, verified directly with the identical `Class` object across `Box<String>` and `Box<Integer>`.
