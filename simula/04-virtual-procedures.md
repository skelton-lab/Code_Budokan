# Module 4 — Virtual Procedures

The single most direct terminological line in this entire series. C++'s `virtual` keyword is not a coincidental naming choice — it's Simula's own word, for Simula's own mechanism, carried straight across by Stroustrup. Documented, not executed.

## What "virtual" meant first

**You'll be able to:** state precisely what Simula's `Virtual` specification does, and recognize it as the same mechanism your C and C++ guides already built.

**Concept, documented:**

Simula 67 let a class declare a procedure as **`Virtual`** — meaning a subclass is permitted to provide its own redefinition of that procedure, and a call made through a reference to the base class **dispatches to whichever redefinition actually belongs to the object's real, concrete type** — not to the base class's own version, even though the call was written against the base class's declared interface. This is precisely, mechanism-for-mechanism, what your C guide's Capstone 5 built by hand (a struct with a function pointer, assigned per concrete type) and what your C++ guide's Module 3 covers via the `virtual` keyword directly.

**Example, documented (not executed):**

```simula
Class Shape;
Virtual: Procedure area;
Begin
End Shape;

Shape Class Circle;
Begin
   Real radius;

   Procedure area;
   Begin
      area := 3.14159 * radius * radius
   End area;
End Circle;

Shape Class Rectangle;
Begin
   Real width, height;

   Procedure area;
      area := width * height;
End Rectangle;
```

`Shape` declares `area` as `Virtual` but gives it no real body — a base class stating "every concrete shape must provide this," structurally the same idea as C++'s pure virtual function (`virtual double area() const = 0;`) and the C guide's `Shape` struct requiring every concrete type to assign its own `area` function pointer. `Circle` and `Rectangle` each provide their own `area`. A procedure call made through a `Ref(Shape)` variable holding a `Circle` instance calls `Circle`'s `area` — the base class's declared interface, dispatched to the concrete type's actual implementation.

> **This is worth stating as plainly as possible, because it's the actual point of this whole guide:** when Stroustrup added this mechanism to "C with Classes," he called it `virtual` — the exact word Simula's own report used for the exact same mechanism. This isn't "C++ independently arrived at a similar idea and happened to pick the same word" — it's Simula's terminology, carried forward directly, for a directly borrowed concept.

**Practice**

- Open your C++ guide's Module 3 (`virtual`, abstract base classes) side by side with this module, and map every piece: `Shape`/`virtual double area() const = 0;` in C++ against `Class Shape; Virtual: Procedure area;` here. Same shape, three decades apart.
- Open your C guide's Capstone 5 (the manual vtable) alongside both, and write one paragraph tracing the same underlying dispatch mechanism through all three: a function pointer assigned per concrete type (C, by hand) → `Virtual` procedures (Simula, the origin) → `virtual` (C++, the direct terminological descendant).

## Progress check

1. What does declaring a procedure `Virtual` in a Simula class actually guarantee about how a call to it resolves?
2. Is C++'s `virtual` keyword an independently-chosen word for a similar idea, or something more direct?
3. What C-guide capstone built the identical dispatch mechanism by hand, without a language keyword for it at all?
4. What Simula construct is structurally equivalent to C++'s pure virtual function (`= 0`)?
5. Trace the three-step lineage this module establishes, from raw mechanism to modern keyword.

### Answers

1. That a call to it, made through a reference to the base class, dispatches to whichever redefinition belongs to the object's actual, concrete type — not necessarily the base class's own version, even though the call site only knows about the base class's declared interface.
2. Something more direct — Stroustrup carried Simula's own term, `virtual`, across for the identical mechanism, not an independently-arrived-at coincidental naming choice.
3. C Capstone 5 — the manual vtable, a struct with a function pointer assigned per concrete type, dispatched by hand with no language keyword doing the work.
4. A `Virtual` procedure declared with no real body in the base class (as `Shape`'s `area` is here) — every concrete subclass is required to provide its own implementation, exactly matching what `= 0` enforces in C++.
5. A function pointer assigned per concrete type, done entirely by hand (C) → Simula's `Virtual` procedure specification, the first language-level version of this mechanism, with its own terminology → C++'s `virtual` keyword, the direct terminological and conceptual descendant, compiler-generated instead of hand-built.
