# Module 6 — Tables & Control Breaks

By the end of this module you'll be able to declare a fixed-size array with `OCCURS`, detect a change in a key field to produce grouped subtotals (the "control break" pattern every real COBOL batch report uses), format numbers for human-readable output with edited `PICTURE` clauses, and sort a file before processing it. Feeds Capstone 2.

## `OCCURS`: fixed-size tables

**You'll be able to:** declare a table (array) with `OCCURS`, and index into it.

**Concept**

`OCCURS n TIMES` on a field declares it as a table of `n` elements instead of a single value — indexed with parentheses, `field(index)`, using 1-based indexing.

**Example**

```cobol
       01  WS-SALES-TABLE.
           05  WS-SALE OCCURS 5 TIMES PIC 9(4)V99.
       ...
       MOVE 100.50 TO WS-SALE(1).
       ...
       PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 5
           ADD WS-SALE(WS-I) TO WS-SUM
       END-PERFORM.
```

```
$ cobc -x -o occurs occurs.cbl && ./occurs
Sum of table: 000801.60
```

Verified directly: `100.50 + 200.25 + 150.00 + 300.75 + 50.10 = 801.60`, summed correctly across the indexed loop.

> **Pitfall:** `OCCURS` tables are fixed at compile time — there's no resizing a table declared `OCCURS 5 TIMES` at runtime the way an array-backed list in Python or Ruby grows. A program reading a variable number of records into a table needs to declare it for the realistic maximum up front (or use `OCCURS ... DEPENDING ON`, a variable-length variant this guide doesn't cover in depth — a real "Beyond This Guide" candidate).

**Practice**

- Declare a 3-element `OCCURS` table of names (`PIC X(10)`), populate it, and display all three with a `PERFORM VARYING` loop.

## Edited `PICTURE` clauses: numbers meant to be read

**You'll be able to:** format a numeric value for human-readable report output using zero-suppression, floating currency signs, comma insertion, and negative-value editing.

**Concept**

Every numeric field so far has used an unedited `PIC` (`9`, `V`, `S`) — correct for storage and arithmetic, but full of leading zeros a printed report shouldn't show. An *edited* `PICTURE` clause — using characters like `Z` (zero-suppress), `$` (floating currency sign), `,` (comma insertion), and `CR`/`DB` (credit/debit sign editing) — is a separate field a value gets `MOVE`d *into* purely for display; it's never used in arithmetic itself.

**Example**

```cobol
       01  WS-AMOUNT            PIC 9(7)V99 VALUE 123456.78.
       01  WS-EDITED            PIC $$$,$$$,$$9.99.
       01  WS-NEG                PIC S9(5)V99 VALUE -123.45.
       01  WS-NEG-EDITED         PIC $$,$$9.99CR.
       ...
       MOVE WS-AMOUNT TO WS-EDITED.
       MOVE WS-NEG TO WS-NEG-EDITED.
```

```
$ ./edited
Edited large:  [   $123,456.78]
Edited small:  [        $42.50]
Edited neg:    [  $123.45CR]
```

Verified directly: the leading `$` "floats" to sit immediately before the first significant digit rather than at a fixed position (compare the large and small amounts — the `$` lands in a different column each time), commas are inserted at the correct thousands positions, and a negative value shows `CR` rather than a `-` sign, exactly the convention a printed financial report uses.

> **Pitfall:** an edited field is genuinely a different, larger field from the value it displays — `PIC $$$,$$$,$$9.99` occupies more storage than `PIC 9(7)V99` because every `$`, `,`, and `.` takes a real character position. You `MOVE` a working value *into* an edited field for display; you never do arithmetic directly on the edited field itself.

**Practice**

- Design an edited `PICTURE` clause for a 4-digit unsigned amount with no currency sign, just comma insertion and zero suppression, and confirm `1500` displays as `1,500` not `01,500`.

## The control-break pattern

**You'll be able to:** detect a change in a key field while reading a sequential file, and print a subtotal exactly when the group changes.

**Concept**

A "control break" is the classic COBOL batch-reporting idiom: read records in order, sorted by some key field (region, department, account); each time that key's value *changes* from the previous record, print a subtotal for the group that just ended and reset the accumulator, then keep going. The last group's subtotal needs printing once more *after* the read loop ends, since there's no further record to trigger the change.

**Example**

