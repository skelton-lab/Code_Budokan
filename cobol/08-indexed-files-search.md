# Module 8 — Indexed Files & Search

By the end of this module you'll be able to declare and use an indexed file for random-access lookup, update, and deletion by key; search an in-memory table both linearly and by binary search; give one field two different views with `REDEFINES`; and split or join text fields with `STRING`/`UNSTRING`. Feeds Capstone 3 (Customer Master File Maintenance).

## Indexed files: COBOL's own pre-SQL database

**You'll be able to:** declare a file with `ORGANIZATION IS INDEXED`, and read, write, update, and delete records by key rather than sequentially.

**Concept**

`ORGANIZATION IS INDEXED` plus `RECORD KEY IS field-name` turns a file into something closer to a keyed database table than a sequential stream: `WRITE` adds a record, `READ` with a key value moved into the key field fetches that exact record (`ACCESS MODE IS RANDOM`), `REWRITE` updates the currently-keyed record in place, and `DELETE` removes it — all without scanning through unrelated records first. Every one of these needs an `INVALID KEY` clause (the record-level cousin of sequential I/O's `AT END`) for when the key doesn't exist.

This is worth naming directly: SQL's entire relational model — tables, primary keys, `SELECT`/`UPDATE`/`DELETE` by key — solves a version of the exact problem indexed COBOL files solved first, decades earlier, one file and one key at a time rather than through a query language. `sql/01-foundations-types.md`'s `PRIMARY KEY` and this module's `RECORD KEY` are answering the same underlying question — "find this one record fast, by its unique identifier" — with a database engine on one side and a file system's own indexing on the other.

**Example**

```cobol
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT CUSTOMER-FILE ASSIGN TO "customers.dat"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS CUST-ID.
       DATA DIVISION.
       FILE SECTION.
       FD  CUSTOMER-FILE.
       01  CUSTOMER-RECORD.
           05  CUST-ID          PIC 9(5).
           05  CUST-NAME        PIC X(20).
           05  CUST-BALANCE     PIC 9(7)V99.
       ...
       MOVE 10002 TO CUST-ID.
       READ CUSTOMER-FILE
           INVALID KEY
               DISPLAY "Not found"
           NOT INVALID KEY
               DISPLAY "Found: " CUST-NAME " balance " CUST-BALANCE
       END-READ.
       ADD 100 TO CUST-BALANCE.
       REWRITE CUSTOMER-RECORD
           INVALID KEY
               DISPLAY "Rewrite failed"
       END-REWRITE.
```

```
$ cobc -x -o indexed indexed.cbl && ./indexed
Found: Grace Hopper         balance 0000750.50
Correctly not found: 99999
Deleted 10001
Confirmed gone: 10001
Re-read after update: Grace Hopper         balance 0000850.50
```

Verified directly, end to end: two records written, one read by key (`10002`), a key that was never written (`99999`) correctly triggers `INVALID KEY`, a `REWRITE` after `ADD 100` correctly persists the new balance (`750.50` → `850.50`, confirmed by re-reading after closing and reopening the file), and `DELETE` on `10001` followed by a re-read confirms it's genuinely gone, not just marked in memory.

> **Pitfall:** `REWRITE` and `DELETE` both act on *whatever record the key field currently identifies* — moving a key value into `CUST-ID` and calling `READ` first (to position the file there) is often necessary before a `REWRITE`, not just for displaying the old value.

**Practice**

- Add a third customer, delete the second, and confirm both operations by re-reading afterward rather than trusting the operation "must have worked."
- Try a `REWRITE` with no prior successful `READ` on that key and observe what `INVALID KEY` reports.

## `SEARCH` and `SEARCH ALL`

**You'll be able to:** perform a linear search over an `OCCURS` table with `SEARCH`, and a binary search with `SEARCH ALL` against a table declared with an `ASCENDING KEY`.

**Concept**

`SEARCH` scans an `OCCURS` table linearly from its current index position, using `WHEN condition` clauses and an index variable declared with `INDEXED BY`. `SEARCH ALL` requires the table to declare `ASCENDING KEY IS field` (and to actually *be* sorted by that field) — in exchange, it performs a binary search, the same big-O tradeoff as choosing a sorted structure over an unsorted scan in any other language.

**Example**

```cobol
       01  WS-NAME-TABLE.
           05  WS-NAME-ENTRY OCCURS 5 TIMES
                   ASCENDING KEY IS WS-NAME
                   INDEXED BY WS-IDX.
               10  WS-NAME       PIC X(10).
               10  WS-SCORE      PIC 9(3).
       ...
       SET WS-IDX TO 1.
       SEARCH WS-NAME-ENTRY
           AT END DISPLAY "Linear search: not found"
           WHEN WS-NAME(WS-IDX) = "Carol"
               DISPLAY "Linear found Carol, score " WS-SCORE(WS-IDX)
       END-SEARCH.

       SEARCH ALL WS-NAME-ENTRY
           AT END DISPLAY "Binary search: not found"
           WHEN WS-NAME(WS-IDX) = "Dave"
               DISPLAY "Binary found Dave, score " WS-SCORE(WS-IDX)
       END-SEARCH.
```

```
$ ./search
Linear found Carol, score 088
Binary found Dave, score 060
```

Verified directly against a table populated in alphabetical order (`Ada`, `Bob`, `Carol`, `Dave`, `Eve`) — both search forms found the correct scores.

> **Pitfall:** `SEARCH ALL` doesn't check that the table is actually sorted by its declared key — if the data isn't really in ascending order, the binary search can report "not found" for an entry that's genuinely present, or find the wrong one, silently. The `ASCENDING KEY` clause is a promise you make to the compiler, not a constraint it enforces.

**Practice**

- Populate the table out of alphabetical order and compare `SEARCH`'s and `SEARCH ALL`'s results for the same lookup — confirm directly that `SEARCH ALL` breaks in exactly the way the pitfall above predicts.

## `REDEFINES`: one storage area, two views

**You'll be able to:** declare a second, differently-shaped view of an existing field's storage using `REDEFINES`.

**Concept**

`REDEFINES` declares a new field that occupies the *same* storage as an existing one, with a different (or differently subdivided) `PIC` layout — not a copy, the literal same bytes viewed two ways. It's COBOL's version of C's `union`, most often used to break an 8-digit numeric date field into year/month/day components without duplicating storage.

**Example**

```cobol
       01  WS-DATE-NUMERIC      PIC 9(8) VALUE 20260719.
       01  WS-DATE-PARTS REDEFINES WS-DATE-NUMERIC.
           05  WS-YEAR          PIC 9(4).
           05  WS-MONTH         PIC 9(2).
           05  WS-DAY           PIC 9(2).
```

```
$ ./redefines
Full: 20260719
Year: 2026 Month: 07 Day: 19
```

Verified directly: no `MOVE` between the two fields at all — `WS-YEAR`/`WS-MONTH`/`WS-DAY` are simply reading different byte ranges of the exact same storage `WS-DATE-NUMERIC` already holds.

> **Pitfall:** because it's the same storage, changing either view changes what the other one sees immediately — assigning to `WS-YEAR` directly changes what `WS-DATE-NUMERIC` displays as a whole, with no synchronization step needed or possible to skip.

**Practice**

- Add a `MOVE 20301231 TO WS-DATE-NUMERIC` and confirm `WS-YEAR`/`WS-MONTH`/`WS-DAY` immediately reflect the new value with no additional statement.

## `STRING` and `UNSTRING`

**You'll be able to:** concatenate fields into one with `STRING`, and split a delimited field into separate fields with `UNSTRING`.

**Concept**

`STRING source1 source2 ... DELIMITED BY SIZE INTO target` concatenates its sources into `target`; `UNSTRING source DELIMITED BY "delimiter" INTO target1 target2 ...` splits `source` on the delimiter into successive targets.

**Example**

```cobol
       STRING FUNCTION TRIM(WS-FIRST) " "
              FUNCTION TRIM(WS-LAST)
              DELIMITED BY SIZE
              INTO WS-FULL.
       ...
       UNSTRING WS-CSV DELIMITED BY ","
           INTO WS-PART1 WS-PART2 WS-PART3.
```

```
$ ./stringdemo
Full name: [Ada Lovelace]
Part1=[East] Part2=[1234] Part3=[Region]
```

Verified directly: `"Ada"` and `"Lovelace"` (each padded to `PIC X(10)`) joined correctly with a single space, using `FUNCTION TRIM` to strip the padding first; `"East,1234,Region"` split correctly on every comma into three separate fields.

> **Pitfall:** `DELIMITED BY SIZE` in `STRING` means "use the source's *entire declared size*," which is exactly why `FUNCTION TRIM` was necessary above — without it, `STRING` would have copied all 10 characters of `WS-FIRST` including its trailing padding spaces, landing "Lovelace" far to the right of where you'd want it.

**Practice**

- `UNSTRING` a four-field CSV line and confirm all four parts land correctly.
- Try `STRING`ing two fields together without `FUNCTION TRIM` first and observe the padding problem directly.

## Progress check

1. What does `RECORD KEY IS field-name` let a program do that a sequential file's `READ` cannot?
2. What must be true of a table's actual data for `SEARCH ALL` to give correct results, and what happens if that's not true?
3. What does `REDEFINES` actually share between its two field views — a copy of the data, or the storage itself?
4. Why did the `STRING` example need `FUNCTION TRIM` on its source fields?
5. What's the direct connection this module draws between COBOL's indexed files and SQL's primary keys?

### Answers

1. It lets the program fetch, update, or delete one specific record directly by its key value, without scanning through preceding records — a sequential file's `READ` only ever returns "the next record in the file."
2. The table must genuinely be sorted in ascending order by the declared key field — if it isn't, `SEARCH ALL`'s binary search can silently report "not found" for a present entry, or return the wrong one, with no error raised.
3. The storage itself — the same physical bytes, viewed with a different `PIC` layout; changing one view immediately changes what the other view reads, with no copying or synchronization involved.
4. Because `STRING ... DELIMITED BY SIZE` copies a source field's entire declared size, trailing padding spaces included — `FUNCTION TRIM` strips that padding first so the concatenation doesn't leave a large gap where the padding used to be.
5. Both solve the same underlying problem — locate one specific record fast, by a unique identifying value — decades apart: COBOL's `RECORD KEY` via direct file-system-level indexing, SQL's `PRIMARY KEY` via a full relational query engine built on top of the same basic need.
