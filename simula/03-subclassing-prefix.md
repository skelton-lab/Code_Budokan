# Module 3 — Subclassing and Prefix Classes

Simula's inheritance syntax looks genuinely different from every later language in this series — worth seeing in its original form before you meet the `:`/`extends`/`<` conventions that replaced it. Documented, not executed.

## Prefix classes

**You'll be able to:** read a Simula prefix-class declaration and state what it inherits.

**Concept, documented:**

Simula 67 expresses "class `B` inherits from class `A`" by writing `A class B` — the superclass name is written as a **prefix** directly in front of the subclass's own `class` declaration, rather than a separate keyword like `extends` or a symbol like `:`. Conceptually, this "prefixing" is close to literally true: `B`'s block body is treated as attached after `A`'s block body within the same object — an instance of `B` genuinely contains everything `A` declared, plus whatever `B` itself adds.

**Example, documented (not executed):**

```simula
Point Class ColorPoint;
Begin
   Text color;

   Procedure setColor(c); Text c;
      color :- c;
End ColorPoint;
```

Read this as: "`ColorPoint`, prefixed by `Point`." An instance of `ColorPoint` has everything Module 2's `Point` declared (`x`, `y`, `move`) **plus** `ColorPoint`'s own addition (`color`, `setColor`). This is the identical relationship C++'s `class ColorPoint : public Point { ... }` expresses — same concept, a genuinely different-looking syntax for stating it.

> **Pitfall, worth being precise about:** the "prefix" terminology isn't just a naming quirk — it reflects how Simula's designers actually thought about the mechanism: not "B is a specialized kind of A" (the framing most later languages' `extends`/`:` syntax emphasizes) but "B is A, with something prefixed onto it" — a subtly different mental model, closer to literal textual/structural composition than to a taxonomic "is-a" statement. Both framings describe the same resulting behavior; which one a language's syntax emphasizes shapes how programmers tend to talk and think about their own class hierarchies.

**Practice**

- Write out, by hand, a `Machine class Robot` prefix declaration analogous to `Point class ColorPoint` above, adding one field and one procedure to whatever you imagine a base `Machine` class declaring.
- Compare this prefix syntax directly against C++'s `class Robot : public Machine { ... }` (your own C++ guide) and Ruby's `class Robot < Machine` (your own Ruby guide) — three genuinely different syntaxes for stating the identical relationship.

## Progress check

1. How does Simula express "class `B` inherits from class `A`," syntactically?
2. What does "prefix" mean here, concretely, about how `B`'s and `A`'s block bodies relate?
3. What C++ syntax expresses the identical relationship as `Point class ColorPoint`?
4. What subtly different mental model does "prefix" framing emphasize, compared to "is-a"/`extends` framing — even though both describe the same resulting behavior?

### Answers

1. By writing the superclass name directly in front of the subclass's own `class` declaration — `A class B`, not a separate `extends`-style keyword.
2. `B`'s block body is treated as attached after `A`'s within the same object — an instance of `B` contains everything `A` declared, plus whatever `B` itself adds, structurally rather than through a separate inheritance mechanism layered on top.
3. `class ColorPoint : public Point { ... }`.
4. "Prefix" framing emphasizes structural/textual composition ("B is A, with something added onto it"); "is-a"/`extends` framing emphasizes taxonomic specialization ("B is a specialized kind of A"). Both produce the same inheritance behavior, but the syntax a language chooses shapes how its programmers tend to describe and reason about their own class hierarchies.
