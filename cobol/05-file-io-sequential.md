# Module 5 — Sequential File I/O

By the end of this module you'll be able to declare a file's record layout, open it, read every record in a loop using the canonical end-of-file pattern, and close it — COBOL's default data model, not an add-on library. Feeds Capstone 2 (Sales Batch Report).

## `FILE SECTION`, `FD`, and `SELECT`

**You'll be able to:** declare a file's name, its physical assignment, and its record layout, in the three places COBOL splits that information across.

**Concept**

File handling spans two DIVISIONs:

- `ENVIRONMENT DIVISION`'s `FILE-CONTROL` paragraph: `SELECT file-name ASSIGN TO "path" ORGANIZATION IS LINE SEQUENTIAL.` — the logical name COBOL code uses, and where it actually lives on disk. `LINE SEQUENTIAL` treats the file as newline-delimited text, the organization this guide uses throughout.
- `DATA DIVISION`'s `FILE SECTION`: an `FD` (File Description) entry followed by a record layout — the exact same `01`-level-with-subordinate-fields shape `WORKING-STORAGE` uses, just describing a file's record instead of a program variable.

**Example**

```cobol
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT SALES-FILE ASSIGN TO "sales.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  SALES-FILE.
       01  SALES-RECORD.
           05  SR-REGION        PIC X(10).
           05  SR-AMOUNT        PIC 9(5)V99.
```

`SALES-RECORD` is a *group item* — `05  SR-REGION` and `05  SR-AMOUNT` are its subordinate fields, together occupying exactly 17 characters (10 + 7) of each line in the file. Group-level items like this are new here but not a new idea: it's the same "declare an aggregate shape once" instinct as a C `struct`, expressed with indentation levels instead of braces.

> **Pitfall, found live while verifying this exact example:** a `PIC 9(5)V99` field's `V` is *implied* — it occupies no character position in the file's actual text. A first draft of `sales.dat` for this module written the amounts with a literal decimal point (`01234.50`), which is wrong: that's an 8-character string being read into a 7-character field, and every subsequent character in the record shifts by one, corrupting `SR-AMOUNT` and every field after it in a multi-field record. The fix was writing the raw digits with no decimal point at all (`0123450`) — the decimal point that later appears in `DISPLAY SR-AMOUNT`'s output is COBOL correctly re-inserting it based on the field's own `PIC` clause, not something that was ever in the file.

**Practice**

- Predict, in characters, the exact fixed width of a record with fields `PIC X(15)`, `PIC 9(4)`, and `PIC S9(3)V99` — then confirm by counting a line of real data written to match it.

## `OPEN`, `READ`, `CLOSE`, and the `AT END`/`NOT AT END` loop

**You'll be able to:** open a file for input, read every record with the canonical `PERFORM UNTIL` end-of-file pattern, and close it.

**Concept**

`OPEN INPUT file-name` makes a file ready to read; `CLOSE file-name` releases it. `READ file-name` pulls the next record into the `FD`'s record layout — and every `READ` needs an `AT END` clause (what to do when there's no more data) alongside `NOT AT END` (what to do with an actual record). The standard COBOL idiom combines this with an 88-level end-of-file flag and a `PERFORM UNTIL` loop:

**Example**

```cobol
       WORKING-STORAGE SECTION.
       01  WS-EOF               PIC X VALUE "N".
           88  WS-END-OF-FILE           VALUE "Y".
       01  WS-TOTAL             PIC 9(7)V99 VALUE 0.
       PROCEDURE DIVISION.
           OPEN INPUT SALES-FILE.
           PERFORM UNTIL WS-END-OF-FILE
               READ SALES-FILE
                   AT END
                       SET WS-END-OF-FILE TO TRUE
                   NOT AT END
                       DISPLAY SR-REGION " " SR-AMOUNT
                       ADD SR-AMOUNT TO WS-TOTAL
               END-READ
           END-PERFORM.
           CLOSE SALES-FILE.
           DISPLAY "Total: " WS-TOTAL.
           STOP RUN.
```

```
$ printf "East      0123450\nWest      0234575\nNorth     0098725\n" > sales.dat
$ cobc -x -o fileio fileio.cbl && ./fileio
East       01234.50
West       02345.75
North      00987.25
Total: 0004567.50
```

Verified by hand: `1234.50 + 2345.75 + 987.25 = 4567.50`, matching the displayed total exactly — the loop read all three records, correctly stopped after the third (no fourth, garbled record appeared), and `WS-END-OF-FILE` correctly ended the `PERFORM UNTIL`.

> **Pitfall:** this pattern reads one record *ahead* of when you'd naively expect — the `AT END` branch fires on the `READ` call that discovers there's nothing left, not after the loop "notices" it's done. Structuring the loop any other way (e.g., checking for end-of-file *before* calling `READ` for the first time) either skips the first record or reads one past the last, depending on how it's miswritten. This exact `PERFORM UNTIL WS-END-OF-FILE` / `READ ... AT END ... NOT AT END` shape is the one to memorize verbatim — it's the most common structural bug in real COBOL batch programs.

**Practice**

- Add a fourth line to `sales.dat` and confirm the loop and total both pick it up without any code changes.
- Deliberately write the loop with `READ` before the `PERFORM UNTIL` check instead of inside it, and see what actually goes wrong.

## Progress check

1. What does `ORGANIZATION IS LINE SEQUENTIAL` mean for how a file's records are physically stored?
2. What does an `FD` entry describe, and where does its record layout live?
3. Why must every `READ` statement have an `AT END` clause?
4. What silent corruption did this module's own worked example run into, and what caused it?
5. Why does the standard `PERFORM UNTIL WS-END-OF-FILE` pattern check the flag *before* each `READ`, not after?

### Answers

1. Each record is one newline-delimited line of text — the simplest, most portable file organization, and the one this guide anchors to throughout.
2. It describes a file's structure to the compiler — the DIVISION/section it lives in (`DATA DIVISION`'s `FILE SECTION`) followed immediately by the `01`-level record layout for that file.
3. Because reading past the last record is a real, expected condition every sequential-read loop must handle explicitly — without `AT END`, there's no defined way to detect "no more data."
4. `sales.dat`'s amount field was first written with a literal decimal point (`01234.50`, 8 characters) into a `PIC 9(5)V99` field that only occupies 7 characters in the file (the `V` is implied, taking no storage) — the extra character shifted every subsequent field in the record, corrupting the read. Fixed by writing the raw digits with no punctuation (`0123450`).
5. Because the very first `READ` inside the loop is what actually attempts to fetch the first record and discovers whether there's any data at all — checking the flag first, before any `READ` has run, would need a different structure (like an initial priming read) to work correctly; this pattern's specific shape (flag check, then read, then branch on the read's own result) is what makes a single loop handle every case correctly, including a completely empty file.
