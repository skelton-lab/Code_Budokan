# Module 2 — Modules: Definition, Implementation, and Explicit Import/Export

The headline feature, and the direct, named answer to `pascal/10-beyond-this-guide.md`'s units gap: every Modula-2 module comes in two parts — a **definition** module (the public interface, what other modules are allowed to see) and an **implementation** module (the actual code, hidden from everyone else). Documented throughout — see `00-overview.md`'s toolchain note.

## The split: definition module versus implementation module

**You'll be able to:** explain what a definition module exposes versus what an implementation module hides.

**Concept, documented:**

A **definition module** declares everything another part of the program is allowed to use from this module — procedure signatures, type names, constants — with no actual code bodies. An **implementation module** provides the real, working code for everything the definition module declared, plus anything else purely internal to this module's own workings, invisible to everyone else.

**Example, documented (not executed — see the overview's toolchain note):**

```modula2
DEFINITION MODULE Stack;

  PROCEDURE Push(item: INTEGER);
  PROCEDURE Pop(): INTEGER;
  PROCEDURE IsEmpty(): BOOLEAN;

END Stack.
```

```modula2
IMPLEMENTATION MODULE Stack;

  CONST MaxSize = 100;
  VAR
    items: ARRAY [0..MaxSize-1] OF INTEGER;
    top: INTEGER;

  PROCEDURE Push(item: INTEGER);
  BEGIN
    items[top] := item;
    top := top + 1;
  END Push;

  PROCEDURE Pop(): INTEGER;
  BEGIN
    top := top - 1;
    RETURN items[top];
  END Pop;

  PROCEDURE IsEmpty(): BOOLEAN;
  BEGIN
    RETURN top = 0;
  END IsEmpty;

BEGIN
  top := 0;
END Stack.
```

The definition module names three procedures and nothing about *how* they work. The implementation module's `items` array, `top` index, and `MaxSize` constant are genuinely invisible to any other part of the program that only sees `Stack`'s definition module — a real, compiler-enforced boundary, not a documentation convention. The implementation module's own trailing `BEGIN ... END Stack.` block is the module's initialization code, run once, automatically, before the rest of the program starts — here, setting `top` to `0` before anything could possibly call `Push`.

> **Pitfall, worth being precise about since it can't be checked by a compiler here:** the array-based stack shown is a deliberately simple illustration — a real Modula-2 stack module would very likely use `Opaque types` (Module 3) so callers never see even the *existence* of an array-based implementation, only a type name they can hold a reference to. This module's version exposes `Push`/`Pop`/`IsEmpty` correctly, but a caller who somehow obtained access to the implementation module directly (which the language's compilation model doesn't allow, but is worth naming as the actual boundary being enforced) would see the array; Module 3 covers the stronger form of hiding that prevents even a well-meaning caller from depending on implementation details at all.

**Practice**

- Sketch, by hand, a `DEFINITION MODULE Queue` with `Enqueue`/`Dequeue`/`IsEmpty` procedure signatures, matching `Stack`'s shape, before reading Module 3 — the exercise is deciding what belongs in the definition versus the implementation, which is the actual skill this module is teaching.

## `IMPORT` and `FROM ... IMPORT`: explicit, and two different forms

**You'll be able to:** use both forms of Modula-2's import statement, and explain when each is the better choice.

**Concept, documented:**

`FROM ModuleName IMPORT identifier1, identifier2;` imports specific names directly, usable unqualified afterward. `IMPORT ModuleName;` imports the whole module but requires every use to be **qualified** with the module's name (`ModuleName.identifier`) — Modula-2 requiring one of these two forms explicitly is the direct, structural fix for the exact gap `pascal/10-beyond-this-guide.md` named: Pascal has no standard mechanism here at all.

**Example, documented:**

```modula2
MODULE StackDemo;

FROM Stack IMPORT Push, Pop, IsEmpty;
FROM InOut IMPORT WriteInt, WriteLn;

BEGIN
  Push(10);
  Push(20);
  WriteInt(Pop(), 4);
  WriteLn;
END StackDemo.
```

```modula2
MODULE StackDemoQualified;

IMPORT Stack;
FROM InOut IMPORT WriteInt, WriteLn;

BEGIN
  Stack.Push(10);
  Stack.Push(20);
  WriteInt(Stack.Pop(), 4);
  WriteLn;
END StackDemoQualified.
```

Both versions do the identical thing — the first imports `Push`/`Pop`/`IsEmpty` directly and calls them unqualified; the second imports the whole `Stack` module and requires `Stack.` prefixing every use. The qualified form is the better choice specifically when two imported modules might otherwise export a same-named identifier, or when a reader benefits from seeing at the call site exactly which module a given procedure came from.

> **Historically well-corroborated:** this explicit, compiler-checked import/export mechanism, entirely absent from standard Pascal, is consistently cited across independent histories of the language as Modula-2's single most influential structural contribution — a real, traceable lineage runs from here through Ada's package system to the module systems of many later languages.

**Practice**

- Rewrite `StackDemo` importing `Stack` in qualified form only, and `InOut` in unqualified form — the two styles can be mixed freely, module by module, in the same program.

## Progress check

1. What does a definition module declare, and what does it deliberately withhold?
2. In the `Stack` example, why are `items` and `top` invisible to code that only imports from `Stack`'s definition module?
3. What runs automatically, once, in an implementation module's trailing `BEGIN...END` block?
4. What's the difference between `FROM Stack IMPORT Push;` and `IMPORT Stack;`, and when is the qualified form specifically useful?
5. What does this module's own historical claim say about Modula-2's module system's influence, beyond just being "a nice feature Pascal lacked"?

### Answers

1. It declares everything another module is allowed to use — procedure signatures, type names, constants — with no actual implementation code; it withholds every internal detail of how those procedures actually work.
2. Because `items` and `top` are declared inside the *implementation* module, not the definition module — only names appearing in the definition module are visible to code importing from `Stack`, so internal working data has no way to leak out through a normal import.
3. The module's own initialization code — in the `Stack` example, setting `top := 0` before any other part of the program could possibly call `Push` or `Pop` against an uninitialized stack.
4. `FROM Stack IMPORT Push;` imports the name directly, usable unqualified; `IMPORT Stack;` imports the whole module, requiring `Stack.Push` everywhere it's used. The qualified form is specifically useful when two imported modules might export a same-named identifier, or when explicitly showing a procedure's origin at each call site is valuable.
5. That it's consistently cited, across independent histories of the language, as Modula-2's single most influential structural contribution — with a real, traceable lineage running through Ada's package system and into the module systems of many later languages, not just a locally useful feature that stayed contained to Modula-2 itself.
