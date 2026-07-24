# Module 3 — Interfaces & Polymorphism

Java's own answer to dynamic dispatch — a third mechanism in this series, genuinely different from both `cpp/`'s vtables and Smalltalk's message-passing. Feeds Capstone 1.

## Interfaces as pure contracts

**You'll be able to:** declare an interface, implement it in two different classes, and call through the interface type polymorphically.

**Concept**

An `interface` declares method signatures with no implementation (beyond default methods, below) and no instance state — a pure contract. A class `implements` an interface, providing real bodies for every abstract method. Calling a method through a variable declared as the interface type dispatches to whichever concrete class's implementation the actual object happens to be — resolved at runtime, based on the object's real type, not the variable's declared type.

**Example**

```java
interface Shape {
    double area();
}

class Circle implements Shape {
    private final double radius;
    Circle(double radius) { this.radius = radius; }
    public double area() { return Math.PI * radius * radius; }
}

class Rectangle implements Shape {
    private final double width, height;
    Rectangle(double width, double height) { this.width = width; this.height = height; }
    public double area() { return width * height; }
}

Shape[] shapes = { new Circle(2.0), new Rectangle(3.0, 4.0) };
for (Shape s : shapes) {
    System.out.printf("%.2f%n", s.area());
}
```
```
12.57
12.00
```

Every element of `shapes` is declared as `Shape`, but `s.area()` runs `Circle`'s own formula for the first element and `Rectangle`'s for the second — the same dynamic-dispatch outcome `cpp/03-inheritance-polymorphism.md` verified through an explicit vtable, and Smalltalk verified through message lookup at send-time. Java's own mechanism is neither: the JVM resolves the call against the interface's method table for the object's *actual* runtime class, a real, distinct third implementation of the identical idea this series has now traced through three languages.

> **Pitfall:** an interface reference (`Shape s`) can only call methods `Shape` itself declares — even if the underlying object is a `Rectangle` with extra methods, `s.someRectangleOnlyMethod()` is a compile error unless you cast back to `Rectangle` first. The interface type genuinely restricts what's callable, not just what's suggested.

**Practice**

- Add a `Triangle implements Shape` with its own `area()` formula, and confirm it slots into the same `Shape[]` loop with zero changes to the loop itself.
- Write a method `totalArea(Shape[] shapes)` summing every element's `area()` — confirm it works unchanged for any mix of `Circle`/`Rectangle`/`Triangle`.

## Default methods, and the diamond problem, verified

**You'll be able to:** give an interface a default implementation, override it selectively, and explain the real compile-time conflict Java forces when two interfaces disagree.

**Concept**

`default` methods (added in Java 8) let an interface provide a real implementation a class can inherit or override — genuinely different from a pure abstract method, since implementing classes get working behavior for free. This reintroduces, in a smaller and more controlled form, exactly the multiple-inheritance ambiguity Gosling's own original design deliberately avoided by disallowing multiple *class* inheritance: if a class implements two interfaces with conflicting default methods of the same signature, Java doesn't guess — it's a real compile error, forcing an explicit override.

**Example**

```java
interface Shape {
    double area();
    default String describe() {
        return "A shape with area " + area();
    }
}

class Rectangle implements Shape {
    // ...
    @Override
    public String describe() { return "A rectangle, " + width + "x" + height; }
}
```

`Circle` (no override) uses `Shape`'s own default `describe()`; `Rectangle` (explicit override) uses its own. Both are legal, unambiguous — one interface, one default, resolved cleanly.

**The real conflict, verified directly:**
```java
interface A { default String hello() { return "hello from A"; } }
interface B { default String hello() { return "hello from B"; } }
class C implements A, B { }
```
```
$ javac Diamond.java
Diamond.java:7: error: types A and B are incompatible;
class C implements A, B {
^
  class C inherits unrelated defaults for hello() from types A and B
1 error
```

`C` genuinely doesn't compile until it explicitly overrides `hello()` itself, resolving which parent's version (or a new one entirely) it actually means. This is real, live evidence of the specific complexity Java's own design history reacted to — multiple inheritance's genuine ambiguity — handled by a compile-time refusal rather than a language rule picking a winner silently.

> **Pitfall:** this conflict only triggers when the signatures genuinely collide (same method name, same parameters) — implementing two interfaces with entirely different default methods, even dozens of them, causes no conflict at all. It's specifically the ambiguous case Java refuses to resolve silently.

**Practice**

- Reproduce the `Diamond.java` conflict yourself, then fix it by adding `public String hello() { return A.super.hello(); }` to `C` — explicitly choosing `A`'s version — and confirm it now compiles.
- Add a third interface with its own, non-conflicting default method to the `Shape` hierarchy, and confirm no conflict arises implementing all three together.

## Progress check

1. What determines which class's `area()` actually runs when called through a `Shape`-typed variable — the variable's declared type, or the object's actual runtime type?
2. What's a real, concrete restriction of calling a method through an interface-typed reference, verified directly?
3. Why does `class C implements A, B` fail to compile when both interfaces declare a conflicting `default hello()`, and what's the real fix?

### Answers

1. The object's actual runtime type — `Shape s = new Rectangle(...)` calling `s.area()` runs `Rectangle`'s own implementation, regardless of the variable being declared as the more general `Shape` type. This is resolved dynamically, at the call, not fixed at compile time by the declared type.
2. Only methods the interface itself declares are callable through an interface-typed reference — a method that exists only on the concrete implementing class is a genuine compile error unless the reference is cast back to that concrete type first.
3. Because Java refuses to silently pick one parent's default implementation over the other when they conflict — it's a real, deliberate compile-time error rather than an implicit resolution rule, forcing the class itself to explicitly override the method (optionally calling back into one specific parent's version with `InterfaceName.super.method()`) and resolve the ambiguity itself.
