# Module 4 — Low-Level Systems Programming: the `SYSTEM` Module

What actually let Modula-2 write Lilith's operating system, unlike Pascal: a special, always-available pseudo-module named `SYSTEM`, exporting exactly the low-level, type-unsafe facilities a systems program genuinely needs — direct memory addresses, raw machine words, and explicit type-punning — deliberately walled off behind one clearly-named import, not scattered through the ordinary language. Documented throughout — see `00-overview.md`'s toolchain note.

## `ADDRESS`, `ADR`, and direct memory access

**You'll be able to:** explain what `SYSTEM.ADDRESS` and `SYSTEM.ADR` are for, and why they exist as a deliberately separate, opt-in facility.

**Concept, documented:**

`SYSTEM` exports `ADDRESS` — a type representing a raw machine address, with none of Modula-2's ordinary type safety attached to it — and `ADR(variable)`, a function returning the actual memory address of any variable. Together, these let a program read or write memory directly, the exact capability a real operating system's device drivers and memory manager genuinely need, and the exact capability Pascal (and ordinary Modula-2 code, outside `SYSTEM`) deliberately doesn't provide.

**Example, documented (not executed — see the overview's toolchain note):**

```modula2
MODULE MemoryPeek;

FROM SYSTEM IMPORT ADDRESS, ADR;
FROM InOut IMPORT WriteCard, WriteLn;

VAR
  x: CARDINAL;
  addr: ADDRESS;

BEGIN
  x := 42;
  addr := ADR(x);
  WriteCard(CARDINAL(addr), 10);
  WriteLn;
END MemoryPeek.
```

`ADR(x)` returns `x`'s actual address in memory — the same kind of value C's `&x` produces, but reachable in Modula-2 only through this one, explicitly-imported module, never as an ordinary operator available everywhere.

> **Historically well-corroborated:** this design — walling off every genuinely unsafe, machine-dependent capability behind one specifically-named, must-be-imported module — is documented directly as a deliberate design decision distinguishing Modula-2 from languages (like C) where pointer manipulation and address-taking are ordinary, unmarked operations available throughout the entire language. Needing to write `FROM SYSTEM IMPORT ADDRESS, ADR;` at the top of a file is a visible, textual signal: *this specific file does unsafe, machine-level things,* readable at a glance by anyone reviewing the code, in a way `pascal/08-pointers-dynamic-structures.md`'s ordinary typed pointers never needed to be flagged.

**Practice**

- Explain, in your own words, why requiring an explicit `FROM SYSTEM IMPORT ...` is a meaningfully different design decision from simply *documenting* that a language feature is dangerous and hoping programmers notice — what does the explicit import buy that documentation alone doesn't?

## `WORD` and type-punning via `CAST`

**You'll be able to:** explain what `SYSTEM.WORD` represents, and what `CAST` lets a program do that ordinary Modula-2 typing forbids.

**Concept, documented:**

`WORD` represents one raw machine word — a fixed-size chunk of memory with no type attached to its contents at all, the lowest-level way to talk about "some bits" without saying what they mean. `CAST(TargetType, value)` reinterprets a value's bit pattern as a different type entirely, bypassing Modula-2's ordinary compile-time type checking (the same discipline `pascal/08-pointers-dynamic-structures.md` verified rejects a plain `IntPtr`-to-`RealPtr` assignment outright).

**Example, documented:**

```modula2
MODULE TypePunning;

FROM SYSTEM IMPORT WORD, CAST;
FROM InOut IMPORT WriteReal, WriteLn;

VAR
  bits: WORD;
  asReal: REAL;

BEGIN
  bits := (* some raw bit pattern obtained elsewhere *);
  asReal := CAST(REAL, bits);
  WriteReal(asReal, 10);
  WriteLn;
END TypePunning.
```

`CAST` doesn't convert a value the way Modula-2's ordinary arithmetic conversions would (an `INTEGER` becoming a `REAL` with its actual numeric value preserved) — it reinterprets the *same bits* as if they were a different type, which is exactly what a device driver reading a hardware register's raw contents, or a memory manager treating a block of storage as different types at different times, genuinely needs to do.

> **Pitfall, worth being precise about since it's the entire reason `SYSTEM` is walled off the way it is:** `CAST`, used incorrectly, produces a value that's simply garbage from the new type's own perspective — there's no runtime check verifying the reinterpreted bits actually make sense as the target type, unlike ordinary Modula-2 assignments, which the compiler checks rigorously. This is a deliberate, documented trade-off: `SYSTEM`'s facilities exist specifically because some real, low-level tasks cannot be expressed any other way, at the acknowledged cost of losing every safety guarantee the rest of the language otherwise provides.

**Practice**

- Compare `CAST` directly against `pascal/08-pointers-dynamic-structures.md`'s verified finding that Free Pascal's default mode allows pointer arithmetic (an extension beyond the ISO standard) — both are cases of a "standard, safe" language providing a real, if dangerous, low-level escape hatch; what's the structural difference between Modula-2 walling this off behind an explicit `SYSTEM` import versus FPC simply allowing it by default in ordinary code with no special import required?

## Progress check

1. What does `SYSTEM.ADR(x)` return, and what's the closest equivalent in a language covered earlier in this series?
2. Why does needing `FROM SYSTEM IMPORT ...` at the top of a file matter as a readability and safety signal, beyond just enabling the feature?
3. What does `CAST(TargetType, value)` do, precisely, that an ordinary Modula-2 type conversion does not?
4. What real, documented risk does `CAST` carry that ordinary Modula-2 assignments don't?
5. What's the structural difference between how Modula-2 exposes low-level, unsafe operations and how Free Pascal's default mode exposes pointer arithmetic, per this module's own comparison?

### Answers

1. The actual memory address of the variable `x` — the closest earlier equivalent is C's `&x` operator, though C's address-of operator is an ordinary, always-available part of the language, unlike Modula-2's `ADR`, which requires an explicit `SYSTEM` import first.
2. Because it's a visible, textual marker that a specific file uses genuinely unsafe, machine-dependent operations — readable at a glance during a code review, rather than relying on every reader independently knowing (or remembering) which operations happen to be dangerous.
3. It reinterprets a value's existing bit pattern as a different type, with no actual conversion of the underlying data — unlike an ordinary conversion (say, `INTEGER` to `REAL`), which changes the actual bits to represent the equivalent value in the new type.
4. There's no runtime check verifying the reinterpreted bits make sense as the target type at all — a misused `CAST` can produce a value that's simply garbage from the new type's perspective, with nothing in the language catching it.
5. Modula-2 requires an explicit, separately-imported module (`SYSTEM`) before any of these unsafe operations become available at all — a deliberate, structural wall between ordinary and unsafe code. Free Pascal's default mode allows pointer arithmetic as an ordinary, unmarked part of the language with no special import required at all, only rejected under the separately-invoked `-Miso` strict mode — a looser default than Modula-2's deliberately walled-off approach.
