# Module 1 — Foundations: What Wirth Changed

Niklaus Wirth sat on the IFIP working group that designed ALGOL 68 — and disagreed with where it was heading. Before ALGOL 68 was finalized, he and C.A.R. Hoare had already proposed a deliberately smaller alternative, ALGOL W; when the committee chose ALGOL 68's greater complexity instead, Wirth went on to design Pascal (1970) independently, building on ALGOL W's ideas: strict block structure kept, but with stronger typing and a smaller, more teachable core. Every example below is a real, verified `fpc` compile-and-run. Feeds Capstone 1.

## The program skeleton

**You'll be able to:** write a minimal Pascal program, and explain the one punctuation detail that trips up everyone coming from ALGOL or C.

**Concept**

`algol/02-block-structure.md` already established `begin...end` block structure — Pascal keeps it completely unchanged. What's new is the outer shape: a Pascal source file is one `program` header, declarations, and a single `begin...end.` block — and that final `end` is followed by a **period**, not a semicolon, marking the end of the entire program specifically (every other `end` in a Pascal program is followed by a semicolon, or nothing, before an `else`).

**Example**

```pascal
program Foundations;
const
  Greeting = 'Hello';
var
  name: string;
begin
  name := 'Pascal';
  writeln(Greeting, ', ', name, '!');
end.
```

Verified: `Hello, Pascal!` — `const` declares a genuinely immutable name (`Greeting`, never reassignable), `var` declares a mutable one (`name`), and both live in their own separate declaration sections before the executable `begin...end.` block — a stricter separation than ALGOL's, where declarations and executable statements can interleave more freely within a block.

> **Pitfall, verified directly:** omitting the final period —
> ```pascal
> program NoPeriod;
> begin
>   writeln('test')
> end
> ```
> — produces `Fatal: Syntax error, "." expected but "end of file" found`. This isn't a generic missing-punctuation error; it's specifically because the compiler is still looking for the one period that closes the *entire program*, distinct from the semicolons and bare `end`s that close every nested block inside it.

**Practice**

- Add a second `const` and a second `var`, and confirm both sections can hold more than one declaration, each ending in its own semicolon.
- Try reassigning `Greeting` after its declaration (`Greeting := 'Hi';`) and read the compiler's error carefully — what specifically does it say `const` prevents?

## Structured typing from the start

**You'll be able to:** explain, at a high level, why Pascal's type declarations are stricter than what ALGOL 60 required.

**Concept**

Wirth's stated design goal for Pascal was a language suitable for *teaching* structured programming — which meant a compiler that catches more mistakes at compile time, not runtime. Every variable in Pascal must be declared with an explicit type before use (ALGOL 60 required this too, for the types it had), but Pascal's type system goes further than ALGOL's: it adds genuinely new category of types — enumerated types and subrange types (Module 4) — specifically so a *value's own legal range* can be part of its declared type, not just its general category (integer, real, etc.).

**Example**

```pascal
var
  x: integer;
  y: real;
  ok: boolean;
```

Verified: these compile and behave exactly as the names suggest — `x` holds whole numbers, `y` holds floating-point values, `ok` holds `true`/`false`. Nothing surprising yet; Module 4 is where Pascal's typing discipline actually diverges from what a reader coming from ALGOL or C would expect by default.

**Practice**

- Declare a variable of type `char` and assign it a single-quoted character literal (`'A'`) — Pascal uses single quotes for both characters and strings, unlike languages that distinguish `'A'` from `"A"`.

## Progress check

1. What historical decision led directly to Wirth designing Pascal, rather than simply using ALGOL 68?
2. What punctuation, specifically, closes an entire Pascal program, and how is it different from every other `end` in the same program?
3. What's the difference between `const` and `var`, verified directly by attempting to reassign a `const`?
4. What was Wirth's stated design goal for Pascal, and what does that goal predict about how strict its compiler is compared to ALGOL 60's?

### Answers

1. Wirth sat on the ALGOL 68 design committee and, together with C.A.R. Hoare, had proposed a smaller alternative (ALGOL W) before ALGOL 68 was finalized; when the committee chose ALGOL 68's greater complexity instead, Wirth went on to design Pascal independently, building on ALGOL W's ideas.
2. A period (`.`), not a semicolon — verified directly, omitting it produces a syntax error expecting `.` specifically, because it marks the end of the entire program, distinct from the semicolons (or nothing, before `else`) that close every other nested `end` in the same file.
3. `const` declares a name whose value cannot be reassigned after declaration; `var` declares an ordinary mutable variable. Attempting to reassign a `const` name produces a compile-time error specifically because the compiler treats it as a fixed, unchangeable value, not a variable with an initial value.
4. Wirth designed Pascal specifically as a language for teaching structured programming — which predicts (and Module 4 confirms directly) a stricter, more thorough compile-time type system than ALGOL 60's, catching more classes of mistake before a program ever runs.
