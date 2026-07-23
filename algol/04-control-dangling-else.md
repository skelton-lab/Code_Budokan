# Module 4 — Control Structures and the Dangling-Else Problem

`FOR` loops and `IF`/`THEN`/`ELSE`, verified — and one of the most-cited examples in all of programming language history, where ALGOL 60's own grammar had a real ambiguity that ALGOL 68 fixed within the same language family, verified directly as a contrast.

## `FOR` loops, verified

**You'll be able to:** write a counted loop and read its result.

**Example**

```algol68
BEGIN
   FOR i FROM 1 TO 5 DO
      print((i, " "))
   OD
END
```

Verified: prints `+1 +2 +3 +4 +5` (with `a68g`'s usual sign-and-padding formatting). `OD` — "DO spelled backward" — closes the loop, the same closing-keyword convention `FI` uses for `IF` (below). This mandatory-closing-keyword style is one of ALGOL 68's clearest, most influential departures from ALGOL 60, and it's what resolves this module's central historical example.

**Practice**

- Change the loop to count down (`FOR i FROM 5 TO 1 BY -1 DO ...`) and confirm it runs in reverse.

## The dangling-else problem — documented, ALGOL 60's actual ambiguity

**You'll be able to:** state the dangling-else problem precisely, and explain why it's one of the most-cited examples in programming language history.

**Concept, documented from the 1960 ALGOL 60 Report and standard programming-language-theory sources (not executed — this requires the grammar this guide cannot run):**

ALGOL 60's conditional statement grammar, written the naive way, is genuinely ambiguous:

```
if a then if b then S1 else S2
```

Does `else S2` belong to the **inner** `if b`, or the **outer** `if a`? Both are grammatically plausible parses of the same text. ALGOL 60's official report resolved this with a specific supplementary grammar rule — `else` binds to the *nearest* unmatched `if` (here, the inner one) — but the underlying grammar shape is ambiguous enough, and easy enough for a human reader (or, historically, an inconsistent early compiler) to misjudge, that this exact example became the canonical, named illustration of what compiler theory now calls **"the dangling-else problem"** — cited in essentially every textbook on parsing and language grammar design since.

> **This is worth sitting with, not just memorizing:** the problem isn't that ALGOL 60 left this undefined — the report did specify a resolution. The problem is that the *grammar itself*, read naively, doesn't make the resolution obvious from the structure alone — you need an extra rule bolted on to disambiguate what visually looks like it could go either way. That gap between "the spec technically resolves this" and "a human reading the code can immediately see how" is exactly what later language designs tried to close structurally instead of by convention.

## ALGOL 68's fix — verified directly

**You'll be able to:** explain, with a working example, how ALGOL 68 eliminated this ambiguity entirely rather than just resolving it by convention.

**Concept**

ALGOL 68 requires **every** `IF` to be closed with its own `FI` (and every `FOR`/`DO` with `OD`, every `CASE` with `ESAC`, and so on). This isn't just tidier syntax — it makes the dangling-else shape **impossible to even write ambiguously**: each `IF` structurally owns exactly one matching `FI`, so there is no textual position where an `ELSE` could plausibly belong to more than one `IF`.

**Example, verified:**

```algol68
BEGIN
   INT x := 5, y := 20;
   IF x > 1 THEN
      IF y > 10 THEN
         print(("both true", newline))
      ELSE
         print(("this else binds to the INNER if", newline))
      FI
   FI
END
```

Verified: prints `both true` — and critically, notice the structure required to write this at all: the inner `IF y > 10 THEN ... ELSE ... FI` is a **complete, self-contained, closed unit**, nested inside the outer `IF x > 1 THEN ... FI`. There's no way to write ALGOL 60's ambiguous shape in ALGOL 68 syntax in the first place — you'd have to explicitly choose, via where you place each `FI`, which `IF` any given `ELSE` belongs to, and that choice is visible directly in the text rather than resolved by an external convention.

> **This is language evolution within one family, shown directly rather than asserted:** ALGOL 68's mandatory closing keywords are a direct response to exactly this class of problem. The same convention shows up, in different spellings, in many later languages that prioritize this kind of structural clarity — worth watching for as you continue through this series.

**Practice**

- Try to write ALGOL 60's original ambiguous shape in ALGOL 68 syntax and observe that the mandatory `FI` placement forces you to make the binding explicit before the program can even parse.
- Look up how C resolves the identical ambiguity (C's grammar has the same naive shape ALGOL 60 did) — C went a different direction than ALGOL 68's mandatory-closer approach, worth comparing once you reach the C guide's control-flow module.

## Progress check

1. What's genuinely ambiguous about the naive `if a then if b then S1 else S2` grammar shape?
2. How did ALGOL 60's actual report resolve this ambiguity, and why did the problem become famous anyway despite being formally resolved?
3. What specific ALGOL 68 syntax feature makes the ambiguous shape impossible to write at all?
4. What does `OD` stand for, structurally, and what earlier-verified keyword does it parallel?
5. Why is this example described as "language evolution within one family" rather than just "ALGOL 68 fixed a bug"?

### Answers

1. `else S2` could plausibly belong to either the inner `if b` or the outer `if a` — the grammar, read naively, supports two different parse trees for the identical text.
2. The report specified that `else` binds to the nearest (innermost) unmatched `if` — a real, formal resolution. It became famous anyway because the underlying grammar shape doesn't make that resolution visually obvious to a human reader (or, historically, to every compiler implementation), making it the canonical teaching example of grammar ambiguities requiring an external disambiguating rule.
3. Mandatory closing keywords — every `IF` must be closed with its own `FI` — which means each conditional is a structurally complete, self-contained unit; there's no textual position where an `ELSE` could ambiguously belong to more than one `IF`.
4. "DO" spelled backward — it closes a `FOR...DO` loop, exactly paralleling how `FI` ("IF" spelled backward) closes an `IF`.
5. Because both are genuinely part of the same ALGOL lineage — ALGOL 68 isn't an unrelated language that happened to avoid the problem, it's ALGOL 60's own direct successor, deliberately changing its syntax specifically in response to problems (this one included) identified in the earlier standard.
