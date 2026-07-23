# Module 2 — The Class as a Generalized Block

The single idea this whole guide exists to explain. Everything here is documented, not executed — but it's documented precisely enough, and corroborated across enough independent sources, to state with real confidence.

## From block to object

**You'll be able to:** explain, in one sentence, what a Simula class adds to an ALGOL block that makes it an "object."

**Concept, documented:**

Recall the ALGOL guide's Module 2: a `BEGIN...END` block can declare local variables, and those variables cease to exist the moment the block ends. Simula's `class` is best understood as **exactly that block, with one change**: a class's local variables and procedures **persist after the block "ends"** — because the block doesn't actually end when you'd expect; instead, creating an instance of the class allocates a genuinely separate, persistent copy of that block's local state, which you can then reference, call procedures on, and read/write variables from, for as long as you hold a reference to it.

This is the entire conceptual leap from "block" to "object": a block is a scope that exists only during one execution; a class instance is a scope that's been given its own independent lifetime, outliving the call that created it.

**Example, documented (not executed — see the overview's toolchain note):**

```simula
Class Point;
Begin
   Real x, y;

   Procedure move(dx, dy); Real dx, dy;
   Begin
      x := x + dx;
      y := y + dy
   End move;
End Point;
```

```simula
Begin
   Ref (Point) p;
   p :- New Point;
   p.x := 10;
   p.y := 20;
   p.move(5, 5)
End;
```

Read this against what you already know from ALGOL: `Class Point; Begin ... End Point;` looks like an ALGOL block with a name and a `Class` keyword in front — because structurally, that's essentially what it is. `Ref (Point) p` declares `p` as a **reference** to a `Point` object — Simula's type system distinguishes reference types from value types explicitly. `New Point` **creates** a persistent instance of the block. `p.x`, `p.move(...)` access that specific instance's state and procedures using dot notation.

> **Three details worth noticing precisely, because they became permanent vocabulary:** `New` for object creation is the exact word C++ (and, downstream, Java, C#, and many others) still uses for the identical purpose. `Ref(ClassName)` is Simula's explicit reference-type notation — the direct conceptual ancestor of a C++ pointer/reference to an object. Dot notation for accessing an object's members (`p.x`, `p.move(...)`) is exactly the syntax every object-oriented language in this series already uses.

> **Pitfall, worth being precise about since it can't be checked by a compiler here:** notice `:-`, not `:=`, in `p :- New Point`. Simula distinguished **reference assignment** (`:-`, "make `p` refer to this new object") from **value assignment** (`:=`, "copy this value into this variable") as genuinely different operations with different symbols — a distinction most later languages collapsed back into a single assignment operator, relying on the type system (is the left side a reference type or a value type?) to determine which behavior actually happens, rather than requiring the programmer to say so explicitly every time.

**Practice**

- Write out, in your own words, the ALGOL block from the ALGOL guide's Module 2 side by side with `Class Point`, and mark exactly which single conceptual change (persistence beyond the creating call) separates them.
- Sketch a `Class Counter` with one integer field and an `increment` procedure — you won't be able to run it, but writing it out by hand is the actual exercise this module is testing.

## Progress check

1. What single conceptual change turns an ALGOL block into a Simula class, in this guide's framing?
2. What does `Ref(Point)` declare, and how does it differ from declaring a plain value?
3. What later, still-current keyword did Simula's `New` directly become?
4. What's the documented difference between `:-` and `:=` in Simula, and why did most later languages collapse this distinction?
5. Why is this module's central claim ("a class is a persistent block") something you can trust with real confidence, despite having no compiler to check it against?

### Answers

1. Persistence — the block's local state, instead of ceasing to exist when the block "ends," is given its own independent lifetime via object creation, outliving the call that created it.
2. It declares `p` as a reference to a `Point` object — not a `Point` value itself, but something that points to (refers to) a separately-allocated, persistent instance. This differs from a plain value declaration, which would hold the actual data directly.
3. `new` — used identically, for object instantiation, in C++ and (downstream of it) Java, C#, and many other languages.
4. `:-` is reference assignment ("make this variable refer to that object"); `:=` is value assignment ("copy this value in"). Most later languages collapsed this into one assignment operator, using the variable's declared type (reference type vs. value type) to determine which behavior applies, rather than requiring a different symbol every time.
5. Because it's not a single, isolated claim — it's corroborated by the structural similarity to ALGOL block syntax (independently documented), by Simula's well-established historical role as "the first OOP language" (independently documented via the Dahl/Nygaard Turing Award citation), and by direct terminological survival (`new`, dot notation) into languages this guide's toolchain *can* verify.
