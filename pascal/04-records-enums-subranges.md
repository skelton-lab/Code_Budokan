# Module 4 — Records, Enumerated Types, and Subrange Types

Pascal's strong-typing discipline (Module 1's promise) gets real teeth here — enumerated types give a variable a genuinely restricted, named set of legal values, and subrange types restrict an ordinal type to a smaller span. Verifying exactly how much protection they provide turned up a real, precise, easy-to-miss gap. Every example below is a real, verified `fpc` compile-and-run. Feeds Capstone 2.

## Records: grouping related fields

**You'll be able to:** declare a record type and access its fields with dot notation.

**Concept**

A `record` groups named fields of potentially different types under one type name — Pascal's direct equivalent of a C `struct`, and (worth flagging ahead of time, since it's exactly what Simula's guide covers next in this series' resequenced order) structurally the same shape Simula's classes will extend with procedures attached.

**Example**

```pascal
type
  Contact = record
    name: string;
    age: integer;
  end;

var
  c: Contact;
begin
  c.name := 'Ada';
  c.age := 36;
  writeln(c.name, ', age ', c.age);
end.
```

Verified: `Ada, age 36` — dot notation reads and writes each field directly, exactly as it looks.

**Practice**

- Declare a second `Contact` variable, copy the first into it with a single assignment (`c2 := c;`, no per-field copying needed), and confirm both hold identical, independent values afterward.

## Enumerated types: a genuinely restricted set of values

**You'll be able to:** declare an enumerated type and use `Ord` to get a value's underlying position.

**Concept**

`type Weekday = (Mon, Tue, Wed, Thu, Fri, Sat, Sun);` declares seven named values and nothing else — a `Weekday` variable can only ever hold one of those seven identifiers, checked at compile time for anything the compiler can determine statically. `Ord(value)` returns a value's zero-based position in its declaration.

**Example**

```pascal
type
  Weekday = (Mon, Tue, Wed, Thu, Fri, Sat, Sun);
var
  d: Weekday;
begin
  d := Wed;
  writeln('ord: ', Ord(d));
end.
```

Verified: `ord: 2` — `Mon` is `0`, `Tue` is `1`, `Wed` is `2`, matching declaration order exactly.

**Practice**

- Predict, then verify, what `Ord(Sun)` reports, given the declaration order above.

## Subrange types: a real, precise gap between compile-time and runtime checking

**You'll be able to:** declare a subrange type, and know exactly when Pascal actually enforces it.

**Concept**

`type WorkDay = Mon..Fri;` restricts a type to a contiguous span of an existing ordinal type's values. This looks like it should make an out-of-range assignment impossible — verified directly, that's only true at **compile time**, for values the compiler can determine as constants.

**Example — a compile-time-constant violation, caught immediately:**

```pascal
var
  w: WorkDay;
begin
  w := Sat;   { Sat is outside Mon..Fri }
end.
```

Verified: `Error: range check error while evaluating constants (5 must be between 0 and 4)` — caught at compile time, before the program ever runs, because `Sat` is a literal constant the compiler can check directly.

**Example — the identical violation through a variable, verified to silently succeed by default:**

```pascal
var
  w: WorkDay;
  full: Weekday;
begin
  full := Sat;
  w := full;
  writeln('assigned Sat into WorkDay without error, ord = ', Ord(w));
end.
```

Verified with plain `fpc records2.pas`: **`assigned Sat into WorkDay without error, ord = 5`** — no error, no warning, despite `5` genuinely being outside `WorkDay`'s declared `0..4` range. The subrange type provided **zero** protection here, because the out-of-range value arrived through a variable, not a literal constant, and Free Pascal does not enable runtime range checking by default.

**The fix, verified directly:**

```bash
fpc -Cr records2.pas
```

Verified: the *identical* source now produces `Runtime error 201 at ...` — a genuine runtime range check, only present because `-Cr` was passed explicitly.

> **Pitfall, genuinely important and easy to miss:** a subrange type reads as a strong, always-enforced compile-time guarantee — Module 1 explicitly framed Pascal's typing discipline as "catching more mistakes at compile time." Verified directly, that framing is only fully true for constants; runtime violations through ordinary variable assignment are silently allowed unless `-Cr` is passed at compile time. Real Pascal projects that actually rely on subrange types for correctness need `-Cr` (or the equivalent in whatever build configuration they use) turned on deliberately — it is not free, and it is not the default.

**Practice**

- Confirm directly that a compile-time-constant subrange violation is still caught even *without* `-Cr` — is the constant-checking behavior itself affected by the flag at all, or is it strictly the runtime check that `-Cr` adds?
- Add `-Cr` to Capstone 1's build and confirm all of its existing behavior is unaffected — `-Cr` should only matter the moment an actual out-of-range assignment is attempted, which nothing in that capstone does.

## Progress check

1. What's the direct structural parallel between a Pascal `record` and something covered in an earlier guide in this series?
2. What does `Ord` return for an enumerated-type value, and what determines the specific number it returns?
3. Why did assigning `Sat` directly to a `WorkDay` variable get caught at compile time, while assigning it through an intermediate `Weekday` variable did not, by default?
4. What specific compiler flag closes that gap, and what did it change about the exact same program's behavior?
5. Why is "subrange types are strongly enforced" not quite an accurate blanket claim about Pascal, based on what this module verified directly?

### Answers

1. A C `struct` — both group named fields of potentially different types under one type name, accessed via dot notation.
2. `Ord` returns the value's zero-based position in its type's declaration order — `Mon` is `0`, and each subsequent name increments by one, verified directly with `Wed` reporting `2`.
3. Because the first case (`w := Sat`) involves a literal constant the compiler can check directly against the subrange's bounds at compile time; the second case assigns through a variable (`full`) whose actual runtime value isn't known until the program executes, and Free Pascal does not check that by default.
4. `-Cr`, which enables runtime range checking — verified directly, the identical program that silently produced an out-of-range value without `-Cr` instead raised `Runtime error 201` with it.
5. Because enforcement depends entirely on whether the out-of-range value is a compile-time constant (always checked) or arrives through a runtime value like a variable (only checked if `-Cr` is explicitly enabled) — verified directly with the identical logical violation behaving completely differently depending on which of the two applied, and on one specific compiler flag.
