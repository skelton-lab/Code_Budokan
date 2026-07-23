# Module 2 — Classes and Instances

Defining a class and creating instances of it. Verified.

## Defining a class

**You'll be able to:** declare a class with instance variables and methods, and create/use an instance.

**Concept**

`Object subclass: ClassName [ ... ]` declares a new class inheriting from `Object` (Smalltalk's universal root class — everything ultimately inherits from it). `| var |` inside the brackets declares instance variables. Each method is written as a message pattern followed by its body — no `def`/`function` keyword at all, the method's own name (unary, binary, or keyword) *is* the declaration.

**Example**

```smalltalk
Object subclass: Counter [
    | count |
    init [ count := 0 ]
    increment [ count := count + 1 ]
    value [ ^count ]
]

| c |
c := Counter new.
c init.
c increment.
c increment.
c increment.
Transcript showCr: c value printString.
```

Verified: prints `3` — `Counter new` creates an instance, `init` sets its private `count` to `0`, three `increment` sends each add `1`, and `value` (using `^`, Smalltalk's explicit "return this" operator) reports the result back.

> **Pitfall:** `Counter new` alone does **not** call `init` automatically — Smalltalk's `new` just allocates a fresh instance with all instance variables set to `nil`. Calling `init` is a separate, explicit step in this example. (Real Smalltalk code very commonly overrides the class-side `new` method itself to call `init` automatically — a pattern worth knowing exists, even though this module's example keeps the two steps visible and separate for clarity.)

**Practice**

- Confirm directly: create a `Counter` without calling `init`, then call `value` — read what you get back (`nil`, since `count` was never assigned), and note that calling `increment` on it would fail, since you can't add `1` to `nil`.
- Add a `reset` method setting `count` back to `0`.

## Progress check

1. What does `Object subclass: ClassName [ ... ]` declare?
2. Does `Counter new` automatically run an `init` method? What does it do instead?
3. What does `^` do inside a method body?
4. What would `c value` return if `init` were never called, and why?

### Answers

1. A new class named `ClassName`, inheriting from `Object` (Smalltalk's universal root class).
2. No — `new` just allocates a fresh instance with every instance variable set to `nil`. Calling an initializer method (like this example's `init`) is a separate, explicit step unless the class overrides `new` itself to call it automatically.
3. It returns the given value from the method — Smalltalk's explicit return operator.
4. `nil` — because `count` was never assigned a value, it retains the default `nil` every instance variable starts with.
