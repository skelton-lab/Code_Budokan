# Module 3 — Opaque Types and Information Hiding

Module 2's `Stack` example exposed its internal array to anyone willing to look inside the implementation module — real, but incomplete hiding. Modula-2's **opaque types** close that gap entirely: a definition module can export a type's *name*, usable everywhere, while the type's actual structure remains known only inside its own implementation module. Documented throughout — see `00-overview.md`'s toolchain note.

## Declaring a type without revealing its shape

**You'll be able to:** declare an opaque type in a definition module, and explain precisely what a caller can and cannot do with it.

**Concept, documented:**

`TYPE StackPtr;` in a definition module — with no further detail — declares that `StackPtr` exists as a type, usable in variable declarations and procedure signatures elsewhere, without saying anything about what it actually *is*. The corresponding implementation module supplies the real definition (almost always `POINTER TO` some record type), invisible to anyone who only sees the definition module.

**Example, documented (not executed — see the overview's toolchain note):**

```modula2
DEFINITION MODULE Stack;

  TYPE StackPtr;  (* opaque: callers know this type exists, not what it contains *)

  PROCEDURE Create(): StackPtr;
  PROCEDURE Push(s: StackPtr; item: INTEGER);
  PROCEDURE Pop(s: StackPtr): INTEGER;
  PROCEDURE IsEmpty(s: StackPtr): BOOLEAN;

END Stack.
```

```modula2
IMPLEMENTATION MODULE Stack;

  TYPE
    Node = POINTER TO NodeRec;
    NodeRec = RECORD
      value: INTEGER;
      next: Node;
    END;
    StackPtr = POINTER TO StackRec;  (* the real definition, hidden from callers *)
    StackRec = RECORD
      top: Node;
    END;

  PROCEDURE Create(): StackPtr;
  VAR s: StackPtr;
  BEGIN
    NEW(s);
    s^.top := NIL;
    RETURN s;
  END Create;

  PROCEDURE Push(s: StackPtr; item: INTEGER);
  VAR n: Node;
  BEGIN
    NEW(n);
    n^.value := item;
    n^.next := s^.top;
    s^.top := n;
  END Push;

  PROCEDURE Pop(s: StackPtr): INTEGER;
  VAR n: Node; v: INTEGER;
  BEGIN
    n := s^.top;
    v := n^.value;
    s^.top := n^.next;
    RETURN v;
  END Pop;

  PROCEDURE IsEmpty(s: StackPtr): BOOLEAN;
  BEGIN
    RETURN s^.top = NIL;
  END IsEmpty;

END Stack.
```

A caller can declare `var s: StackPtr;`, call `s := Create()`, and call `Push(s, 10)` — all without ever knowing `StackPtr` is a pointer to a linked-list-backed record at all. It could be re-implemented tomorrow as an array-backed stack instead, and every caller's code would keep working unchanged, since nothing outside `Stack`'s own implementation module ever depended on the actual representation.

> **Historically well-corroborated:** this specific mechanism — exporting a type name while hiding its representation entirely, enforced by the compiler rather than by convention — is consistently cited across independent language histories as a genuine, early instance of what's now called an **abstract data type**, predating mainstream object-oriented encapsulation as commonly practiced. `pascal/`'s own records (`pascal/04-records-enums-subranges.md`) had no equivalent — a Pascal record's fields are always visible to anything that can see the type at all.

**Practice**

- Explain, precisely, why `pascal/`'s records could never achieve this same guarantee, even in principle, without Modula-2's separate definition/implementation module split — what's missing from Pascal's model that opaque types specifically require?

## The trade-off: what a caller can't do with an opaque type

**You'll be able to:** state the real limitation opaque types impose, not just their benefit.

**Concept, documented:**

Because a caller genuinely doesn't know `StackPtr`'s actual structure, it can only interact with a `StackPtr` value through the procedures the definition module explicitly provides (`Create`, `Push`, `Pop`, `IsEmpty`) — no direct field access, no way to inspect or construct one by hand. This is the entire point (an implementation can change freely without breaking callers), but it's also a genuine constraint: every operation a caller might ever need on a `StackPtr` has to be anticipated and exported by the module's own author, or it simply isn't possible from outside.

> **Pitfall:** a definition module that under-exports (forgetting a genuinely useful operation, like a `Size` procedure reporting how many elements are on the stack) leaves callers with no recourse except to ask the module's author to add it — there's no equivalent of reaching in and inspecting the hidden fields directly as an escape hatch, the way a Pascal record's always-visible fields would at least allow, awkwardly, if a genuinely needed capability was missing from a more disciplined interface.

**Practice**

- Add a `Size(s: StackPtr): INTEGER` procedure to both the definition and implementation modules above, deciding what additional hidden state (beyond `top`) the implementation module needs to track it efficiently, without a full traversal on every call.

## Progress check

1. What does `TYPE StackPtr;` (with nothing after the semicolon) declare in a definition module?
2. Why can a caller use `Create()`, `Push()`, and `Pop()` on a `StackPtr` value without ever knowing it's backed by a linked list?
3. What specific advantage does this give a module's author, verified by reasoning about what would happen if the implementation changed to an array-backed stack instead?
4. What's the real constraint opaque types impose on callers, beyond "you can't see the fields"?
5. Why does this module's mechanism go further than what a Pascal record could achieve, even in principle?

### Answers

1. That a type named `StackPtr` exists and can be used in variable declarations, parameters, and return types elsewhere — without specifying anything about what the type actually contains; the real definition is supplied separately, in the corresponding implementation module.
2. Because every operation on a `StackPtr` is performed through procedures the definition module explicitly exports, none of which require the caller to know or access the type's actual internal structure directly.
3. The module's author can freely change the internal representation (linked list to array, or any other structure) without breaking any caller's code, since no caller ever depended on the specific representation — only on the exported procedure signatures, which haven't changed.
4. A caller can only do what the definition module's exported procedures allow — there's no way to inspect, construct, or manipulate the hidden internal structure directly, even if a caller has a genuine, reasonable need the module's author simply didn't anticipate and export.
5. Because a Pascal record's fields are always visible to anything that can see the record type at all — Pascal has no separate "public interface" versus "private implementation" split for a single type; Modula-2's definition/implementation module boundary is what makes true opacity possible, compiler-enforced rather than left to convention.
