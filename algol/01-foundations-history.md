# Module 1 — Foundations & Historical Context

Why a 1960 language specification is worth your time in 2026, what "stropping" means and why it explains a real error you'll hit immediately, and your first verified program.

## Why ALGOL matters

**You'll be able to:** name ALGOL 60's three most consequential contributions to every language you've used in this series so far.

**Concept**

The 1960 "Report on the Algorithmic Language ALGOL 60" did three things that changed programming language design permanently:

1. **It was the first major language specification formally written in Backus-Naur Form (BNF)** — a precise, unambiguous grammar notation, named for two of the report's own authors (John Backus, who'd also led the original Fortran project, and Peter Naur, who edited the ALGOL 60 report). Virtually every language specification since — including every language in this series — describes its grammar using BNF or a direct descendant of it.
2. **It introduced block structure with lexical scoping** — nested `begin...end` blocks, each able to declare its own local variables invisible outside the block, with inner blocks able to see (and shadow) outer ones. This is the direct ancestor of C's `{ }` scoping (and, downstream of C, C++'s and JavaScript's block scoping too) — verified directly in Module 2.
3. **It supported genuine recursion as a fundamental feature.** Fortran, ALGOL 60's contemporary, originally could not — its static, compile-time memory allocation model had no notion of a call stack deep enough to support a procedure calling itself. ALGOL 60's block structure came with dynamic (stack-based) storage allocation for local variables, which recursion needs to work at all — verified directly in Module 3.

**Practice**

- Before continuing, name one place each of these three ideas shows up in a language you've already studied in this series (Fortran, C, or JavaScript are all good targets).

## Stropping: why `begin` isn't `BEGIN`

**You'll be able to:** explain what stropping is, and why it's the reason this guide's own toolchain rejected lowercase keywords.

**Concept**

ALGOL was designed in an era of print technology and character sets far more limited than what you're reading this on — many systems of the time had no lowercase letters, no bold or italic type, at all. The ALGOL 60 report itself was typeset with reserved words in **bold** (`begin`, **in bold**, in the printed report) to distinguish them from identifiers — but a plain-text transcription on a teletype or card punch had no way to represent bold type. **Stropping** is the general term for whatever convention a specific implementation used to mark reserved words in plain text instead: some used single quotes (`'begin'`), some used a special character prefix, and some — including this guide's own `a68g` — default to plain UPPERCASE.

**Example, verified:**

```algol68
BEGIN
   print(("Hello, ALGOL!", newline))
END
```

Verified: this runs correctly under `a68g` and prints `Hello, ALGOL!`. The exact same program with lowercase `begin`/`end` (matching how you'd read it in most textbooks and historical documents, which typically render the original bold-stropped convention as plain lowercase) fails to parse at all under this guide's toolchain, with a genuinely unhelpful error message — this isn't a bug in your code, it's a stropping-convention mismatch between what you're reading and what this specific interpreter expects by default.

> **Pitfall, discovered directly while building this guide:** running `a68g` on a lowercase `begin...end` program produces `a68g: syntax error: possibly a missing or incorrect symbol nearby` — a genuinely misleading message that gives no hint the actual problem is stropping convention, not real syntax. Every code example in this guide uses uppercase reserved words for exactly this reason: it's what actually runs.

**Practice**

- Try running a lowercase version of the hello-world example yourself and read the (unhelpful) error message directly — this is worth experiencing once so the fix (uppercase keywords) is memorable.
- Look up `a68g --boldstropping` in its help output and note, without necessarily using it, what alternate stropping mode it offers.

## Your first program

**You'll be able to:** compile and run a minimal ALGOL 68 program, and read its default numeric output formatting.

**Example**

```algol68
BEGIN
   INT x := 42;
   print(("x = ", x, newline))
END
```

Verified: prints `x =         +42` — note the leading `+` sign and the padding spaces. `a68g`'s default output format for `INT` values reserves fixed-width space and always shows the sign explicitly; this is a real, observable default, not a formatting mistake in the example.

**Practice**

- Run this yourself and confirm the exact spacing and sign — get used to reading it before Module 3's recursion examples show larger numbers.
- Declare an integer with a negative value and confirm the sign changes correctly, with the same padding.

## Progress check

1. What does BNF stand for, and why does its origin trace specifically to ALGOL 60?
2. Why couldn't original Fortran support recursion, while ALGOL 60 could?
3. What is "stropping," and why did it need to exist at all?
4. What's this guide's specific stropping convention, and what happens if you use the "textbook" lowercase convention instead?
5. What does `a68g` print for `INT x := 42; print(("x = ", x, newline))`, exactly, and what two formatting details are worth noting?

### Answers

1. Backus-Naur Form — named for John Backus and Peter Naur, two of the authors of the 1960 ALGOL 60 report, which was the first major language specification to formally describe its grammar this way.
2. Fortran's original memory model allocated storage for variables statically, at compile time, with no call stack deep enough to support a procedure calling itself with fresh storage each time. ALGOL 60's block structure came with dynamic, stack-based storage allocation for local variables, which recursion requires.
3. The convention an implementation uses to mark reserved words in plain text, standing in for the bold typeface the original ALGOL 60 report used — necessary because early systems and plain-text transcriptions had no way to represent bold type directly.
4. Uppercase keywords (`BEGIN`, `END`) — the default stropping mode for `a68g`. Using lowercase (`begin`, `end`), the convention most textbooks render, produces a genuinely unhelpful syntax error that doesn't identify the real cause.
5. `x =         +42` — a leading `+` sign is always shown explicitly, and the value is padded to a fixed field width, both defaults of `a68g`'s numeric output formatting.
