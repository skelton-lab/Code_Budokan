# Module 5 — Inheritance and Polymorphism

Where Ruby's duck typing actually descends from. Smalltalk's polymorphism is message-based, exactly like Ruby's — "if it responds to the message, it works" — except here that's not a design choice layered onto a class system, it's the *only* mechanism the language has ever had. Verified.

## Shapes, continuing the series' polymorphism thread

**You'll be able to:** build a small class hierarchy with a method every subclass must implement, dispatched polymorphically.

**Concept**

`self subclassResponsibility` in a base class method signals "subclasses must override this" — Smalltalk's equivalent of C++'s pure virtual function or Simula's bodyless `Virtual` procedure, enforced at the moment the method is actually called (at runtime — there's no compile-time check here, consistent with Smalltalk having no compile-time type checking at all).

**Example**

```smalltalk
Object subclass: Shape [
    area [ ^self subclassResponsibility ]
    describe [ ^self class name, ': area = ', self area rounded printString ]
]

Shape subclass: Circle [
    | radius |
    radius: r [ radius := r ]
    area [ ^3.14159 * radius * radius ]
]

Shape subclass: Box [
    | width height |
    width: w height: h [ width := w. height := h ]
    area [ ^width * height ]
]

| shapes |
shapes := OrderedCollection new.
shapes add: (Circle new radius: 2).
shapes add: (Box new width: 3 height: 4).

shapes do: [ :s | Transcript showCr: s describe ].
```

Verified: prints `Circle: area = 13` and `Box: area = 12` — `describe`, defined once on `Shape`, correctly calls `self area` and gets the right subclass's implementation each time, and `self class name` correctly reports the *actual* concrete class of each object, not `Shape`. (Area is rounded before printing — Module 1's Float bug workaround, applied consistently.)

> **Naming pitfall, found directly while building this guide:** the base example originally used `Rectangle` as the second shape's class name — GNU Smalltalk already has a **built-in** `Rectangle` class (used for graphics/geometry, with its own `origin`/`corner` instance variables), and redefining it produced a wall of confusing `undefined variable origin referenced` errors, because the new definition silently collided with the existing one instead of failing cleanly. Renaming to `Box` fixed it immediately. The general lesson: in an image-based, everything-already-loaded environment like Smalltalk's, check whether a class name you're about to use already exists in the base image before assuming you're defining something fresh — a real, live-environment risk that doesn't really have an equivalent in this series' file-based languages.

**This closes (or rather, reveals the origin of) the polymorphism thread running through this whole series.** Ruby's duck typing (that guide's Module 4) — "if it responds to the message, it works, no shared type required" — isn't an approximation of Smalltalk's model or a coincidentally similar idea. It's the direct descendant of it. Smalltalk simply never had a compile-time type system to duck-type *around* in the first place — this was always how it worked, from the very beginning of the object-oriented lineage this whole series has been tracing.

**Practice**

- Add a `Triangle` shape and confirm `describe` needs zero changes.
- Try instantiating `Shape` directly and calling `area` on it — confirm you get a runtime error referencing `subclassResponsibility`, not a compile-time error (there is no compile-time check here at all).

## Progress check

1. What does `self subclassResponsibility` communicate, and when is it actually checked — compile time or runtime?
2. What real, discovered naming collision did this module's example hit, and what does it reveal about Smalltalk's environment that's different from this series' other, file-based languages?
3. Why is Ruby's duck typing described here as a "direct descendant" of Smalltalk's model, rather than a similar but independent idea?
4. What would calling `area` on a bare `Shape` instance (never subclassed) actually do?

### Answers

1. That subclasses are expected to override this method — checked only at runtime, the moment the method is actually called on an instance that never overrode it; there's no compile-time verification of this at all, consistent with Smalltalk having no static type checking.
2. Redefining `Rectangle` collided with a built-in class already present in the Smalltalk base image, producing a wall of confusing internal errors rather than a clean failure. It reveals that Smalltalk's environment is image-based — classes already exist in a loaded environment rather than being defined fresh per file the way this series' other languages' programs are, so name collisions with pre-existing base-image classes are a real, live risk with no real equivalent in the file-based languages this series otherwise covers.
3. Because Smalltalk's object model — message sends resolved entirely at runtime, with no compile-time type system to check against — is the actual historical origin of the "if it responds to the message, it works" idea; Ruby's duck typing didn't independently arrive at a similar design, it inherited this exact object model's lineage.
4. It would raise a runtime error, since `Shape`'s own `area` method calls `self subclassResponsibility`, signaling that the method should have been overridden — caught only when actually executed, not before.
