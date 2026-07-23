# Module 1 — Foundations & Divisions

By the end of this module you'll be able to write a complete, compilable COBOL program from scratch: the DIVISION skeleton, fixed-form column discipline, declaring typed working storage with `PIC` clauses, and moving data between fields and the terminal. Feeds Capstone 1 (Loan/Interest Calculator).

## The four DIVISIONs

**You'll be able to:** name all four DIVISIONs, state which two are strictly required, and write a minimal compilable program.

**Concept**

Every COBOL program is organized into up to four DIVISIONs, always in this order:

- `IDENTIFICATION DIVISION` — the program's name (`PROGRAM-ID.`) and, optionally, author/date metadata. Required.
- `ENVIRONMENT DIVISION` — machine- and file-system-facing configuration (file assignments live here — Module 5). Optional if the program touches no files and needs no special configuration.
- `DATA DIVISION` — every variable the program uses, declared with an explicit type and size up front (`WORKING-STORAGE SECTION`, `FILE SECTION`). Optional only if the program declares no data at all.
- `PROCEDURE DIVISION` — the actual executable statements. Required.

The non-obvious consequence: unlike C or Fortran, there's no way to declare a variable inline, next to where you use it — every piece of data a COBOL program touches is declared up front, in one place, before a single executable statement runs. This is a genuine design choice, not an omission: it means a maintainer can read a program's entire data shape from one section, without hunting through logic to find where something got declared.

**Example**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO.
       PROCEDURE DIVISION.
           DISPLAY "Hello, COBOL".
           STOP RUN.
```

```bash
$ cobc -x -o hello hello.cbl && ./hello
Hello, COBOL
```

Verified directly: a program needs only `IDENTIFICATION DIVISION` and `PROCEDURE DIVISION` to compile and run — `ENVIRONMENT` and `DATA` are genuinely optional when nothing needs configuring or declaring, not DIVISIONs you're expected to always write out.

> **Pitfall:** `STOP RUN.` isn't optional punctuation — it's the statement that actually ends the program. Falling off the end of `PROCEDURE DIVISION` without it is undefined in spirit even where GnuCOBOL happens to let it slide; every example in this guide ends with it explicitly.

**Practice**

- Write and compile a program whose entire `PROCEDURE DIVISION` displays your name and nothing else.
- Try removing `PROGRAM-ID.` entirely and recompile — read the compiler's actual error message rather than guessing what it would say.

## Fixed-form columns

**You'll be able to:** place DIVISION/SECTION/paragraph headers and statements in the correct columns, and explain what each column region is for.

**Concept**

Traditional COBOL source is column-disciplined, a direct holdover from 80-column punch cards:

| Columns | Region | Contents |
|---|---|---|
| 1–6 | Sequence area | Historically a card sequence number; unused in practice today, left blank |
| 7 | Indicator area | `*` for a comment line, `-` for continuing a literal from the previous line |
| 8–11 | Area A | DIVISION/SECTION headers, paragraph names, `01`/`77` level numbers |
| 12–72 | Area B | Everything else — statements, most level numbers (02–49), clauses |

Every example so far has followed this discipline: `IDENTIFICATION DIVISION.` starts at column 8 (Area A), while `DISPLAY "Hello, COBOL".` starts further right, in Area B.

**Example**

```cobol
       IDENTIFICATION DIVISION.
      * The line above starts in Area A (column 8) — this comment line
      * starts with a '*' in column 7, the indicator area.
       PROGRAM-ID. COMMENTDEMO.
       PROCEDURE DIVISION.
           DISPLAY "Comments use column 7, not //  or #".
           STOP RUN.
