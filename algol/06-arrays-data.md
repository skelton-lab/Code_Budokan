# Module 6 — Arrays and Data

Declaring and indexing arrays, with ALGOL's own bracket-free, range-declared syntax. Verified.

## Declaring and indexing arrays

**You'll be able to:** declare an array with explicit bounds, fill it, and read it back.

**Concept**

`[lower:upper] TYPE name` declares an array with explicit lower and upper index bounds — ALGOL's arrays don't have to start at `0` or `1` the way many later languages default to; you state the range you want directly. This flexibility (arbitrary, explicitly-stated bounds) was itself a notable feature at the time, ancestral to similar range-declared arrays in later languages like Pascal.

**Example**

```algol68
BEGIN
   [1:5] INT arr := (10, 20, 30, 40, 50);
   INT total := 0;
   FOR i FROM 1 TO 5 DO
      total := total + arr[i]
   OD;
   print(("sum = ", total, newline))
END
```

Verified: prints `sum =        +150` — `10+20+30+40+50 = 150`, confirming both the array literal initialization and indexed access work as expected.

**Example — building an array's contents rather than initializing it all at once:**

```algol68
BEGIN
   [1:3] INT dyn;
   FOR i FROM 1 TO 3 DO dyn[i] := i * i OD;
   FOR i FROM 1 TO 3 DO print((dyn[i], " ")) OD;
   print((newline))
END
```

Verified: prints `+1 +4 +9` — each element assigned individually inside a loop (`i * i` for `i` from 1 to 3), then read back in a second loop, confirming ordinary indexed assignment works independent of the array's initial declaration.

> **Pitfall:** declaring `[1:3] INT dyn` without an initializer leaves its contents unspecified until you explicitly assign to each index — reading an index before assigning it is the same category of mistake as reading an uninitialized variable in any other language in this series (the C guide's Module 5 covered this exact class of bug in depth, including what a compiler warning for it looks like).

**Practice**

- Declare an array with non-trivial bounds (`[10:15] INT arr`, for instance, rather than starting at `1`) and confirm indexing works correctly across that exact range.
- Sum only the even-indexed elements of a 6-element array, using a `FOR` loop with an explicit step.

## Progress check

1. What does `[1:5] INT arr` declare, precisely, and what index values are valid?
2. Why is ALGOL's array-bounds flexibility (not forced to start at `0` or `1`) worth noting historically?
3. What happens if you read an array element before ever assigning to it?
4. Confirm from this module's verified example: what does `arr[i]` require to be valid — does `i` need to start at any particular fixed value?

### Answers

1. An array named `arr`, holding `INT` values, indexed from `1` through `5` inclusive — both bounds are explicitly stated, not assumed.
2. Later languages often default to a fixed starting index (`0` in C-family languages, for instance) as a convention; ALGOL's explicit-bounds declaration predates and directly influenced similar flexible-range array declarations in languages like Pascal, rather than assuming one universal convention.
3. Its value is unspecified/indeterminate — the same category of bug as reading an uninitialized variable in any other language, since declaring an array reserves storage for it but doesn't guarantee any particular initial contents unless you provide an initializer.
4. `i` needs to fall within the array's declared bounds (`1` through `5` in the summing example) — there's no requirement that indexing start from `0` or any other fixed convention; it's whatever range the array was declared with.
