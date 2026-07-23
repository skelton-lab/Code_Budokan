# Capstone 1 — Loan/Interest Calculator

Combines every concept from Modules 1–3: DIVISION structure, `PIC` clauses and fixed-decimal money, `ACCEPT`/`DISPLAY`, `EVALUATE TRUE`, `PERFORM VARYING`, `COMPUTE ROUNDED`, and `ON SIZE ERROR` guarding every arithmetic statement that touches money.

## The program

Given a principal, an annual interest rate, and a number of years, the program classifies the loan's risk level, then compounds interest year by year, displaying a running balance — guarding every single arithmetic step against overflow, on the principle Module 2 established: an unguarded `COMPUTE` on a financial field doesn't crash on overflow, it silently corrupts.

```cobol
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LOANCALC.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-PRINCIPAL         PIC 9(7)V99.
       01  WS-RATE              PIC 9(2)V99.
       01  WS-YEARS             PIC 9(2).
       01  WS-YEAR-COUNTER      PIC 9(2).
       01  WS-BALANCE           PIC 9(9)V99.
       01  WS-YEAR-INTEREST     PIC 9(7)V99.
       01  WS-TOTAL-INTEREST    PIC 9(9)V99 VALUE 0.
       01  WS-OVERFLOW-FLAG     PIC X VALUE "N".
           88  WS-OVERFLOWED            VALUE "Y".
       01  WS-RISK-LEVEL        PIC X(10).
       PROCEDURE DIVISION.
           DISPLAY "Enter principal: " WITH NO ADVANCING.
           ACCEPT WS-PRINCIPAL.
           DISPLAY "Enter annual rate percent: " WITH NO ADVANCING.
           ACCEPT WS-RATE.
           DISPLAY "Enter number of years: " WITH NO ADVANCING.
           ACCEPT WS-YEARS.

           EVALUATE TRUE
               WHEN WS-RATE >= 15
                   MOVE "HIGH" TO WS-RISK-LEVEL
               WHEN WS-RATE >= 8
                   MOVE "MEDIUM" TO WS-RISK-LEVEL
               WHEN OTHER
                   MOVE "LOW" TO WS-RISK-LEVEL
           END-EVALUATE.
           DISPLAY "Risk level: " WS-RISK-LEVEL.

           MOVE WS-PRINCIPAL TO WS-BALANCE.
           DISPLAY "Year  Interest    Balance".

           PERFORM VARYING WS-YEAR-COUNTER FROM 1 BY 1
                   UNTIL WS-YEAR-COUNTER > WS-YEARS

               COMPUTE WS-YEAR-INTEREST ROUNDED =
                       WS-BALANCE * WS-RATE / 100
                   ON SIZE ERROR
                       SET WS-OVERFLOWED TO TRUE
               END-COMPUTE

               ADD WS-YEAR-INTEREST TO WS-TOTAL-INTEREST
                   ON SIZE ERROR
                       SET WS-OVERFLOWED TO TRUE
               END-ADD

               ADD WS-YEAR-INTEREST TO WS-BALANCE
                   ON SIZE ERROR
                       SET WS-OVERFLOWED TO TRUE
               END-ADD

               DISPLAY WS-YEAR-COUNTER "     " WS-YEAR-INTEREST
                       "   " WS-BALANCE
           END-PERFORM.

           IF WS-OVERFLOWED
               DISPLAY "WARNING: a computation overflowed its field"
           END-IF.

           DISPLAY "Total interest: " WS-TOTAL-INTEREST.
           DISPLAY "Final balance: " WS-BALANCE.
           STOP RUN.
```

## Verification

```bash
$ cobc -x -o loan loan.cbl
$ printf "10000.00\n5.50\n5\n" | ./loan
Enter principal: Enter annual rate percent: Enter number of years: Risk level: LOW       
Year  Interest    Balance
01     0000550.00   000010550.00
02     0000580.25   000011130.25
03     0000612.16   000011742.41
04     0000645.83   000012388.24
05     0000681.35   000013069.59
Total interest: 000003069.59
Final balance: 000013069.59
```

Verified by hand, year by year: `10550 * 0.055 = 580.25` exactly (year 2's interest); `11130.25 * 0.055 = 612.16375`, correctly rounded to `612.16` (year 3) — each year's `ROUNDED` computation checked independently, not just trusted because the program ran without error. The three prompts all appear concatenated on one line because this run piped input from a script rather than a live terminal — `WITH NO ADVANCING` suppresses the newline exactly as designed, it's just that piped input has no interactive echo to visually separate them, unlike typing at a real prompt.

> **Pitfall carried forward from Module 2:** every single `COMPUTE`/`ADD` in the loop has its own `ON SIZE ERROR` clause. Removing even one — say, the `ADD WS-YEAR-INTEREST TO WS-BALANCE` — wouldn't stop the program from running to completion; it would just mean a real overflow at any point in a long-running loan schedule quietly wraps the balance around and continues compounding on a corrupted number, with `WS-OVERFLOWED` never set to warn anyone.

## Extending it yourself

- Add a `WS-MONTHLY-RATE` field and change the loop to compound monthly instead of annually — decide for yourself what `WS-YEARS` should become, and what `PIC` size the loop counter needs.
- Feed the program a principal and rate deliberately chosen to overflow `WS-BALANCE`'s `PIC 9(9)V99` within a small number of years, and confirm the `ON SIZE ERROR` warning actually fires.
