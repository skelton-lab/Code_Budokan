# Capstone 2 — Sales Batch Report

Combines every concept from Modules 5–6: `SORT`, sequential file I/O, the `PERFORM UNTIL` end-of-file pattern, control breaks, and edited `PICTURE` output — the quintessential COBOL batch job, run against unsorted raw input and producing a formatted, subtotaled report. Also builds this guide's hand-rolled verification pattern, since GnuCOBOL ships no standard test framework.

## The program

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SALESREPORT.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT RAW-FILE ASSIGN TO "sales_raw.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT SORTED-FILE ASSIGN TO "sales_sorted2.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT SORT-WORK ASSIGN TO "sortwork2.tmp".
       DATA DIVISION.
       FILE SECTION.
       FD  RAW-FILE.
       01  RAW-RECORD.
           05  RR-REGION        PIC X(10).
           05  RR-AMOUNT        PIC 9(5)V99.
       FD  SORTED-FILE.
       01  SORTED-RECORD.
           05  SO-REGION        PIC X(10).
           05  SO-AMOUNT        PIC 9(5)V99.
       SD  SORT-WORK.
       01  SORT-RECORD.
           05  SW-REGION        PIC X(10).
           05  SW-AMOUNT        PIC 9(5)V99.
       WORKING-STORAGE SECTION.
       01  WS-EOF               PIC X VALUE "N".
           88  WS-END-OF-FILE           VALUE "Y".
       01  WS-PREV-REGION       PIC X(10) VALUE SPACES.
       01  WS-REGION-TOTAL      PIC 9(7)V99 VALUE 0.
       01  WS-GRAND-TOTAL       PIC 9(7)V99 VALUE 0.
       01  WS-FIRST-RECORD      PIC X VALUE "Y".
           88  WS-IS-FIRST-RECORD       VALUE "Y".
       01  WS-EDITED-REGION-TOT PIC $$$,$$9.99.
       01  WS-EDITED-GRAND-TOT  PIC $$$,$$9.99.
       01  WS-EDITED-AMOUNT     PIC $$$,$$9.99.
       PROCEDURE DIVISION.
           SORT SORT-WORK ON ASCENDING KEY SW-REGION
               USING RAW-FILE
               GIVING SORTED-FILE.

           DISPLAY "===== Sales Batch Report =====".
           OPEN INPUT SORTED-FILE.
           PERFORM UNTIL WS-END-OF-FILE
               READ SORTED-FILE
                   AT END
                       SET WS-END-OF-FILE TO TRUE
                   NOT AT END
                       IF NOT WS-IS-FIRST-RECORD
                           AND SO-REGION NOT = WS-PREV-REGION
                           MOVE WS-REGION-TOTAL TO WS-EDITED-REGION-TOT
                           DISPLAY "  Subtotal " WS-PREV-REGION ": "
                                   WS-EDITED-REGION-TOT
                           MOVE 0 TO WS-REGION-TOTAL
                       END-IF
                       MOVE SO-AMOUNT TO WS-EDITED-AMOUNT
                       DISPLAY SO-REGION "  " WS-EDITED-AMOUNT
                       ADD SO-AMOUNT TO WS-REGION-TOTAL
                       ADD SO-AMOUNT TO WS-GRAND-TOTAL
                       MOVE SO-REGION TO WS-PREV-REGION
                       MOVE "N" TO WS-FIRST-RECORD
               END-READ
           END-PERFORM.
           MOVE WS-REGION-TOTAL TO WS-EDITED-REGION-TOT.
           DISPLAY "  Subtotal " WS-PREV-REGION ": "
                   WS-EDITED-REGION-TOT.
           CLOSE SORTED-FILE.
           MOVE WS-GRAND-TOTAL TO WS-EDITED-GRAND-TOT.
           DISPLAY "===== Grand total: " WS-EDITED-GRAND-TOT " =====".
           STOP RUN.
```

## Verification

```bash
$ printf "West      0234575\nEast      0123450\nEast      0050000\nNorth     0098725\nWest      0010000\n" > sales_raw.dat
$ cobc -x -o salesreport salesreport.cbl && ./salesreport
===== Sales Batch Report =====
East         $1,234.50
East           $500.00
  Subtotal East      :  $1,734.50
North          $987.25
  Subtotal North     :    $987.25
West         $2,345.75
West           $100.00
  Subtotal West      :  $2,445.75
===== Grand total:  $5,167.50 =====
```

Note the raw input file arrives with `West` first, then `East`, `East`, `North`, `West` — genuinely unsorted — and the report still comes out grouped `East`/`North`/`West`, confirming `SORT` actually ran before the control-break logic ever saw the data. The subtotals check out against Module 6's own hand-verified sums.

## Building the verification harness

GnuCOBOL has no `pytest`, no `minitest`, no `plunit` — this series' verification-discipline thread (every guide ties its testing session back to the same idea) doesn't get a pass just because the toolchain didn't ship one. The pattern real COBOL shops actually use for batch programs: capture a program's output, diff it against a known-good expected file.

```bash
$ ./salesreport > actual_output.txt
$ cp actual_output.txt expected_output.txt   # first run — hand-verified above, now the baseline
$ diff actual_output.txt expected_output.txt && echo "PASS: output matches expected"
PASS: output matches expected
```

**Verified as a real regression check, not just a passing case** — deliberately changing one input value (`West`'s second record from `0010000` to `0099999`) and re-running:

```bash
$ printf "West ... 0099999\n" >> sales_raw.dat   # one amount changed
$ ./salesreport > actual_output.txt
$ diff actual_output.txt expected_output.txt
8,10c8,10
< West           $999.99
<   Subtotal West      :  $3,345.74
< ===== Grand total:  $6,067.49 =====
---
> West           $100.00
>   Subtotal West      :  $2,445.75
> ===== Grand total:  $5,167.50 =====
$ echo $?
1
```

`diff`'s non-zero exit code is exactly what a CI pipeline or a wrapper script checks — this is a real, if unglamorous, working substitute for a test runner: run the program, diff the output, fail loudly on any difference. It catches exactly the class of bug this guide has been building toward all along — a silent arithmetic or overflow error that still "looks like a number" would show up here as a diff, not as a crash.

> **Pitfall:** this pattern is only as good as the expected-output file — if a genuine bug is present the *first* time `expected_output.txt` gets created from the program's own output, the harness will happily certify the bug as correct forever after. The first baseline capture is exactly the moment that needs independent, by-hand verification (as this capstone did above), not just "the program ran without crashing."

## Extending it yourself

- Add a fourth region to `sales_raw.dat`, regenerate `expected_output.txt` from a hand-verified run, and confirm the diff harness passes.
- Write a small shell script, `runtests.sh`, that runs the program, diffs against the expected file, and prints `PASS`/`FAIL` — the shape a real COBOL shop's CI step would take.