```cobol
       PERFORM UNTIL WS-END-OF-FILE
           READ SALES-FILE
               AT END
                   SET WS-END-OF-FILE TO TRUE
               NOT AT END
                   IF NOT WS-IS-FIRST-RECORD
                       AND SR-REGION NOT = WS-PREV-REGION
                       MOVE WS-REGION-TOTAL TO WS-EDITED-REGION-TOT
                       DISPLAY "  Subtotal " WS-PREV-REGION ": "
                               WS-EDITED-REGION-TOT
                       MOVE 0 TO WS-REGION-TOTAL
                   END-IF
                   DISPLAY SR-REGION " " SR-AMOUNT
                   ADD SR-AMOUNT TO WS-REGION-TOTAL
                   ADD SR-AMOUNT TO WS-GRAND-TOTAL
                   MOVE SR-REGION TO WS-PREV-REGION
                   MOVE "N" TO WS-FIRST-RECORD
           END-READ
       END-PERFORM.
       MOVE WS-REGION-TOTAL TO WS-EDITED-REGION-TOT.
       DISPLAY "  Subtotal " WS-PREV-REGION ": " WS-EDITED-REGION-TOT.
```

```
$ cobc -x -o controlbreak controlbreak.cbl && ./controlbreak
East       01234.50
East       00500.00
  Subtotal East      :  $1,734.50
North      00987.25
  Subtotal North     :    $987.25
West       02345.75
West       00100.00
  Subtotal West      :  $2,445.75
Grand total:  $5,167.50
```

Verified by hand: East's two records (`1234.50 + 500.00 = 1734.50`), North's one record, West's two records (`2345.75 + 100.00 = 2445.75`), and the grand total (`1734.50 + 987.25 + 2445.75 = 5167.50`) all check out exactly against the displayed output.

> **Pitfall:** the "first record" guard (`WS-IS-FIRST-RECORD`) matters precisely because `WS-PREV-REGION` starts out as spaces — without checking for the first record specially, the very first record would trigger a spurious "subtotal" comparison against an empty region that was never actually processed. And the final `DISPLAY`/`MOVE` pair *after* the loop is not optional cleanup — it's the only place the last group's subtotal ever gets printed, since no further record exists to trigger the change that would otherwise print it.

**Practice**

- Add a fourth region's worth of records to `sales_sorted.dat` and confirm the control break correctly detects it and prints its subtotal.
- Explain, in your own words, why this pattern requires the input file to already be sorted by the break field — what would go wrong on unsorted data?

## `SORT`: ordering a file before processing it

**You'll be able to:** sort a sequential file into a new file by a key field, the way a real control-break report needs its input pre-sorted.

**Concept**

`SORT` needs a working `SD` (Sort Description) record — structurally identical to an `FD` record — plus `USING` (the unsorted input file) and `GIVING` (where the sorted output goes).

**Example**

```cobol
       SD  SORT-WORK.
       01  SORT-RECORD.
           05  SW-REGION        PIC X(10).
           05  SW-AMOUNT        PIC 9(5)V99.
       ...
       SORT SORT-WORK ON ASCENDING KEY SW-REGION
           USING SALES-FILE
           GIVING SORTED-FILE.
```

```
$ cobc -x -o sortdemo sortdemo.cbl && ./sortdemo
$ cat sales_sorted.dat
East      0123450
North     0098725
West      0234575
```

Verified directly against an unsorted `sales.dat` (`East`, `West`, `North` in that order) — `sales_sorted.dat` came out alphabetically ordered, ready for the control-break loop above, which depends on its input already being grouped.

> **Pitfall:** `SORT`'s `SD` record needs its own file assignment in `FILE-CONTROL` (a scratch/work file COBOL manages internally during the sort) even though your code never opens or reads it directly — omitting that `SELECT` entry is a common first-attempt mistake.

**Practice**

- Add a second sort key (e.g., descending by amount within each region) and confirm the output order changes as expected.

## Progress check

1. Is an `OCCURS`-declared table's size fixed at compile time or resizable at runtime?
2. What's the real difference between `PIC 9(7)V99` and an edited `PIC $$$,$$$,$$9.99` field holding the same logical value?
3. What does the control-break pattern's "first record" guard prevent?
4. Why does the final subtotal need a separate `DISPLAY` *after* the main read loop ends?
5. What does `SORT`'s `SD` entry need that an `FD` entry doesn't, structurally?

### Answers

1. Fixed at compile time — `OCCURS n TIMES` allocates exactly `n` elements; there's no runtime resizing without the separate `OCCURS ... DEPENDING ON` variable-length feature.
2. The edited field is a different, larger piece of storage purely for display — it can't be used directly in arithmetic, and a value must be `MOVE`d into it from the working (unedited) field each time it needs displaying.
3. It prevents a spurious "group changed" detection on the very first record, since the comparison field (`WS-PREV-REGION`) starts as spaces before any real record has been read.
4. Because the group-change detection only fires when reading the *next* record reveals a different key value — the last group in the file never gets a "next" record to trigger that detection, so its subtotal must be printed explicitly once the loop ends.
5. Nothing structurally different (an `SD` record layout looks identical to an `FD` record layout) — but it still needs its own `SELECT`/`ASSIGN` entry in `FILE-CONTROL`, even though the program never directly opens or reads that file itself; `SORT` manages it internally.
