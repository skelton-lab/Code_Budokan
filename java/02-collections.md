# Module 2 — Collections

`ArrayList` and `HashMap` — the two data structures every later capstone leans on — plus a first, concrete look at the generics syntax Module 7 covers in full depth.

## `ArrayList<T>`: a growable, type-checked list

**You'll be able to:** build, read, and iterate an `ArrayList`, and explain what the `<String>` in `List<String>` actually buys you.

**Concept**

`ArrayList` is Java's standard growable list — unlike a plain array, it resizes automatically as elements are added. The `<String>` is a generic type parameter (full treatment in Module 7): it tells the compiler this list holds `String`s specifically, and the compiler enforces it — adding anything else is a real compile error, not a runtime surprise.

**Example**

```java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();
names.add("Ada");
names.add("Alan");
names.add("Grace");
System.out.println(names);
System.out.println("size=" + names.size());
System.out.println("get(1)=" + names.get(1));

for (String name : names) {
    System.out.println("iter: " + name);
}
```
```
[Ada, Alan, Grace]
size=3
get(1)=Alan
iter: Ada
iter: Alan
iter: Grace
```

**Verified — the type check is real, not documentation:**
```java
List<String> names = new ArrayList<>();
names.add("Ada");
names.add(42);
```
```
$ javac TypeSafety.java
TypeSafety.java:8: error: incompatible types: int cannot be converted to String
        names.add(42);
                  ^
1 error
```

This never runs at all — `javac` itself rejects it, before any bytecode exists. This is Module 7's whole subject in miniature: the compiler is checking the type here, not the JVM at runtime.

> **Pitfall:** `List<String> names = new ArrayList<>()` — declaring the variable as the `List` interface rather than the concrete `ArrayList` class is the idiomatic style, not an oversight. Code written against `List` works unchanged if the concrete implementation later needs to change (to a `LinkedList`, say); code written against `ArrayList` directly doesn't get that flexibility for free.

**Practice**

- Build a list of five integers, and use a `for` loop (not `for-each`) to print each one alongside its index.
- Confirm `names.get(10)` on a 3-element list throws `IndexOutOfBoundsException` at runtime — a real, live exception, not a compile error, since indices aren't checkable until the program actually runs.

## `HashMap<K, V>`: key-value lookup

**You'll be able to:** build and read a `HashMap`, and use `getOrDefault` to avoid a missing-key crash.

**Concept**

`HashMap<K, V>` maps keys to values — `String` keys to `Integer` values, in the example below, though both type parameters can be anything. `get()` on a missing key returns `null` (not an exception) for a reference-typed value; `getOrDefault(key, fallback)` is the standard way to avoid a `null` check afterward.

**Example**

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> ages = new HashMap<>();
ages.put("Ada", 36);
ages.put("Alan", 41);
System.out.println(ages.get("Ada"));
System.out.println(ages.getOrDefault("Missing", -1));
```
```
36
-1
```

> **Pitfall:** `HashMap` makes no guarantee about iteration order — printing all entries in a loop can come out in a different order than insertion order, and that order isn't even guaranteed to stay consistent across separate JVM runs. `LinkedHashMap` (same interface, different implementation) preserves insertion order if that's actually required; reaching for plain `HashMap` and assuming order is a real, easy-to-miss bug.

**Practice**

- Build a `Map<String, Integer>` of at least four fruit names to prices, and print the total using `values()` and a loop.
- Look up a key you know doesn't exist with plain `get()` (not `getOrDefault`), and confirm the result is `null`, not an exception — then try calling a method on that `null` result and confirm `NullPointerException` is what a missing check actually costs you.

## Progress check

1. What does the `<String>` in `List<String> names = new ArrayList<>()` actually enforce, and at what point — compile time or runtime?
2. Why declare a variable's type as `List` rather than `ArrayList`, given `ArrayList` is what's actually being constructed?
3. What does `HashMap.get()` return for a missing key, and how does that differ from `getOrDefault()`'s behavior?

### Answers

1. It enforces that only `String` values can be added to the list — enforced at **compile time**, by `javac` itself; `names.add(42)` is rejected before any bytecode is even produced, verified directly with the real compiler error.
2. So code written against the `List` interface keeps working unchanged if the concrete implementation later needs to switch (to `LinkedList`, for instance) — code written against `ArrayList` specifically loses that flexibility.
3. `get()` on a missing key returns `null`, which then risks a `NullPointerException` the moment something calls a method on that `null` result without checking first. `getOrDefault(key, fallback)` returns the supplied fallback value directly instead of `null`, avoiding that check entirely.
