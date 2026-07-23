# Module 4 — Classes & Objects

By the end of this module you'll be able to define classes with `racket/class`, implement interfaces, override inherited methods, and call a parent's implementation from inside an override. Feeds Capstone 2 — and adds a new entry to this series' long-running polymorphism thread.

## `class`, `interface`, and `define/public`

**You'll be able to:** define a class implementing an interface, instantiate it, and call its methods.

**Concept**

`(interface () method-name ...)` declares a set of required method names — Racket's version of a contract on an object's *shape*, distinct from Module 2's contracts on plain function values. `(class* object% (interface-name) ...)` defines a class implementing that interface; `define/public` declares a method callable from outside the class; `new` instantiates; `send` calls a method on an instance.

**Example**

```racket
(require racket/class)

(define shape<%> (interface () area))

(define circle%
  (class* object% (shape<%>)
    (init radius)
    (define r radius)
    (super-new)
    (define/public (area) (* 3.14159 r r))))

(define rectangle%
  (class* object% (shape<%>)
    (init width height)
    (define w width)
    (define h height)
    (super-new)
    (define/public (area) (* w h))))

(define shapes (list (new circle% [radius 5]) (new rectangle% [width 4] [height 6])))
(for-each (lambda (s) (displayln (send s area))) shapes)
(displayln (is-a? (new circle% [radius 1]) shape<%>))
```

```
78.53975
24
#t
```

Verified directly: `(send s area)` correctly computes each shape's actual area (`π·5² = 78.53975`, `4·6 = 24`) even though `shapes` is a mixed list — the exact same "one message, different behavior per receiver" mechanism this series traced through C's hand-built function pointers, Simula's `virtual`, C++'s compiler-generated version of the same thing, and Smalltalk's fully-dynamic message sends. `is-a?` confirms `circle%` genuinely implements `shape<%>`, checkable at runtime.

> **Pitfall:** `init radius` (not `define`) declares a *construction-time* argument — `(new circle% [radius 5])` supplies it by keyword at instantiation, and it's only available inside the class body via the separate `(define r radius)` that copies it into an ordinary field. Forgetting `super-new` (which finishes the object's construction, including its `object%` base) is a common, real mistake — it's easy to assume `init` alone wires everything up.

**Practice**

- Add a `triangle%` class implementing `shape<%>` with a `base`/`height` construction, and confirm it works correctly in the same `shapes` list.
- Add a second interface method (`perimeter`) and confirm the compiler/runtime genuinely requires every implementing class to provide it (try instantiating a class missing it, and read the actual error).

## Inheritance, `define/override`, and calling `super`

**You'll be able to:** override an inherited method, and call the parent class's original implementation from inside that override.

**Concept**

A class inherits by naming another class as its base (`(class parent-class% ...)` instead of `(class object% ...)`). `define/override` replaces an inherited method's implementation — the method must already exist in the parent for `define/override` to be valid, a genuinely useful compile-time check `define/public` doesn't give you. `(super method-name args...)` calls the *parent's* implementation of that method from inside an override, rather than replacing it outright.

**Example**

```racket
(define animal%
  (class object%
    (super-new)
    (define/public (speak) (error "abstract method"))))

(define dog%
  (class animal%
    (super-new)
    (define/override (speak) "Woof")))
(displayln (send (new dog%) speak))

(define loud-dog%
  (class dog%
    (super-new)
    (define/override (speak) (string-append (super speak) "!!!"))))
(displayln (send (new loud-dog%) speak))
```

```
Woof
Woof!!!
```

Verified directly: `dog%` correctly overrides `animal%`'s placeholder (which would `error` if ever actually called — an abstract-method pattern, since `racket/class` has no dedicated `abstract` keyword). `loud-dog%` demonstrates the sharper case: its own `speak` override calls `(super speak)` to get `dog%`'s `"Woof"` first, then builds on it (`"Woof!!!"`) — the parent's implementation genuinely ran and contributed to the result, rather than being discarded entirely by the override.

> **Pitfall:** `define/override` on a method name the parent class doesn't actually define is an error — this is a real, useful check `racket/class` performs, catching a typo'd method name at class-definition time rather than silently creating an unrelated new method that never gets called through the expected interface.

**Practice**

- Write a three-level inheritance chain (`animal%` → `dog%` → `loud-dog%` → your own fourth level) where each level's override calls `super` and adds something distinctive, and trace by hand what the final `send` produces before verifying it.
- Deliberately misspell a method name in a `define/override` and read the actual compiler error.

## Progress check

1. What does `interface` declare, and how does it differ from Module 2's function contracts?
2. What does `is-a?` check, and when might it return `#f` for an object that has an `area` method?
3. What's the difference between `init` and `define` inside a class body?
4. Why does `define/override` require the method to already exist in the parent class?
5. What does `(super method-name args...)` actually do, and how did `loud-dog%`'s example demonstrate it concretely?

### Answers

1. `interface` declares a required set of method *names* an implementing class must provide — a contract on an object's shape/capability, distinct from Module 2's contracts on individual function argument/return values.
2. It checks whether an object's class was declared to implement a specific named interface — it could return `#f` even for an object with a method literally named `area`, if that class was never declared with `(class* object% (shape<%>) ...)` naming that interface explicitly; having the right method name alone isn't sufficient.
3. `init` declares a construction-time argument, supplied by keyword when the object is created via `new`; `define` inside the class body declares an ordinary field or method, not tied to construction-time arguments at all.
4. Because it's meant to *replace* an existing inherited behavior — requiring the method to already exist catches a typo'd or nonexistent method name at class-definition time, rather than silently defining an unrelated new method.
5. It calls the parent class's own implementation of the named method, from inside the current override, without discarding it. `loud-dog%`'s override called `(super speak)` to get `dog%`'s `"Woof"` first, then appended `"!!!"` to it — the parent's actual implementation ran and its result was used, not just referenced or skipped.