```

> **Pitfall, verified against this exact toolchain — and a real self-correction along the way:** the traditional claim is that columns 73–80 are a punch-card sequence-number area silently *ignored* by the compiler. A first attempt at verifying this looked like it disproved the claim — a test line seemed to compile with content past column 72 still read. Re-checking that same test by printing the exact character at each column position (rather than trusting a visual line count) showed the test itself was flawed: the "past column 72" content in that attempt was still sitting at column ≤72. Redone properly — building a line where a complete, valid statement ends exactly at column 72 and genuine garbage (`)))GARBAGE(((`) starts at column 73 — the garbage is silently dropped and the program compiles and runs cleanly, no error, no warning. The folklore holds: GnuCOBOL 3.2 truncates fixed-form source at column 72 by default. Whether a specific mainframe COBOL compiler behaves identically is a separate, per-implementation question this guide doesn't have the toolchain to check — stated here as verified against GnuCOBOL specifically. The practical lesson doubles as a caution about verification itself: a plausible-looking test result is not a verified one until you've confirmed the test actually exercised what you think it did.

**Practice**

- Take the `HELLO` program and add a comment line above `PROGRAM-ID.` explaining what the program does.
- Deliberately misplace `PROGRAM-ID.` starting in Area B (column 12+) instead of Area A and recompile — read what actually happens on this toolchain rather than assuming it must fail.

## Working storage and `PIC` clauses

**You'll be able to:** declare typed fields in `WORKING-STORAGE SECTION` using `PIC` clauses for alphanumeric, numeric, and signed-decimal data, and move values between them.

**Concept**

`PIC` (short for `PICTURE`) declares a field's type and exact size — there's no separate "type name" the way C has `int` or `char`; the picture clause *is* the type:

- `PIC X(n)` — alphanumeric, exactly `n` characters, space-padded on the right if a shorter value is moved in.
- `PIC 9(n)` — an unsigned numeric field, exactly `n` digits.
- `PIC S9(n)V9(m)` — a signed numeric field with `n` digits before an implied decimal point and `m` after. `V` marks where the decimal point *would* go — it occupies no storage of its own; the field just knows to treat the last `m` digits as fractional. `S` makes the field signed; without it, a negative value moved in loses its sign.

Every `01`-level entry in `WORKING-STORAGE SECTION` declares one variable at that name; `MOVE` copies a value from one field (or a literal) into another, following the receiving field's own `PIC` clause — including truncating or padding as needed.

**Example**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. WSDEMO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NAME             PIC X(20).
       01  WS-AGE              PIC 9(3).
       01  WS-BALANCE          PIC S9(7)V99.
       PROCEDURE DIVISION.
           MOVE "Ada" TO WS-NAME.
           MOVE 37 TO WS-AGE.
           MOVE 1234.5 TO WS-BALANCE.
           DISPLAY "Name: " WS-NAME.
           DISPLAY "Age: " WS-AGE.
           DISPLAY "Balance: " WS-BALANCE.
           STOP RUN.
```

```
$ cobc -x -o ws ws.cbl && ./ws
Name: Ada                 
Age: 037
Balance: +0001234.50
```

Verified directly: `WS-NAME` displays padded to its full 20 characters; `WS-AGE` displays zero-padded to 3 digits (`037`, not `37`); and — worth noticing precisely — `WS-BALANCE` displays with an explicit leading `+` sign, because `DISPLAY` usage on a signed (`S`) numeric field shows the sign character by default. This is the first real look at fixed-decimal storage: `1234.5` moved into a field with two decimal digits (`V99`) stored as `1234.50`, exactly, with no floating-point representation anywhere in the picture — Module 2 makes this precision the centerpiece.

> **Pitfall:** `PIC 9(3)` moved a value larger than 3 digits truncates silently from the left (high-order digits are lost), not an error — declaring a field's size is a real capacity limit, not a hint.

**Practice**

- Declare a `PIC X(5)` field, `MOVE` a 10-character literal into it, and predict the displayed result before running it.
- Declare `PIC 9(2)` and move `137` into it — run it and check whether your prediction about which digits survive was correct.

## `ACCEPT` and `DISPLAY`

**You'll be able to:** read a value from standard input with `ACCEPT` and write formatted output with `DISPLAY`, including suppressing the automatic newline.

**Concept**

`DISPLAY` writes one or more items to standard output, followed by a newline unless `WITH NO ADVANCING` is given. `ACCEPT` is its input counterpart — reading a line from standard input into a `WORKING-STORAGE` field, following that field's own `PIC` clause for how the text is interpreted.

**Example**

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ACCEPTDEMO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NAME             PIC X(20).
       PROCEDURE DIVISION.
           DISPLAY "Enter your name: " WITH NO ADVANCING.
           ACCEPT WS-NAME.
           DISPLAY "Hello, " FUNCTION TRIM(WS-NAME) "!".
           STOP RUN.
```

```
$ echo "Ada Lovelace" | ./accept
Enter your name: Hello, Ada Lovelace!
```

Verified directly, including `FUNCTION TRIM` — without it, the trailing spaces `WS-NAME`'s `PIC X(20)` pads on would show up before the `!`.

**Practice**

- Modify `ACCEPTDEMO` to also accept and display an age (`PIC 9(3)`).
- Predict, then verify, what `ACCEPT` does with a `PIC X(5)` field when you type more than 5 characters.

## Progress check

1. Which two DIVISIONs are strictly required, and which two are optional?
2. What column does `PROGRAM-ID.` need to start in, and what's that region called?
3. What does `V` mean in a `PIC` clause, and how much storage does it occupy?
4. What does `S` add to a `PIC` clause, and what happens to a negative value moved into a field without it?
5. What does GnuCOBOL 3.2 actually do, by default, with source text past column 72?
6. What's the difference between `DISPLAY` and `DISPLAY ... WITH NO ADVANCING`?

### Answers

1. `IDENTIFICATION DIVISION` and `PROCEDURE DIVISION` are required; `ENVIRONMENT DIVISION` and `DATA DIVISION` are optional, needed only when the program uses files/special configuration or declares data, respectively.
2. Column 8, the start of Area A — DIVISION/SECTION headers, paragraph names, and `01`/`77` level numbers all start there.
3. It marks where an implied decimal point sits in a numeric field; it occupies no storage at all — a `PIC 9(7)V99` field is 9 digits of actual storage, not 10.
4. `S` makes the field signed, so a negative value stored and displayed correctly retains its sign; without `S`, a negative value moved in loses the sign (the field behaves as unsigned).
5. Verified directly (after correcting a first, flawed test): it silently truncates — text past column 72 is dropped before parsing, with no error or warning, matching the traditional punch-card-era folklore exactly.
6. Plain `DISPLAY` writes its arguments followed by a newline; `WITH NO ADVANCING` suppresses that newline, useful for a prompt that should stay on the same line as whatever's typed next to it.
