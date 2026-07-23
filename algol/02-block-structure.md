# Module 2 — Block Structure and Lexical Scoping

The single most consequential idea in this whole guide: nested `BEGIN...END` blocks, each with its own local variables, invisible outside the block. Every `{ }` scope in every language in this series descends directly from this. Verified.

## Nested blocks and shadowing

**You'll be able to:** declare a variable local to a block, and predict exactly what happens when an inner block declares another variable with the same name.

**Concept**

A `BEGIN...END` pair is a block — it can declare its own local variables, and those variables cease to exist the moment the block ends. A block nested inside another can declare a variable with the *same name* as one in the outer block; inside the inner block, the inner declaration **shadows** the outer one completely, and the outer variable is untouched once the inner block ends. This is exactly the scoping rule every C-family `{ }` block still uses today.

**Example**

```algol68
BEGIN
   INT x := 10;
   print(("outer x = ", x, newline));
   BEGIN
      INT x := 99;
      print(("inner x = ", x, newline))
   END;
   print(("outer x still = ", x, newline))
END
```

Verified — the exact output:
```
outer x =         +10
inner x =         +99
outer x still =         +10
```

The inner block's `x` is a completely distinct variable that happens to share a name — assigning to it, or in this case just declaring and reading it, has zero effect on the outer `x`, which reports `+10` again the instant the inner block ends. This is precisely the behavior you'd get from the equivalent nested `{ }` blocks in C, C++, or JavaScript — because those languages inherited this exact rule from here.

> **Pitfall, worth internalizing precisely because it's so foundational:** shadowing means the *name* `x` refers to different storage depending on which block's scope you're reading the reference from — the compiler (or, here, the interpreter) resolves this purely lexically, based on where in the source text the reference appears, not based on anything about runtime call history. This is "lexical scoping," and it's worth distinguishing from dynamic scoping (where a name resolves based on the call chain at runtime) — ALGOL 60 committed the language-design world to the lexical version, which is why every mainstream language since works this way, and dynamic scoping is now a rarity worth knowing exists rather than something you'll meet often.

> **Where this block goes next, if you're following this series' sequencing:** the `simula/` guide's own Module 2 picks up exactly this `BEGIN...END` block and asks one question — what if a block's local state didn't have to disappear the instant the block ends, but could persist and be referenced later? That single change is Simula's entire contribution to language design, and it reads as a direct, one-step extension of what you just verified here, not a new idea arriving from nowhere.

**Practice**

- Add a third level of nesting, each declaring its own `x`, and confirm each level correctly reports its own value while the outer ones remain untouched.
- Declare a variable in an outer block and *read* (not shadow) it from an inner block that declares no variable of the same name — confirm the inner block can see the outer variable directly, since nothing is hiding it.

## Progress check

1. What happens to a block's local variables the moment the block ends?
2. What does "shadowing" mean, precisely, when an inner block declares a variable with the same name as an outer one?
3. Does modifying an inner-block variable ever affect an outer-block variable of the same name? Why or why not?
4. What's the difference between lexical scoping (what ALGOL 60 established) and dynamic scoping?
5. Name two languages in this series whose block-scoping rules descend directly from what's verified in this module.

### Answers

1. They cease to exist — the storage allocated for them is released, and the names are no longer valid to reference.
2. The inner declaration creates a completely distinct variable that happens to share a name with the outer one; within the inner block, any reference to that name resolves to the inner variable, not the outer one.
3. No — they're genuinely separate storage locations. The inner variable is a distinct entity; changes to it have no effect on the outer variable of the same name, which is exactly as it was before the inner block ran.
4. Lexical scoping resolves a name based on where in the source text the reference appears (nesting structure, known at compile/parse time). Dynamic scoping would resolve a name based on the actual runtime call chain leading to that point — a rarer, different approach essentially no mainstream language uses today, precisely because ALGOL established the lexical convention so early and so influentially.
5. C's `{ }` block scoping, and downstream of C, C++'s and JavaScript's own block scoping — both descend directly from the `BEGIN...END` rule verified in this module.
